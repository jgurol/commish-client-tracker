
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
    const { targetUserId } = await req.json()

    // Create admin client using service role key
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

    console.log('Attempting to delete user:', targetUserId)

    // First, check if the target user is an owner
    const { data: userProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single()

    if (profileCheckError) {
      console.error('Error checking user profile:', profileCheckError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify user profile: ' + profileCheckError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prevent deletion of owner accounts
    if (userProfile.role === 'owner') {
      console.log('Attempted to delete owner account - blocked')
      return new Response(
        JSON.stringify({ error: 'Owner accounts cannot be deleted' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Delete the user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', targetUserId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user profile: ' + profileError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Profile deleted successfully')

    // Then, delete the auth user using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (authError) {
      console.error('Auth user deletion error:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete auth user: ' + authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Auth user deleted successfully')

    return new Response(
      JSON.stringify({ success: true }),
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
