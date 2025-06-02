
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: string
  table: string
  record: any
  schema: string
  old_record: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: WebhookPayload = await req.json()
    
    // Check if this is an email confirmation event
    if (payload.type === 'UPDATE' && 
        payload.table === 'users' && 
        payload.schema === 'auth' &&
        payload.record.email_confirmed_at !== null && 
        payload.old_record.email_confirmed_at === null) {
      
      console.log('Email confirmed for user:', payload.record.id)
      
      // Get the pending credentials for this user
      const { data: pendingCredentials, error: fetchError } = await supabaseClient
        .from('pending_user_credentials')
        .select('*')
        .eq('user_id', payload.record.id)
        .is('sent_at', null)
        .single()

      if (fetchError) {
        console.error('Error fetching pending credentials:', fetchError)
        return new Response('Error fetching pending credentials', { status: 500 })
      }

      if (!pendingCredentials) {
        console.log('No pending credentials found for user:', payload.record.id)
        return new Response('No pending credentials found', { status: 200 })
      }

      // Send the welcome email with credentials
      const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-welcome-email', {
        body: {
          email: pendingCredentials.email,
          fullName: pendingCredentials.full_name,
          password: pendingCredentials.temporary_password,
          role: pendingCredentials.role,
        },
      })

      if (emailError) {
        console.error('Error sending welcome email:', emailError)
        return new Response('Error sending welcome email', { status: 500 })
      }

      // Mark the credentials as sent
      const { error: updateError } = await supabaseClient
        .from('pending_user_credentials')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', pendingCredentials.id)

      if (updateError) {
        console.error('Error updating sent status:', updateError)
        return new Response('Error updating sent status', { status: 500 })
      }

      console.log('Welcome email sent successfully to:', pendingCredentials.email)
      return new Response('Welcome email sent successfully', { 
        status: 200,
        headers: corsHeaders 
      })
    }

    return new Response('Event not handled', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})
