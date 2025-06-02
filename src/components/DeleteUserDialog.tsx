
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_associated: boolean;
  created_at: string;
  associated_agent_name?: string | null;
  associated_agent_id?: string | null;
}

interface DeleteUserDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export const DeleteUserDialog = ({
  user,
  open,
  onOpenChange,
  onDeleteUser,
}: DeleteUserDialogProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      // Delete the user's profile which will effectively disable the account
      // Note: We can't delete from auth.users with the anon key, but deleting the profile
      // will prevent the user from accessing the application
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error("Error deleting user profile:", profileError);
        toast({
          title: "Delete failed",
          description: "Failed to delete user profile: " + profileError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User removed",
        description: `${user.full_name || user.email} has been successfully removed from the system.`,
      });

      onDeleteUser(user.id);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Exception deleting user:", error);
      toast({
        title: "Delete error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{user.full_name || user.email}</strong>? 
            This will remove their profile and prevent them from accessing the system. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Removing..." : "Remove User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
