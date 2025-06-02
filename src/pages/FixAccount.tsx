
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

export default function FixAccount() {
  const { user, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const fixAccount = async () => {
    setIsFixing(true);
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingProfile) {
        // Profile exists, update it to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            is_associated: true,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            email: user.email || ''
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast({
          title: "Account updated",
          description: "Your account has been updated to admin status.",
        });
      } else {
        // Profile doesn't exist, create it
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            role: 'admin',
            is_associated: true
          });

        if (insertError) throw insertError;

        toast({
          title: "Account created",
          description: "Your admin account has been created successfully.",
        });
      }

      // Refresh user profile to update the UI
      await refreshUserProfile();
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error: any) {
      console.error('Error fixing account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fix account",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Fix Account</CardTitle>
          <CardDescription>
            Your account needs to be set up properly in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
          
          <Button 
            onClick={fixAccount}
            disabled={isFixing}
            className="w-full"
          >
            {isFixing ? 'Fixing Account...' : 'Fix My Account'}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            This will create or update your profile with admin privileges.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
