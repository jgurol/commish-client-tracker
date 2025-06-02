
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

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
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
