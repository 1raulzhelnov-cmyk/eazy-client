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

    // Set auth session from header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(authHeader);
      if (error || !user) {
        throw new Error('Invalid authentication');
      }
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean).pop();
    const method = req.method;

    console.log(`Admin API: ${method} ${path}`);

    // GET /admin/stats - Dashboard statistics
    if (method === 'GET' && path === 'stats') {
      const { data: { user } } = await supabase.auth.getUser(authHeader);
      
      // Check admin permissions
      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('permissions')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (!adminRole) {
        throw new Error('Admin access required');
      }

      // Fetch dashboard stats
      const [
        { count: totalUsers },
        { count: totalOrders },
        { count: totalRestaurants },
        { count: activeDrivers },
        { count: pendingApplications }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
        supabase.from('drivers').select('*', { count: 'exact', head: true }).eq('status', 'online'),
        supabase.from('driver_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Revenue stats
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const monthlyRevenue = revenueData?.filter(order => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }).reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      return new Response(JSON.stringify({
        users: { total: totalUsers },
        orders: { total: totalOrders },
        restaurants: { total: totalRestaurants },
        drivers: { active: activeDrivers },
        applications: { pending: pendingApplications },
        revenue: { total: totalRevenue, monthly: monthlyRevenue }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/users - List users with pagination
    if (method === 'GET' && path === 'users') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const search = url.searchParams.get('search') || '';
      const offset = (page - 1) * limit;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const { data: users, count, error } = await query;
      if (error) throw error;

      return new Response(JSON.stringify({
        users,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil((count || 0) / limit)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin/users/{id}/status - Update user status
    if (method === 'PUT' && path?.includes('users') && path?.includes('status')) {
      const userId = path.split('/')[2];
      const { is_active, reason } = await req.json();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.rpc('audit_data_access', {
        action_name: 'user_status_update',
        resource_name: 'user_profile',
        resource_identifier: userId,
        additional_details: { is_active, reason }
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/restaurants - List restaurants for approval
    if (method === 'GET' && path === 'restaurants') {
      const status = url.searchParams.get('status') || 'pending';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '25');
      const offset = (page - 1) * limit;

      const { data: restaurants, count, error } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact' })
        .eq('registration_status', status)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({
        restaurants,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil((count || 0) / limit)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin/restaurants/{id}/approve - Approve/reject restaurant
    if (method === 'PUT' && path?.includes('restaurants') && path?.includes('approve')) {
      const restaurantId = path.split('/')[2];
      const { approved, admin_notes } = await req.json();

      const newStatus = approved ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('restaurants')
        .update({ 
          registration_status: newStatus,
          admin_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (error) throw error;

      // Send notification to restaurant owner
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('user_id, business_name')
        .eq('id', restaurantId)
        .single();

      if (restaurant) {
        await supabase.rpc('create_system_notification', {
          target_user_id: restaurant.user_id,
          notification_title: approved ? 'Заявка одобрена' : 'Заявка отклонена',
          notification_message: approved 
            ? `Ваш ресторан "${restaurant.business_name}" был одобрен и активирован`
            : `Ваша заявка на регистрацию ресторана была отклонена. ${admin_notes || ''}`,
          notification_type: approved ? 'success' : 'warning'
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/security-alerts - Security monitoring
    if (method === 'GET' && path === 'security-alerts') {
      const { data: alerts, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(JSON.stringify({ alerts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /admin/system-settings - Update system settings
    if (method === 'POST' && path === 'system-settings') {
      const settings = await req.json();
      
      // Store settings in admin configuration table (would need to create this)
      // For now, just log the action
      const { data: { user } } = await supabase.auth.getUser(authHeader);
      
      await supabase.rpc('audit_data_access', {
        action_name: 'system_settings_update',
        resource_name: 'system_configuration',
        resource_identifier: 'global',
        additional_details: settings
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});