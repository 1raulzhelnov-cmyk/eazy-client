import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create a service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin permissions
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_roles')
      .select('permissions')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify specific permission
    const hasApprovalPermission = adminCheck.permissions?.approve_applications === true
    if (!hasApprovalPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to approve applications' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { applicationId, approved, adminNotes } = await req.json()

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: 'Application ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the application details
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('driver_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update application status
    const { error: updateError } = await supabaseAdmin
      .from('driver_applications')
      .update({
        status: approved ? 'approved' : 'rejected',
        admin_notes: adminNotes || null
      })
      .eq('id', applicationId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update application status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If approved, create driver record
    if (approved) {
      const { error: driverError } = await supabaseAdmin
        .from('drivers')
        .insert({
          user_id: application.user_id,
          first_name: application.first_name,
          last_name: application.last_name,
          phone: application.phone,
          email: application.email,
          vehicle_type: application.vehicle_type,
          license_plate: application.license_plate,
          status: 'offline',
          is_verified: true,
          is_active: true,
          rating: 5.0,
          total_deliveries: 0
        })

      if (driverError) {
        console.error('Error creating driver:', driverError)
        return new Response(
          JSON.stringify({ error: 'Failed to create driver profile' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Send notification to user using secure function
      const { error: notificationError } = await supabaseAdmin.rpc('create_system_notification', {
        target_user_id: application.user_id,
        notification_title: 'Заявка одобрена!',
        notification_message: 'Поздравляем! Ваша заявка на работу курьером была одобрена. Теперь вы можете начать принимать заказы.',
        notification_type: 'success'
      })

      if (notificationError) {
        console.error('Failed to send approval notification:', notificationError)
      }
    } else {
      // Send rejection notification using secure function
      const { error: notificationError } = await supabaseAdmin.rpc('create_system_notification', {
        target_user_id: application.user_id,
        notification_title: 'Заявка отклонена',
        notification_message: `К сожалению, ваша заявка на работу курьером была отклонена. ${adminNotes ? `Причина: ${adminNotes}` : ''}`,
        notification_type: 'error'
      })

      if (notificationError) {
        console.error('Failed to send rejection notification:', notificationError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: approved ? 'Application approved and driver created' : 'Application rejected'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})