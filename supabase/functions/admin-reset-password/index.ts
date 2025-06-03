
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminResetPasswordRequest {
  targetUserId: string;
  targetUserEmail: string;
  tempPassword: string;
  adminUserId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { targetUserId, targetUserEmail, tempPassword, adminUserId }: AdminResetPasswordRequest = await req.json();

    console.log("Admin reset password request:", { targetUserId, targetUserEmail, adminUserId });

    // Verify the requesting user is an admin
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminUserId)
      .single();

    if (adminError || !adminProfile || (adminProfile.role !== 'admin' && adminProfile.role !== 'owner')) {
      console.error('Unauthorized admin reset attempt:', adminError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Reset the user's password using admin privileges
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email with temporary password
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const emailResponse = await resend.emails.send({
      from: "California Telecom <noreply@californiatelecom.com>",
      to: [targetUserEmail],
      subject: "Your Temporary Password - California Telecom",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Password Reset by Administrator</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Your password has been reset by an administrator. Here is your temporary password:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #333;"><strong>Email:</strong> ${targetUserEmail}</p>
            <p style="margin: 10px 0 0 0; color: #333; font-size: 18px;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">🔒 Important Security Notice</p>
            <p style="margin: 10px 0 0 0; color: #856404;">
              Please log in with this temporary password and <strong>immediately change it</strong> to a secure password of your choice.
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            If you did not expect this password reset, please contact support immediately.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-top: 30px;">
            Best regards,<br>
            The California Telecom Team
          </p>
        </div>
      `,
    });

    console.log("Password reset successful, email sent:", emailResponse);

    // Log the admin action
    await supabaseAdmin.rpc('log_admin_action', {
      action_type: 'ADMIN_RESET_PASSWORD',
      table_name: 'profiles',
      record_id: targetUserId,
      details: {
        target_user_id: targetUserId,
        target_user_email: targetUserEmail,
        admin_user_id: adminUserId
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in admin-reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
