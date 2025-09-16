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

    // Create a service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

      // Send notification to user
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: application.user_id,
          title: 'Заявка одобрена!',
          message: 'Поздравляем! Ваша заявка на работу курьером была одобрена. Теперь вы можете начать принимать заказы.',
          type: 'success'
        })
    } else {
      // Send rejection notification
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: application.user_id,
          title: 'Заявка отклонена',
          message: `К сожалению, ваша заявка на работу курьером была отклонена. ${adminNotes ? `Причина: ${adminNotes}` : ''}`,
          type: 'error'
        })
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