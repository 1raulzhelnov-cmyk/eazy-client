import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@14.21.0";

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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

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

    console.log(`Financial API: ${method} ${path}`);

    // POST /calculate-commission - Calculate platform commission
    if (method === 'POST' && path === 'calculate-commission') {
      const { order_amount, restaurant_id, driver_id } = await req.json();

      // Get commission rates (could be stored in settings table)
      const PLATFORM_COMMISSION_RATE = 0.15; // 15%
      const DRIVER_COMMISSION_RATE = 0.08; // 8%
      const PAYMENT_PROCESSING_FEE = 0.029; // 2.9% + fixed fee

      const platformCommission = order_amount * PLATFORM_COMMISSION_RATE;
      const driverCommission = order_amount * DRIVER_COMMISSION_RATE;
      const paymentFee = order_amount * PAYMENT_PROCESSING_FEE + 0.30; // $0.30 fixed fee
      
      const restaurantPayout = order_amount - platformCommission - paymentFee;
      const driverPayout = driverCommission;

      return new Response(JSON.stringify({
        order_amount,
        platform_commission: platformCommission,
        driver_commission: driverCommission,
        payment_processing_fee: paymentFee,
        restaurant_payout: restaurantPayout,
        driver_payout: driverPayout,
        breakdown: {
          gross_revenue: order_amount,
          platform_revenue: platformCommission,
          payment_costs: paymentFee,
          driver_costs: driverCommission,
          net_profit: platformCommission - paymentFee
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /process-payout - Process payout to restaurant or driver
    if (method === 'POST' && path === 'process-payout') {
      const { recipient_id, recipient_type, amount, currency = 'eur', description } = await req.json();

      // In a real implementation, you would:
      // 1. Create Stripe Connect accounts for restaurants/drivers
      // 2. Use Stripe transfers to send money
      // 3. Handle different payout methods (bank transfer, etc.)

      // For now, we'll simulate the payout process
      const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Log the payout in our records
      const { error } = await supabase
        .from('payouts')
        .insert({
          payout_id: payoutId,
          recipient_id,
          recipient_type,
          amount,
          currency,
          description,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Payout logging error:', error);
      }

      // Create notification
      await supabase.rpc('create_system_notification', {
        target_user_id: recipient_id,
        notification_title: 'Выплата обрабатывается',
        notification_message: `Ваша выплата на сумму €${amount.toFixed(2)} обрабатывается и поступит на ваш счет в течение 1-3 рабочих дней.`,
        notification_type: 'info'
      });

      return new Response(JSON.stringify({
        success: true,
        payout_id: payoutId,
        status: 'pending',
        estimated_arrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /financial-reports - Generate financial reports
    if (method === 'GET' && path === 'financial-reports') {
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');
      const reportType = url.searchParams.get('type') || 'summary';

      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      // Fetch orders in date range
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants(business_name, business_type)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('payment_status', 'completed');

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group by restaurant
      const restaurantStats = orders?.reduce((acc, order) => {
        const restaurantId = order.restaurant_id;
        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurant_name: order.restaurants?.business_name || 'Unknown',
            business_type: order.restaurants?.business_type || 'Unknown',
            total_orders: 0,
            total_revenue: 0,
            commission_earned: 0
          };
        }
        acc[restaurantId].total_orders++;
        acc[restaurantId].total_revenue += Number(order.total_amount);
        acc[restaurantId].commission_earned += Number(order.total_amount) * 0.15; // 15% commission
        return acc;
      }, {} as Record<string, any>) || {};

      // Daily breakdown
      const dailyBreakdown = orders?.reduce((acc, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { orders: 0, revenue: 0 };
        }
        acc[date].orders++;
        acc[date].revenue += Number(order.total_amount);
        return acc;
      }, {} as Record<string, any>) || {};

      return new Response(JSON.stringify({
        period: { start_date: startDate, end_date: endDate },
        summary: {
          total_revenue: totalRevenue,
          total_orders: totalOrders,
          average_order_value: averageOrderValue,
          platform_commission: totalRevenue * 0.15,
          payment_processing_fees: totalRevenue * 0.029,
          net_profit: totalRevenue * 0.15 - totalRevenue * 0.029
        },
        restaurant_breakdown: Object.values(restaurantStats),
        daily_breakdown: Object.entries(dailyBreakdown).map(([date, stats]) => ({
          date,
          ...stats
        })),
        tax_summary: {
          taxable_income: totalRevenue * 0.15, // Platform commission
          estimated_vat: totalRevenue * 0.15 * 0.20, // 20% VAT on commission
          currency: 'EUR'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /driver-earnings/{driver_id} - Calculate driver earnings
    if (method === 'GET' && path?.includes('driver-earnings')) {
      const driverId = path.split('/')[1];
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('orders')
        .select('*')
        .eq('driver_id', driverId)
        .eq('status', 'delivered');

      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data: deliveredOrders, error } = await query;
      if (error) throw error;

      const totalEarnings = deliveredOrders?.reduce((sum, order) => {
        // Driver gets 8% commission + tips
        const baseCommission = Number(order.total_amount) * 0.08;
        const tips = Number(order.customer_info?.tip || 0);
        return sum + baseCommission + tips;
      }, 0) || 0;

      const totalDeliveries = deliveredOrders?.length || 0;
      const avgEarningsPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

      return new Response(JSON.stringify({
        driver_id: driverId,
        period: startDate && endDate ? { start_date: startDate, end_date: endDate } : null,
        summary: {
          total_earnings: totalEarnings,
          total_deliveries: totalDeliveries,
          average_per_delivery: avgEarningsPerDelivery,
          commission_earned: deliveredOrders?.reduce((sum, order) => sum + Number(order.total_amount) * 0.08, 0) || 0,
          tips_earned: deliveredOrders?.reduce((sum, order) => sum + Number(order.customer_info?.tip || 0), 0) || 0
        },
        deliveries: deliveredOrders?.map(order => ({
          order_id: order.id,
          delivery_date: order.delivered_at,
          order_amount: order.total_amount,
          commission: Number(order.total_amount) * 0.08,
          tip: Number(order.customer_info?.tip || 0),
          total_earned: Number(order.total_amount) * 0.08 + Number(order.customer_info?.tip || 0)
        }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /tax-documents - Generate tax documents
    if (method === 'GET' && path === 'tax-documents') {
      const year = url.searchParams.get('year') || new Date().getFullYear().toString();
      const entityId = url.searchParams.get('entity_id'); // restaurant or driver ID
      const entityType = url.searchParams.get('entity_type'); // 'restaurant' or 'driver'

      if (!entityId || !entityType) {
        throw new Error('Entity ID and type are required');
      }

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      // This would generate tax documents (1099, etc.)
      // For now, return structured tax data
      return new Response(JSON.stringify({
        tax_year: year,
        entity_id: entityId,
        entity_type: entityType,
        document_type: entityType === 'restaurant' ? '1099-MISC' : '1099-NEC',
        generated_at: new Date().toISOString(),
        tax_data: {
          total_income: 0, // Would calculate from actual data
          business_expenses: 0,
          net_income: 0,
          tax_withheld: 0
        },
        note: 'Tax document generation would be implemented with proper tax calculation logic'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Financial API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});