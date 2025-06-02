import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

const Auth = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showUpdatePasswordForm, setShowUpdatePasswordForm] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  // Check for email confirmation or password reset tokens
  useEffect(() => {
    const checkForTokens = async () => {
      const searchParams = new URLSearchParams(location.search);
      const hash = window.location.hash;
      
      // Check for email confirmation code
      const confirmationCode = searchParams.get('code');
      if (confirmationCode) {
        setIsConfirmingEmail(true);
        try {
          console.log('Processing email confirmation...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: confirmationCode,
            type: 'email'
          });
          
          if (error) {
            console.error('Email confirmation error:', error);
            toast({
              title: "Email Confirmation Failed", 
              description: error.message || "Failed to confirm email address",
              variant: "destructive"
            });
          } else if (data.user) {
            console.log('Email confirmed successfully for user:', data.user.id);
            toast({
              title: "Email Confirmed!",
              description: "Your email has been confirmed successfully. You can now log in.",
            });
            
            // Clear the confirmation code from URL
            window.history.replaceState(null, '', window.location.pathname);
            setActiveTab("login");
          }
        } catch (err) {
          console.error('Unexpected error during email confirmation:', err);
          toast({
            title: "Confirmation Error",
            description: "An unexpected error occurred during email confirmation",
            variant: "destructive"
          });
        } finally {
          setIsConfirmingEmail(false);
          setIsCheckingSession(false);
        }
        return;
      }
      
      // Check for password reset token
      if (hash && hash.includes('type=recovery')) {
        setShowUpdatePasswordForm(true);
        setActiveTab("none"); // Ensure tabs don't show
        setIsCheckingSession(true);
        
        try {
          // Clear any prior token errors
          setTokenError(null);
          
          // Parse the URL hash to get access token
          const accessToken = new URLSearchParams(hash.substring(1)).get('access_token');
          const refreshToken = new URLSearchParams(hash.substring(1)).get('refresh_token');
          
          if (!accessToken) {
            setTokenError("Missing access token in recovery link. Please request a new one.");
            setIsCheckingSession(false);
            return;
          }
          
          // Set the session with the token from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            setTokenError(error.message || "Invalid or expired password reset link");
            toast({
              title: "Reset Link Error",
              description: error.message || "The password reset link is invalid or has expired",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Reset Link Valid",
              description: "Please enter your new password",
            });
          }
        } catch (err) {
          setTokenError("An unexpected error occurred");
        } finally {
          setIsCheckingSession(false);
        }
      } else {
        setIsCheckingSession(false);
      }
    };
    
    // Run the token check
    checkForTokens();
  }, [location.search, toast]);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      await signIn(email, password);
    } catch (error) {
      // Error is already handled in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (email: string, password: string, fullName: string) => {
    try {
      setIsSubmitting(true);
      await signUp(email, password, fullName);
      setActiveTab("login");
    } catch (error) {
      // Error is already handled in the signUp function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (email: string) => {
    try {
      setIsSubmitting(true);
      
      // Get the fully qualified URL with deployment domain
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a password reset link",
      });
      setShowResetForm(false);
      setActiveTab("login");
    } catch (error) {
      // Error is already handled above
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdatePasswordSubmit = async (password: string) => {
    try {
      setIsSubmitting(true);
      
      // Get the current session to verify we have the right context
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Session Error",
          description: "No active session found. Please try the reset link again.",
          variant: "destructive"
        });
        throw new Error("No active session");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        toast({
          title: "Failed to update password",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. You can now log in with your new password.",
      });
      
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      
      // Force user to log in with new password
      await supabase.auth.signOut();
      
      setShowUpdatePasswordForm(false);
      setActiveTab("login");
    } catch (error) {
      // Error is already handled above
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setTokenError(null);
    setShowUpdatePasswordForm(false);
    setShowResetForm(false);
    setActiveTab("login");
    // Clear the hash from URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  if (user) {
    return <Navigate to="/" />;
  }

  // Show loading state during email confirmation
  if (isConfirmingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src="/lovable-uploads/e5be9154-ed00-490e-b242-16319351487f.png" 
                  alt="California Telecom" 
                  className="h-16 w-auto"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Confirming Email...</CardTitle>
              <CardDescription>Please wait while we confirm your email address</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Render the password update form
  if (showUpdatePasswordForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src="/lovable-uploads/e5be9154-ed00-490e-b242-16319351487f.png" 
                  alt="California Telecom" 
                  className="h-16 w-auto"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>Please enter your new password</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePasswordForm 
                onUpdatePassword={handleUpdatePasswordSubmit}
                onCancel={handleBackToLogin}
                isSubmitting={isSubmitting}
                tokenError={tokenError}
                isCheckingSession={isCheckingSession}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the password reset form
  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img 
                  src="/lovable-uploads/e5be9154-ed00-490e-b242-16319351487f.png" 
                  alt="California Telecom" 
                  className="h-16 w-auto"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>Enter your email to receive a password reset link</CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm 
                onResetPassword={handleResetPasswordSubmit}
                onCancel={() => setShowResetForm(false)}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render the login/register tabs
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/e5be9154-ed00-490e-b242-16319351487f.png" 
                alt="California Telecom" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Commission Tracker</CardTitle>
            <CardDescription>Sign in to manage your commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm 
                  onLogin={handleLoginSubmit}
                  onForgotPassword={() => setShowResetForm(true)}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm
                  onRegister={handleRegisterSubmit}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
