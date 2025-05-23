
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isAssociated: boolean; // Added to track if an agent is associated
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean up auth state
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAssociated, setIsAssociated] = useState(false); // New state for tracking association
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid deadlocks
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsAssociated(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      const isUserAdmin = data.role === 'admin';
      setIsAdmin(isUserAdmin);

      // If the user is not an admin (i.e., they're an agent),
      // check if they're associated with an agent in the system
      if (!isUserAdmin) {
        // We shouldn't directly query the clients table here
        // Instead, check a flag or another field in the profile that indicates association
        // For now, since we don't have this field, we'll set isAssociated to false for agents
        // This will be updated when admin associates them with a client
        setIsAssociated(false);
      } else {
        // Admins are always considered "associated"
        setIsAssociated(true);
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
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
        console.log('Sign out before login failed, continuing anyway');
      }

      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      // Check if user profile exists and get role info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        toast({
          title: "Login failed",
          description: "Unable to retrieve user profile",
          variant: "destructive"
        });
        // Sign out the user as the login wasn't successful
        await supabase.auth.signOut();
        throw profileError;
      }

      const userRole = profileData.role;
      
      // If the user is an agent, check if they're associated
      if (userRole === 'agent') {
        // We need a reliable way to check if an agent is associated
        // For now, we'll simply check if they have been approved/associated
        // This should be a field in the profiles table, not a query to clients
        const { data: agentData, error: agentError } = await supabase
          .from('profiles')
          .select('is_associated')
          .eq('id', data.user.id)
          .single();

        if (agentError || !agentData) {
          await supabase.auth.signOut();
          toast({
            title: "Login failed",
            description: "Error verifying agent status",
            variant: "destructive"
          });
          throw agentError || new Error("Could not verify agent status");
        }

        // If the agent is not associated, don't allow login
        if (!agentData.is_associated) {
          await supabase.auth.signOut();
          toast({
            title: "Login failed",
            description: "Your account is not yet associated with an agent in the system. Please contact an administrator.",
            variant: "destructive"
          });
          throw new Error("Agent not associated");
        }
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Force page reload to ensure clean state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error signing in:', error.message);
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
        description: "Your account has been created! However, you cannot log in until your account is associated with an agent by a system administrator.",
      });
    } catch (error: any) {
      console.error('Error signing up:', error.message);
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
      console.error('Error signing out:', error.message);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isAssociated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
