
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const OrphanedUserCleanup = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAndCreateProfile = async () => {
      if (!user) return;

      try {
        // Check if profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile:', error);
          return;
        }

        // If no profile exists, create one
        if (!profile) {
          console.log('Creating missing profile for user:', user.email);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              role: 'admin', // Default to admin for missing profiles
              is_associated: true
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Profile creation failed",
              description: "Could not create user profile. Please contact support.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Profile created",
              description: "Your user profile has been created successfully.",
            });
            // Refresh the page to update auth context
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Error in profile check:', error);
      }
    };

    checkAndCreateProfile();
  }, [user, toast]);

  return null; // This component doesn't render anything
};
