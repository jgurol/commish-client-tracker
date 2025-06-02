
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
      // First, get the current user to check if they're admin
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        return;
      }

      // Check if current user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        toast({
          title: "Access denied",
          description: "Only administrators can delete orphaned users",
          variant: "destructive",
        });
        return;
      }

      // Now check for the target user in auth.users using RPC or direct query
      // Since we can't directly query auth.users, we'll check profiles first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

      if (!checkError && existingProfile) {
        toast({
          title: "User not orphaned",
          description: `${email} has a profile record and is not orphaned`,
          variant: "destructive",
        });
        return;
      }

      // If we get here, either the user doesn't exist in profiles or there was an error
      // This indicates the user might be orphaned in auth.users
      toast({
        title: "Manual cleanup required",
        description: `Cannot automatically delete ${email}. Please use Supabase dashboard to manage auth users directly.`,
        variant: "destructive",
      });

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
          Check for authentication records that don't have corresponding profile records
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
            placeholder="Enter email to check"
            disabled={isDeleting}
          />
        </div>
        
        <Button 
          onClick={handleDeleteOrphanedUser}
          disabled={isDeleting || !email.trim()}
          variant="destructive"
          className="w-full"
        >
          {isDeleting ? "Checking..." : "Check for Orphaned User"}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          This will check if the user exists in profiles. For actual deletion of auth records, use the Supabase dashboard.
        </p>
      </CardContent>
    </Card>
  );
};
