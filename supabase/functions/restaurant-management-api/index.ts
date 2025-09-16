import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.replace('Bearer ', ''),
        refresh_token: '',
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;

    console.log(`Restaurant API: ${method} ${path}`);

    // GET /restaurants - List restaurants with filters
    if (method === 'GET' && path === 'restaurants') {
      const { business_type, is_active, rating_min } = Object.fromEntries(url.searchParams);
      
      let query = supabase
        .from('restaurants')
        .select('*');

      if (business_type) query = query.eq('business_type', business_type);
      if (is_active) query = query.eq('is_active', is_active === 'true');
      if (rating_min) query = query.gte('rating', parseFloat(rating_min));

      const { data, error } = await query;
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ restaurants: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /restaurant/{id} - Get specific restaurant with menu
    if (method === 'GET' && path?.startsWith('restaurant/')) {
      const restaurantId = path.split('/')[1];
      
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) throw restaurantError;

      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select(`
          *,
          menu_items (
            *,
            menu_item_images (*)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      return new Response(JSON.stringify({ 
        restaurant, 
        menu: categories 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /restaurant - Create/Update restaurant
    if (method === 'POST' && path === 'restaurant') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const restaurantData = {
        ...body,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('restaurants')
        .upsert(restaurantData)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ restaurant: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /menu-item - Add/Update menu item
    if (method === 'POST' && path === 'menu-item') {
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('menu_items')
        .upsert(body)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ menu_item: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /menu-item/{id} - Delete menu item
    if (method === 'DELETE' && path?.startsWith('menu-item/')) {
      const itemId = path.split('/')[1];
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /restaurant/{id}/status - Update restaurant status
    if (method === 'PUT' && path?.includes('/status')) {
      const restaurantId = path.split('/')[1];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from('restaurants')
        .update({ 
          is_open: body.is_open,
          registration_status: body.registration_status 
        })
        .eq('id', restaurantId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ restaurant: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Restaurant API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});