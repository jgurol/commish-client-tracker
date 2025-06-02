
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, fullName, role, associatedAgentId } = await req.json()

    // Create admin client using service role key from secrets
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Creating user with admin client')

    // Create the user account using the admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: {
        full_name: fullName,
      },
      email_confirm: true
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      
      // Handle the specific case where email exists but user was recently deleted
      if (authError.message.includes('A user with this email address has already been registered')) {
        return new Response(
          JSON.stringify({ 
            error: 'A user with this email was recently deleted. Please wait a few minutes before recreating the user, or try with a different email address.' 
          }),
          { 
            status: 422, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'No user data returned' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth user created successfully, ID:', authData.user.id)

    // Create the profile record with corrected is_associated logic
    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: role,
      associated_agent_id: associatedAgentId === "none" ? null : associatedAgentId,
      is_associated: associatedAgentId && associatedAgentId !== "none" ? true : false
    }

    console.log('Creating profile with data:', profileData)

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)

    if (profileError) {
      console.error('Profile creation error:', profileError)
      
      // Clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.log('Cleaned up auth user after profile creation failure')
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }
      
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Profile created successfully')

    // Send welcome email with credentials
    try {
      const { error: emailError } = await supabaseAdmin.functions.invoke('send-welcome-email', {
        body: {
          email: email,
          fullName: fullName,
          password: password,
          role: role,
        },
      })

      if (emailError) {
        console.error('Welcome email error:', emailError)
      } else {
        console.log('Welcome email sent successfully')
      }
    } catch (emailError) {
      console.error('Email function invocation error:', emailError)
    }

    return new Response(
      JSON.stringify({ 
        user: {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: role,
          is_associated: profileData.is_associated,
          created_at: new Date().toISOString(),
          associated_agent_id: profileData.associated_agent_id,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
