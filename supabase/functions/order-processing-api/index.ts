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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    console.log(`Order API: ${method} ${path}`);

    // POST /create-order - Create new order
    if (method === 'POST' && path === 'create-order') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        items: body.items,
        total_amount: body.total_amount,
        delivery_address: body.delivery_address,
        customer_info: body.customer_info,
        restaurant_id: body.restaurant_id,
        special_instructions: body.special_instructions,
        payment_method: body.payment_method || 'card',
        estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create notification for restaurant
      await supabase.rpc('create_system_notification', {
        target_user_id: body.restaurant_user_id,
        notification_title: 'Новый заказ',
        notification_message: `Получен новый заказ #${orderNumber}`,
        notification_type: 'order',
        related_order_id: order.id
      });

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /update-order-status - Update order status
    if (method === 'PUT' && path === 'update-order-status') {
      const body = await req.json();
      
      const updateData: any = { 
        status: body.status,
        updated_at: new Date().toISOString()
      };

      // Set timestamps based on status
      switch (body.status) {
        case 'preparing':
          updateData.confirmed_at = new Date().toISOString();
          break;
        case 'ready':
          updateData.ready_at = new Date().toISOString();
          break;
        case 'picked_up':
          updateData.pickup_time = new Date().toISOString();
          updateData.delivery_started_at = new Date().toISOString();
          updateData.driver_id = body.driver_id;
          break;
        case 'delivered':
          updateData.delivered_at = new Date().toISOString();
          break;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', body.order_id)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create notification for customer
      const statusMessages = {
        confirmed: 'Ваш заказ подтвержден',
        preparing: 'Ваш заказ готовится',
        ready: 'Ваш заказ готов к получению',
        picked_up: 'Курьер забрал ваш заказ',
        in_transit: 'Ваш заказ в пути',
        delivered: 'Ваш заказ доставлен'
      };

      if (statusMessages[body.status as keyof typeof statusMessages]) {
        await supabase.rpc('create_system_notification', {
          target_user_id: order.user_id,
          notification_title: 'Обновление заказа',
          notification_message: statusMessages[body.status as keyof typeof statusMessages],
          notification_type: 'order_update',
          related_order_id: order.id
        });
      }

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /order/{id} - Get specific order
    if (method === 'GET' && path?.startsWith('order/')) {
      const orderId = path.split('/')[1];
      
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (business_name, phone, address)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /orders - Get orders with filters
    if (method === 'GET' && path === 'orders') {
      const { user_id, restaurant_id, driver_id, status } = Object.fromEntries(url.searchParams);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurants (business_name, phone, address)
        `)
        .order('created_at', { ascending: false });

      if (user_id) query = query.eq('user_id', user_id);
      if (restaurant_id) query = query.eq('restaurant_id', restaurant_id);
      if (driver_id) query = query.eq('driver_id', driver_id);
      if (status) query = query.eq('status', status);

      const { data: orders, error } = await query;
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /assign-driver - Assign driver to order
    if (method === 'POST' && path === 'assign-driver') {
      const body = await req.json();
      
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          driver_id: body.driver_id,
          status: 'accepted'
        })
        .eq('id', body.order_id)
        .select()
        .single();

      if (error) throw error;

      // Notify customer
      await supabase.rpc('create_system_notification', {
        target_user_id: order.user_id,
        notification_title: 'Курьер назначен',
        notification_message: 'К вашему заказу назначен курьер',
        notification_type: 'driver_assigned',
        related_order_id: order.id
      });

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /cancel-order - Cancel order
    if (method === 'POST' && path === 'cancel-order') {
      const body = await req.json();
      
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancellation_reason: body.reason
        })
        .eq('id', body.order_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Order API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});