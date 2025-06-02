
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
      // Delete the user's profile first
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

      // Delete the user from auth (this requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        console.error("Error deleting user from auth:", authError);
        toast({
          title: "Delete failed",
          description: "Failed to delete user account: " + authError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User deleted",
        description: `${user.full_name || user.email} has been successfully deleted.`,
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
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{user.full_name || user.email}</strong>? 
            This action cannot be undone. The user will be permanently removed from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
