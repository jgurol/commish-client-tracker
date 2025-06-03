
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { useAuthHandlers } from "@/hooks/useAuthHandlers";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user } = useAuth();
  
  const {
    isSubmitting,
    showForcePasswordChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleResetPasswordSubmit,
    handleUpdatePasswordSubmit,
  } = useAuthHandlers();

  const {
    showResetForm,
    setShowResetForm,
    showUpdatePasswordForm,
    tokenError,
    isCheckingSession,
    handleBackToLogin,
  } = usePasswordReset();

  if (user && !showForcePasswordChange) {
    return <Navigate to="/" />;
  }

  // Render the forced password change form for logged-in users with temp passwords
  if (user && showForcePasswordChange) {
    return (
      <AuthLayout title="Change Your Password" description="You must change your temporary password to continue">
        <UpdatePasswordForm 
          onUpdatePassword={handleUpdatePasswordSubmit}
          onCancel={handleBackToLogin}
          isSubmitting={isSubmitting}
          tokenError={null}
          isCheckingSession={false}
        />
      </AuthLayout>
    );
  }

  // Render the password update form
  if (showUpdatePasswordForm) {
    return (
      <AuthLayout title="Set New Password" description="Please enter your new password">
        <UpdatePasswordForm 
          onUpdatePassword={handleUpdatePasswordSubmit}
          onCancel={handleBackToLogin}
          isSubmitting={isSubmitting}
          tokenError={tokenError}
          isCheckingSession={isCheckingSession}
        />
      </AuthLayout>
    );
  }

  // Render the password reset form
  if (showResetForm) {
    return (
      <AuthLayout title="Reset Password" description="Enter your email to receive a temporary password">
        <ResetPasswordForm 
          onResetPassword={async (email) => {
            await handleResetPasswordSubmit(email);
            setShowResetForm(false);
            setActiveTab("login");
          }}
          onCancel={() => setShowResetForm(false)}
          isSubmitting={isSubmitting}
        />
      </AuthLayout>
    );
  }

  // Render the login/register tabs
  return (
    <AuthLayout title="Commission Tracker" description="Sign in to manage your commissions">
      <AuthTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogin={handleLoginSubmit}
        onRegister={async (email, password, fullName) => {
          await handleRegisterSubmit(email, password, fullName);
          setActiveTab("login");
        }}
        onForgotPassword={() => setShowResetForm(true)}
        isSubmitting={isSubmitting}
      />
    </AuthLayout>
  );
};

export default Auth;
