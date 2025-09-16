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

    console.log(`Real-time Communication API: ${method} ${path}`);

    // POST /create-chat - Create new chat session
    if (method === 'POST' && path === 'create-chat') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const chatData = {
        user_id: user.id,
        type: body.type, // 'support', 'order', 'driver'
        order_id: body.order_id,
        driver_id: body.driver_id,
        status: 'active'
      };

      const { data: chat, error } = await supabase
        .from('chats')
        .insert(chatData)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ chat }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /send-message - Send message in chat
    if (method === 'POST' && path === 'send-message') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const messageData = {
        chat_id: body.chat_id,
        sender_id: user.id,
        sender_type: body.sender_type, // 'user', 'driver', 'support'
        content: body.content,
        message_type: body.message_type || 'text', // 'text', 'image', 'file', 'location'
        file_url: body.file_url,
        file_name: body.file_name,
        file_size: body.file_size
      };

      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (messageError) throw messageError;

      // Update chat last message timestamp
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', body.chat_id);

      // Get chat participants for notifications
      const { data: chat } = await supabase
        .from('chats')
        .select('user_id, driver_id, type')
        .eq('id', body.chat_id)
        .single();

      // Send notifications to other participants
      if (chat) {
        const recipients = [];
        if (chat.user_id && chat.user_id !== user.id) recipients.push(chat.user_id);
        if (chat.driver_id && chat.driver_id !== user.id) recipients.push(chat.driver_id);

        for (const recipientId of recipients) {
          await supabase.rpc('create_system_notification', {
            target_user_id: recipientId,
            notification_title: 'Новое сообщение',
            notification_message: body.content.substring(0, 100),
            notification_type: 'message',
            action_url: `/chat/${body.chat_id}`
          });
        }
      }

      return new Response(JSON.stringify({ message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /chat/{id}/messages - Get chat messages
    if (method === 'GET' && path?.includes('/messages')) {
      const chatId = path.split('/')[0];
      const { limit = '50', offset = '0' } = Object.fromEntries(url.searchParams);
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit))
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (error) throw error;

      return new Response(JSON.stringify({ messages: messages.reverse() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /chats - Get user's chats
    if (method === 'GET' && path === 'chats') {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages (
            content,
            created_at,
            sender_type
          )
        `)
        .or(`user_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get latest message for each chat
      const chatsWithLatestMessage = chats?.map(chat => ({
        ...chat,
        latest_message: chat.messages?.[chat.messages.length - 1] || null
      }));

      return new Response(JSON.stringify({ chats: chatsWithLatestMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /mark-messages-read - Mark messages as read
    if (method === 'POST' && path === 'mark-messages-read') {
      const body = await req.json();
      
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_id', body.chat_id)
        .is('read_at', null);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /update-location - Update driver/user location
    if (method === 'POST' && path === 'update-location') {
      const body = await req.json();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update driver location
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_location: {
            latitude: body.latitude,
            longitude: body.longitude,
            updated_at: new Date().toISOString()
          }
        })
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Real-time Communication Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});