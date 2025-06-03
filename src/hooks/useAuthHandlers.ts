
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateRandomPassword } from "@/utils/passwordUtils";

export const useAuthHandlers = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      await signIn(email, password);
      
      // Check if this might be a temporary password
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
    } catch (error) {
      // Error is already handled in the signUp function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (email: string) => {
    try {
      setIsSubmitting(true);
      
      const tempPassword = generateRandomPassword(12);
      
      const { data: result, error: resetError } = await supabase.functions.invoke('send-temp-password', {
        body: {
          email: email,
          tempPassword: tempPassword,
          fullName: email.split('@')[0],
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
      
      setShowForcePasswordChange(false);
      
      if (showForcePasswordChange) {
        window.location.href = '/';
      } else {
        await supabase.auth.signOut();
      }
    } catch (error) {
      // Error is already handled above
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showForcePasswordChange,
    setShowForcePasswordChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleResetPasswordSubmit,
    handleUpdatePasswordSubmit,
  };
};
