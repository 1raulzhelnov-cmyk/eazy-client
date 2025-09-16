import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const rateLimitKey = `${clientIp}`;
    
    const currentLimit = rateLimitMap.get(rateLimitKey);
    if (currentLimit) {
      if (now < currentLimit.resetTime) {
        if (currentLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded',
            retry_after: Math.ceil((currentLimit.resetTime - now) / 1000)
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        currentLimit.count++;
      } else {
        rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(rateLimitKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean).pop();
    const method = req.method;

    console.log(`Integration API: ${method} ${path}`);

    // POST /webhooks/stripe - Handle Stripe webhooks
    if (method === 'POST' && path === 'stripe-webhook') {
      const signature = req.headers.get('stripe-signature');
      const body = await req.text();
      
      // In production, verify webhook signature
      // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      
      try {
        const event = JSON.parse(body);
        
        console.log(`Stripe webhook: ${event.type}`);

        switch (event.type) {
          case 'payment_intent.succeeded':
            await handlePaymentSuccess(supabase, event.data.object);
            break;
          case 'payment_intent.payment_failed':
            await handlePaymentFailed(supabase, event.data.object);
            break;
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            await handleSubscriptionChange(supabase, event.type, event.data.object);
            break;
          default:
            console.log(`Unhandled webhook event: ${event.type}`);
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // POST /webhooks/delivery-partner - Handle delivery partner webhooks
    if (method === 'POST' && path === 'delivery-partner-webhook') {
      const webhookData = await req.json();
      const { order_id, status, location, estimated_arrival } = webhookData;

      // Update order status based on delivery partner update
      const { error } = await supabase
        .from('orders')
        .update({
          status: mapDeliveryStatus(status),
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id);

      if (error) {
        console.error('Order update error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update order' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Send notification to customer
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', order_id)
        .single();

      if (order) {
        await supabase.rpc('create_system_notification', {
          target_user_id: order.user_id,
          notification_title: 'Обновление доставки',
          notification_message: getStatusMessage(status, estimated_arrival),
          notification_type: 'info'
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /external-api/restaurant-pos - Connect to restaurant POS systems
    if (method === 'POST' && path === 'restaurant-pos') {
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const { restaurant_id, pos_system, api_credentials, sync_menu = true } = await req.json();

      // Store POS integration credentials securely
      const { error } = await supabase
        .from('restaurant_integrations')
        .upsert({
          restaurant_id,
          integration_type: 'pos',
          provider: pos_system,
          credentials: api_credentials, // Should be encrypted in production
          is_active: true,
          settings: { sync_menu, auto_sync: true },
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // If sync_menu is enabled, trigger menu sync
      if (sync_menu) {
        // This would integrate with actual POS APIs
        console.log(`Starting menu sync for restaurant ${restaurant_id} with ${pos_system}`);
        
        // Mock POS menu sync
        await mockPosMenuSync(supabase, restaurant_id, pos_system);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'POS integration configured successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /external-api/marketing-platform - Integrate with marketing platforms
    if (method === 'POST' && path === 'marketing-platform') {
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const { platform, api_key, campaign_settings } = await req.json();

      // Validate API key with the marketing platform
      const isValidKey = await validateMarketingPlatformKey(platform, api_key);
      if (!isValidKey) {
        throw new Error('Invalid API key for marketing platform');
      }

      // Store integration
      const { data: { user } } = await supabase.auth.getUser(authHeader);
      const { error } = await supabase
        .from('marketing_integrations')
        .insert({
          user_id: user?.id,
          platform,
          api_key, // Should be encrypted
          settings: campaign_settings,
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        message: `${platform} integration configured successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /external-api/analytics-export - Export data to analytics platforms
    if (method === 'GET' && path === 'analytics-export') {
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const platform = url.searchParams.get('platform'); // 'google_analytics', 'facebook_pixel', etc.
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      // Fetch relevant data for export
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants(business_name, business_type)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('payment_status', 'completed');

      // Transform data for the specific platform format
      let exportData;
      switch (platform) {
        case 'google_analytics':
          exportData = transformForGoogleAnalytics(orders);
          break;
        case 'facebook_pixel':
          exportData = transformForFacebookPixel(orders);
          break;
        default:
          exportData = orders; // Raw data
      }

      return new Response(JSON.stringify({
        platform,
        period: { start_date: startDate, end_date: endDate },
        data_format: `${platform}_format`,
        records_count: exportData?.length || 0,
        export_data: exportData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /external-api/crm-sync - Sync with CRM systems
    if (method === 'POST' && path === 'crm-sync') {
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const { crm_platform, sync_type, customer_data } = await req.json();

      // Mock CRM sync - in production, this would call actual CRM APIs
      console.log(`Syncing ${sync_type} data with ${crm_platform}`);
      
      const syncResult = await mockCrmSync(crm_platform, sync_type, customer_data);

      return new Response(JSON.stringify({
        success: true,
        crm_platform,
        sync_type,
        synced_records: syncResult.count,
        sync_id: syncResult.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /integration-status - Check status of all integrations
    if (method === 'GET' && path === 'integration-status') {
      if (!authHeader) {
        throw new Error('Authentication required');
      }

      const { data: { user } } = await supabase.auth.getUser(authHeader);

      // Get all integrations for the user/organization
      const [posIntegrations, marketingIntegrations] = await Promise.all([
        supabase
          .from('restaurant_integrations')
          .select('*')
          .eq('restaurant_id', url.searchParams.get('restaurant_id') || ''),
        supabase
          .from('marketing_integrations')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      return new Response(JSON.stringify({
        integrations: {
          pos: posIntegrations.data || [],
          marketing: marketingIntegrations.data || [],
          payment: { stripe: { connected: true, status: 'active' } },
          delivery: { status: 'connected' }
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
    console.error('Integration API error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
async function handlePaymentSuccess(supabase: any, paymentIntent: any) {
  const orderId = paymentIntent.metadata?.order_id;
  if (orderId) {
    await supabase
      .from('orders')
      .update({ payment_status: 'completed', status: 'confirmed' })
      .eq('id', orderId);
  }
}

async function handlePaymentFailed(supabase: any, paymentIntent: any) {
  const orderId = paymentIntent.metadata?.order_id;
  if (orderId) {
    await supabase
      .from('orders')
      .update({ payment_status: 'failed', status: 'cancelled' })
      .eq('id', orderId);
  }
}

async function handleSubscriptionChange(supabase: any, eventType: string, subscription: any) {
  console.log(`Handling subscription ${eventType}:`, subscription.id);
  // Handle subscription changes for premium restaurant features
}

function mapDeliveryStatus(partnerStatus: string): string {
  const statusMap: Record<string, string> = {
    'picked_up': 'picked_up',
    'in_transit': 'in_transit',
    'delivered': 'delivered',
    'failed_delivery': 'delivery_failed'
  };
  return statusMap[partnerStatus] || 'in_transit';
}

function getStatusMessage(status: string, estimatedArrival?: string): string {
  const messages: Record<string, string> = {
    'picked_up': 'Заказ забран курьером',
    'in_transit': `Заказ в пути${estimatedArrival ? `, прибытие примерно в ${estimatedArrival}` : ''}`,
    'delivered': 'Заказ доставлен',
    'failed_delivery': 'Проблема с доставкой, наш менеджер свяжется с вами'
  };
  return messages[status] || 'Обновление статуса доставки';
}

async function mockPosMenuSync(supabase: any, restaurantId: string, posSystem: string) {
  // Mock menu items from POS system
  const mockMenuItems = [
    {
      name: 'Цезарь с курицей',
      description: 'Классический салат с курицей и соусом цезарь',
      price: 12.50,
      category: 'Салаты',
      pos_item_id: 'pos_001'
    },
    {
      name: 'Маргарита',
      description: 'Пицца с томатами, моцареллой и базиликом',
      price: 15.00,
      category: 'Пицца',
      pos_item_id: 'pos_002'
    }
  ];

  for (const item of mockMenuItems) {
    await supabase
      .from('menu_items')
      .upsert({
        restaurant_id: restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        pos_integration_id: item.pos_item_id,
        is_available: true,
        updated_at: new Date().toISOString()
      });
  }
}

async function validateMarketingPlatformKey(platform: string, apiKey: string): Promise<boolean> {
  // Mock validation - in production, make actual API calls to validate
  return apiKey.length > 10;
}

function transformForGoogleAnalytics(orders: any[]) {
  return orders?.map(order => ({
    transaction_id: order.id,
    transaction_date: order.created_at,
    revenue: order.total_amount,
    currency: 'EUR',
    items: order.items?.map((item: any) => ({
      item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
      price: item.price
    }))
  }));
}

function transformForFacebookPixel(orders: any[]) {
  return orders?.map(order => ({
    event_name: 'Purchase',
    event_time: Math.floor(new Date(order.created_at).getTime() / 1000),
    user_data: {
      external_id: order.user_id
    },
    custom_data: {
      currency: 'EUR',
      value: order.total_amount,
      content_ids: order.items?.map((item: any) => item.id)
    }
  }));
}

async function mockCrmSync(platform: string, syncType: string, data: any) {
  // Mock CRM sync result
  return {
    id: `sync_${Date.now()}`,
    count: Array.isArray(data) ? data.length : 1,
    status: 'completed'
  };
}