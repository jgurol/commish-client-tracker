import React, { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
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
import { generateRandomPassword } from "@/utils/passwordUtils";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showUpdatePasswordForm, setShowUpdatePasswordForm] = useState(false);
  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Check for password reset tokens in URL
  useEffect(() => {
    const checkForPasswordReset = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (accessToken && refreshToken && type === 'recovery') {
        setIsCheckingSession(true);
        
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setTokenError('Invalid or expired reset link. Please request a new password reset.');
          } else if (data.session) {
            setShowUpdatePasswordForm(true);
          }
        } catch (error) {
          setTokenError('Failed to process reset link. Please try again.');
        } finally {
          setIsCheckingSession(false);
        }
      }
    };

    checkForPasswordReset();
  }, [searchParams]);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      await signIn(email, password);
      
      // Check if this might be a temporary password by checking if it's exactly 12 characters
      // (our temp passwords are 12 chars) and contains mixed case + numbers
      const isTempPassword = password.length === 12 && 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9]/.test(password);
      
      if (isTempPassword) {
        setShowForcePasswordChange(true);
        toast({
          title: "Password Change Required",
          description: "Please change your temporary password to a secure password of your choice.",
          variant: "destructive"
        });
      }
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
      
      // Generate a temporary password
      const tempPassword = generateRandomPassword(12);
      
      // Use the send-temp-password edge function which handles user verification and admin operations
      const { data: result, error: resetError } = await supabase.functions.invoke('send-temp-password', {
        body: {
          email: email,
          tempPassword: tempPassword,
          fullName: email.split('@')[0], // Use email prefix as fallback name
        },
      });

      if (resetError) {
        console.error('Password reset failed:', resetError);
        toast({
          title: "Password reset failed", 
          description: resetError.message || "Unable to reset password. Please try again.",
          variant: "destructive",
        });
        throw resetError;
      }

      toast({
        title: "Temporary Password Sent",
        description: "Check your email for a temporary password. Use it to log in and change your password.",
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
        description: "Your password has been successfully updated. You can now use your new password.",
      });
      
      window.history.replaceState(null, '', window.location.pathname);
      
      setShowUpdatePasswordForm(false);
      setShowForcePasswordChange(false);
      
      // Don't sign out if it's a forced password change, just redirect
      if (showForcePasswordChange) {
        window.location.href = '/';
      } else {
        await supabase.auth.signOut();
        setActiveTab("login");
      }
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
    setShowForcePasswordChange(false);
    setActiveTab("login");
    window.history.replaceState(null, '', window.location.pathname);
  };

  if (user && !showForcePasswordChange) {
    return <Navigate to="/" />;
  }

  // Render the forced password change form for logged-in users with temp passwords
  if (user && showForcePasswordChange) {
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
              <CardTitle className="text-2xl font-bold">Change Your Password</CardTitle>
              <CardDescription>You must change your temporary password to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <UpdatePasswordForm 
                onUpdatePassword={handleUpdatePasswordSubmit}
                onCancel={handleBackToLogin}
                isSubmitting={isSubmitting}
                tokenError={null}
                isCheckingSession={false}
              />
            </CardContent>
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
              <CardDescription>Enter your email to receive a temporary password</CardDescription>
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
