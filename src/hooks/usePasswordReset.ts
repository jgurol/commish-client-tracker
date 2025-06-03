
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const usePasswordReset = () => {
  const [showResetForm, setShowResetForm] = useState(false);
  const [showUpdatePasswordForm, setShowUpdatePasswordForm] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [searchParams] = useSearchParams();

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

  const handleBackToLogin = () => {
    setTokenError(null);
    setShowUpdatePasswordForm(false);
    setShowResetForm(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  return {
    showResetForm,
    setShowResetForm,
    showUpdatePasswordForm,
    setShowUpdatePasswordForm,
    tokenError,
    isCheckingSession,
    handleBackToLogin,
  };
};
