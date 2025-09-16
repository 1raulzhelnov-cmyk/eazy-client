import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(authHeader);
      if (error || !user) {
        throw new Error('Authentication required');
      }
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean).pop();
    const method = req.method;

    console.log(`Promotion API: ${method} ${path}`);

    // POST /create-promo-code - Create new promo code
    if (method === 'POST' && path === 'create-promo-code') {
      const { 
        code, 
        discount_type, // 'percentage' or 'fixed'
        discount_value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        expiry_date,
        applicable_to, // 'all', 'restaurant', 'category'
        target_id,
        description,
        is_public = true
      } = await req.json();

      // Validate promo code format
      if (!code || code.length < 3) {
        throw new Error('Promo code must be at least 3 characters long');
      }

      // Check if code already exists
      const { data: existingCode } = await supabase
        .from('promo_codes')
        .select('id')
        .eq('code', code.toUpperCase())
        .single();

      if (existingCode) {
        throw new Error('Promo code already exists');
      }

      // Create promo code
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .insert({
          code: code.toUpperCase(),
          discount_type,
          discount_value,
          min_order_amount: min_order_amount || 0,
          max_discount_amount,
          usage_limit,
          current_usage: 0,
          expiry_date,
          applicable_to,
          target_id,
          description,
          is_active: true,
          is_public,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        promo_code: promoCode
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /validate-promo-code - Validate and calculate discount
    if (method === 'POST' && path === 'validate-promo-code') {
      const { 
        code, 
        order_amount, 
        restaurant_id, 
        user_id,
        items = [] 
      } = await req.json();

      // Find promo code
      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promoError || !promoCode) {
        return new Response(JSON.stringify({
          valid: false,
          error: 'Promo code not found or expired'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check expiry
      if (promoCode.expiry_date && new Date(promoCode.expiry_date) < new Date()) {
        return new Response(JSON.stringify({
          valid: false,
          error: 'Promo code has expired'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check usage limit
      if (promoCode.usage_limit && promoCode.current_usage >= promoCode.usage_limit) {
        return new Response(JSON.stringify({
          valid: false,
          error: 'Promo code usage limit reached'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check minimum order amount
      if (order_amount < promoCode.min_order_amount) {
        return new Response(JSON.stringify({
          valid: false,
          error: `Minimum order amount is €${promoCode.min_order_amount}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check applicability
      let applicable = true;
      if (promoCode.applicable_to === 'restaurant' && promoCode.target_id !== restaurant_id) {
        applicable = false;
      }

      if (!applicable) {
        return new Response(JSON.stringify({
          valid: false,
          error: 'Promo code not applicable to this order'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if user already used this code (for single-use codes)
      const { data: userUsage } = await supabase
        .from('promo_code_usage')
        .select('id')
        .eq('promo_code_id', promoCode.id)
        .eq('user_id', user_id)
        .single();

      if (userUsage && promoCode.usage_limit === 1) {
        return new Response(JSON.stringify({
          valid: false,
          error: 'You have already used this promo code'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (promoCode.discount_type === 'percentage') {
        discountAmount = order_amount * (promoCode.discount_value / 100);
      } else if (promoCode.discount_type === 'fixed') {
        discountAmount = promoCode.discount_value;
      }

      // Apply maximum discount limit
      if (promoCode.max_discount_amount && discountAmount > promoCode.max_discount_amount) {
        discountAmount = promoCode.max_discount_amount;
      }

      // Ensure discount doesn't exceed order amount
      if (discountAmount > order_amount) {
        discountAmount = order_amount;
      }

      return new Response(JSON.stringify({
        valid: true,
        promo_code: promoCode,
        discount_amount: discountAmount,
        final_amount: order_amount - discountAmount,
        savings: discountAmount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /apply-promo-code - Apply promo code to order (record usage)
    if (method === 'POST' && path === 'apply-promo-code') {
      const { 
        code, 
        order_id, 
        user_id, 
        discount_amount 
      } = await req.json();

      // Get promo code
      const { data: promoCode, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (promoError || !promoCode) {
        throw new Error('Promo code not found');
      }

      // Record usage
      const { error: usageError } = await supabase
        .from('promo_code_usage')
        .insert({
          promo_code_id: promoCode.id,
          user_id,
          order_id,
          discount_amount,
          used_at: new Date().toISOString()
        });

      if (usageError) throw usageError;

      // Update current usage count
      const { error: updateError } = await supabase
        .from('promo_codes')
        .update({
          current_usage: promoCode.current_usage + 1
        })
        .eq('id', promoCode.id);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        message: 'Promo code applied successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /active-promotions - Get active promotions for user
    if (method === 'GET' && path === 'active-promotions') {
      const restaurant_id = url.searchParams.get('restaurant_id');
      const user_id = url.searchParams.get('user_id');

      let query = supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .gt('expiry_date', new Date().toISOString());

      // Filter by restaurant if specified
      if (restaurant_id) {
        query = query.or(`applicable_to.eq.all,and(applicable_to.eq.restaurant,target_id.eq.${restaurant_id})`);
      }

      const { data: promotions, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out promotions user has already used (for single-use codes)
      let availablePromotions = promotions;
      if (user_id) {
        const { data: userUsage } = await supabase
          .from('promo_code_usage')
          .select('promo_code_id')
          .eq('user_id', user_id);

        const usedPromoIds = new Set(userUsage?.map(u => u.promo_code_id) || []);
        availablePromotions = promotions?.filter(promo => 
          promo.usage_limit !== 1 || !usedPromoIds.has(promo.id)
        ) || [];
      }

      return new Response(JSON.stringify({
        promotions: availablePromotions?.map(promo => ({
          id: promo.id,
          code: promo.code,
          description: promo.description,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          min_order_amount: promo.min_order_amount,
          max_discount_amount: promo.max_discount_amount,
          expiry_date: promo.expiry_date,
          applicable_to: promo.applicable_to
        }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/promotion-analytics - Analytics for promotions
    if (method === 'GET' && path === 'promotion-analytics') {
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('promo_code_usage')
        .select(`
          *,
          promo_codes(code, discount_type, discount_value),
          orders(total_amount)
        `);

      if (startDate && endDate) {
        query = query.gte('used_at', startDate).lte('used_at', endDate);
      }

      const { data: usage, error } = await query;
      if (error) throw error;

      // Calculate analytics
      const totalDiscount = usage?.reduce((sum, u) => sum + Number(u.discount_amount), 0) || 0;
      const totalOrders = usage?.length || 0;
      const averageDiscount = totalOrders > 0 ? totalDiscount / totalOrders : 0;

      // Group by promo code
      const promoStats = usage?.reduce((acc, u) => {
        const code = u.promo_codes?.code;
        if (!acc[code]) {
          acc[code] = {
            code,
            usage_count: 0,
            total_discount: 0,
            total_order_value: 0
          };
        }
        acc[code].usage_count++;
        acc[code].total_discount += Number(u.discount_amount);
        acc[code].total_order_value += Number(u.orders?.total_amount || 0);
        return acc;
      }, {} as Record<string, any>) || {};

      return new Response(JSON.stringify({
        period: startDate && endDate ? { start_date: startDate, end_date: endDate } : null,
        summary: {
          total_promotions_used: totalOrders,
          total_discount_given: totalDiscount,
          average_discount: averageDiscount,
          promotion_conversion_rate: 0 // Would need order data to calculate
        },
        promo_performance: Object.values(promoStats)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Promotion API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});