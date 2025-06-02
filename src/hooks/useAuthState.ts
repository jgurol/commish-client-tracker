
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAssociated, setIsAssociated] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use the security definer RPC function
      const { data, error } = await supabase.rpc('get_user_profile', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, set safe defaults and show a helpful message
        setIsAdmin(false);
        setIsOwner(false);
        setIsAssociated(false);
        toast({
          title: "Profile not found",
          description: "Your user profile needs to be created. Please refresh the page or contact support if this persists.",
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        const profileData = data[0];
        // Check if user is admin (but not owner)
        const isUserAdmin = profileData.role === 'admin';
        // Check if user is owner (owners have all admin privileges plus owner-specific ones)
        const isUserOwner = profileData.role === 'owner';
        
        setIsAdmin(isUserAdmin || isUserOwner); // Owners also have admin privileges
        setIsOwner(isUserOwner);
        setIsAssociated(profileData.is_associated || false);
      } else {
        // No profile data found, set safe defaults
        setIsAdmin(false);
        setIsOwner(false);
        setIsAssociated(false);
        toast({
          title: "Profile missing", 
          description: "Your user profile is missing from the database. Please contact an administrator.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Exception fetching user profile:', error);
      // Set defaults for failed profile fetch
      setIsAdmin(false);
      setIsOwner(false);
      setIsAssociated(false);
    }
  };

  // Function to refresh user profile data
  const refreshUserProfile = async () => {
    if (user?.id) {
      return await fetchUserProfile(user.id);
    }
  };

  return {
    session,
    user,
    loading,
    isAdmin,
    isOwner,
    isAssociated,
    setSession,
    setUser,
    setLoading,
    setIsAdmin,
    setIsOwner,
    setIsAssociated,
    fetchUserProfile,
    refreshUserProfile
  };
};
