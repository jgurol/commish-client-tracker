import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UseAuthActionsProps {
  toast: any;
  cleanupAuthState: () => void;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setIsOwner: (isOwner: boolean) => void;
  setIsAssociated: (isAssociated: boolean) => void;
}

export const useAuthActions = ({
  toast,
  cleanupAuthState,
  setSession,
  setUser,
  setIsAdmin,
  setIsOwner,
  setIsAssociated
}: UseAuthActionsProps) => {
  const updateLastLogin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update last login:', error);
      } else {
        console.log('Successfully updated last login for user:', userId);
      }
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing auth state before signing in
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      // Update last login timestamp immediately after successful login
      if (data.user?.id) {
        await updateLastLogin(data.user.id);
      }
      
      // Check if this is a temporary password (12 chars with mixed case and numbers)
      const isTempPassword = password.length === 12 && 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9]/.test(password);
      
      if (isTempPassword) {
        // Don't redirect immediately for temp passwords
        toast({
          title: "Login successful",
          description: "Please change your temporary password to continue.",
        });
        return; // Don't redirect
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Clean up existing auth state before signing up
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully! You can now log in.",
      });
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Force page reload to ensure clean state
      window.location.href = '/auth';
    } catch (error: any) {
      throw error;
    }
  };

  return {
    signIn,
    signUp,
    signOut
  };
};
