
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  password: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, password, role }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Admin <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome! Your account has been created",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Welcome to our platform!</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hello ${fullName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Your account has been created successfully. Here are your login credentials:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #333;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0; color: #333;"><strong>Temporary Password:</strong> ${password}</p>
            <p style="margin: 10px 0 0 0; color: #333;"><strong>Role:</strong> ${role}</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ Important Security Notice</p>
            <p style="margin: 10px 0 0 0; color: #856404;">
              Please change your password immediately after your first login for security purposes.
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            You can now log in to your account and start using the platform.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-top: 30px;">
            Best regards,<br>
            The Admin Team
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
