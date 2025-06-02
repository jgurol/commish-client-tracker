
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TempPasswordRequest {
  email: string;
  tempPassword: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tempPassword, fullName }: TempPasswordRequest = await req.json();

    console.log("Sending temporary password email to:", email);

    const emailResponse = await resend.emails.send({
      from: "California Telecom <noreply@californiatelecom.com>",
      to: [email],
      subject: "Your Temporary Password - California Telecom",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Temporary Password Reset</h1>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hello ${fullName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We've reset your password as requested. Here is your temporary password:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #333;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0; color: #333; font-size: 18px;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-weight: bold;">🔒 Important Security Notice</p>
            <p style="margin: 10px 0 0 0; color: #856404;">
              Please log in with this temporary password and <strong>immediately change it</strong> to a secure password of your choice. This temporary password will work until you change it.
            </p>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            If you did not request this password reset, please contact support immediately.
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-top: 30px;">
            Best regards,<br>
            The California Telecom Team
          </p>
        </div>
      `,
    });

    console.log("Temporary password email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-temp-password function:", error);
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
