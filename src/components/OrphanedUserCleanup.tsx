
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";

export const OrphanedUserCleanup = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("jim@gurol.net");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteOrphanedUser = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // First, check if user exists in auth.users but not in profiles
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw new Error(`Failed to list auth users: ${authError.message}`);
      }

      const authUser = authUsers.users.find(user => user.email === email);
      
      if (!authUser) {
        toast({
          title: "User not found",
          description: `No authentication record found for ${email}`,
          variant: "destructive",
        });
        return;
      }

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Failed to check profile: ${profileError.message}`);
      }

      if (profile) {
        toast({
          title: "User not orphaned",
          description: `${email} has a profile record and is not orphaned`,
          variant: "destructive",
        });
        return;
      }

      // Delete the orphaned auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);

      if (deleteError) {
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }

      // Log the action
      await supabase.rpc('log_admin_action', {
        action_type: 'DELETE_ORPHANED_AUTH_USER',
        table_name: 'auth.users',
        record_id: authUser.id,
        details: {
          email: email,
          user_id: authUser.id
        }
      });

      toast({
        title: "Orphaned user deleted",
        description: `Successfully deleted orphaned auth user: ${email}`,
      });

      setEmail("");
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Clean Up Orphaned Users
        </CardTitle>
        <CardDescription>
          Delete authentication records that don't have corresponding profile records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to delete"
            disabled={isDeleting}
          />
        </div>
        
        <Button 
          onClick={handleDeleteOrphanedUser}
          disabled={isDeleting || !email.trim()}
          variant="destructive"
          className="w-full"
        >
          {isDeleting ? "Deleting..." : "Delete Orphaned User"}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          This will only delete users that exist in auth.users but don't have a profile record.
        </p>
      </CardContent>
    </Card>
  );
};
