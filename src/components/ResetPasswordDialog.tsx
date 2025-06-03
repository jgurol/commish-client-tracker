
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string; 
  is_associated: boolean;
  created_at: string;
  associated_agent_name: string | null;
  associated_agent_id: string | null;
}

interface ResetPasswordDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (user: UserProfile) => void;
  isResetting: boolean;
}

export const ResetPasswordDialog = ({ 
  user, 
  open, 
  onOpenChange, 
  onResetPassword,
  isResetting
}: ResetPasswordDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            This will generate a new temporary password for <strong>{user.full_name || user.email}</strong> and send it to their email address.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4 my-4">
          <p className="text-sm text-orange-800">
            <strong>Note:</strong> The user will receive their new temporary password via email and should change it immediately after logging in.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isResetting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onResetPassword(user)}
            disabled={isResetting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isResetting ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
