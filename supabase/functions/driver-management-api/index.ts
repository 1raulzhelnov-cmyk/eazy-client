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

    console.log(`Driver Management API: ${method} ${path}`);

    // GET /available-drivers - Get available drivers for order assignment
    if (method === 'GET' && path === 'available-drivers') {
      const { latitude, longitude, radius = '10' } = Object.fromEntries(url.searchParams);
      
      let query = supabase
        .from('drivers')
        .select('*')
        .eq('status', 'online')
        .eq('is_active', true)
        .eq('is_verified', true);

      const { data: drivers, error } = await query;
      
      if (error) throw error;

      // Filter by location if coordinates provided
      let filteredDrivers = drivers;
      if (latitude && longitude) {
        filteredDrivers = drivers?.filter(driver => {
          if (!driver.current_location) return false;
          
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            driver.current_location.latitude,
            driver.current_location.longitude
          );
          
          return distance <= parseFloat(radius);
        }) || [];
      }

      return new Response(JSON.stringify({ drivers: filteredDrivers }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /update-driver-status - Update driver online/offline status
    if (method === 'POST' && path === 'update-driver-status') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: driver, error } = await supabase
        .from('drivers')
        .update({ 
          status: body.status,
          current_location: body.location || null
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ driver }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /driver-orders - Get orders assigned to driver
    if (method === 'GET' && path === 'driver-orders') {
      const { status } = Object.fromEntries(url.searchParams);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurants (business_name, phone, address)
        `)
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: orders, error } = await query;
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /accept-order - Driver accepts an order
    if (method === 'POST' && path === 'accept-order') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if order is still available
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('driver_id, status')
        .eq('id', body.order_id)
        .single();

      if (existingOrder?.driver_id || existingOrder?.status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Order no longer available' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          driver_id: user.id,
          status: 'accepted'
        })
        .eq('id', body.order_id)
        .select(`
          *,
          restaurants (business_name, phone, address)
        `)
        .single();

      if (error) throw error;

      // Notify customer
      await supabase.rpc('create_system_notification', {
        target_user_id: order.user_id,
        notification_title: 'Заказ принят',
        notification_message: 'Ваш заказ принят курьером',
        notification_type: 'order_update',
        related_order_id: order.id
      });

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /update-delivery-status - Update delivery status and location
    if (method === 'POST' && path === 'update-delivery-status') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updateData: any = { 
        status: body.status
      };

      // Set timestamps based on status
      if (body.status === 'picked_up') {
        updateData.pickup_time = new Date().toISOString();
        updateData.delivery_started_at = new Date().toISOString();
      } else if (body.status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', body.order_id)
        .eq('driver_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update driver location if provided
      if (body.location) {
        await supabase
          .from('drivers')
          .update({ 
            current_location: {
              latitude: body.location.latitude,
              longitude: body.location.longitude,
              updated_at: new Date().toISOString()
            }
          })
          .eq('user_id', user.id);
      }

      // Notify customer of status change
      const statusMessages = {
        'picked_up': 'Курьер забрал ваш заказ',
        'in_transit': 'Ваш заказ в пути',
        'delivered': 'Ваш заказ доставлен'
      };

      if (statusMessages[body.status as keyof typeof statusMessages]) {
        await supabase.rpc('create_system_notification', {
          target_user_id: order.user_id,
          notification_title: 'Обновление доставки',
          notification_message: statusMessages[body.status as keyof typeof statusMessages],
          notification_type: 'delivery_update',
          related_order_id: order.id
        });
      }

      return new Response(JSON.stringify({ order }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /driver-stats - Get driver statistics
    if (method === 'GET' && path === 'driver-stats') {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get driver info
      const { data: driver } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get delivery stats
      const { data: deliveries } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('driver_id', user.id);

      const completedDeliveries = deliveries?.filter(d => d.status === 'delivered') || [];
      const totalEarnings = completedDeliveries.reduce((sum, d) => sum + (d.total_amount * 0.1), 0); // 10% commission
      const todayEarnings = completedDeliveries
        .filter(d => new Date(d.created_at).toDateString() === new Date().toDateString())
        .reduce((sum, d) => sum + (d.total_amount * 0.1), 0);

      return new Response(JSON.stringify({ 
        driver,
        stats: {
          total_deliveries: completedDeliveries.length,
          total_earnings: totalEarnings,
          today_earnings: todayEarnings,
          rating: driver?.rating || 5.0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Driver Management Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}