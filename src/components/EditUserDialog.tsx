
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserForm } from "@/components/forms/UserForm";
import { UserProfile, Agent } from "@/types/user";
import { FormValues } from "@/types/userForm";

interface EditUserDialogProps {
  user: UserProfile;
  agents?: Agent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (user: UserProfile) => void;
}

export const EditUserDialog = ({ 
  user, 
  agents = [],
  open, 
  onOpenChange, 
  onUpdateUser 
}: EditUserDialogProps) => {
  const { toast } = useToast();
  const { isOwner } = useAuth();

  const onSubmit = async (data: FormValues) => {
    try {
      // Update user profile in Supabase
      const { error } = await supabase.rpc('update_user_profile', {
        _user_id: user.id,
        _email: data.email,
        _full_name: data.full_name,
        _role: data.role
      });

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Convert "none" to null for database storage
      const agentIdToStore = data.associated_agent_id === "none" ? null : data.associated_agent_id;

      // Update associated agent separately if needed
      if (agentIdToStore !== user.associated_agent_id) {
        const { error: agentError } = await supabase
          .from('profiles')
          .update({ 
            associated_agent_id: agentIdToStore,
            is_associated: agentIdToStore ? true : user.is_associated
          })
          .eq('id', user.id);

        if (agentError) {
          toast({
            title: "Association update failed",
            description: agentError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Find the associated agent name if an agent is selected
      const associatedAgent = agents.find(agent => agent.id === agentIdToStore);
      const associatedAgentName = associatedAgent ? 
        `${associatedAgent.first_name} ${associatedAgent.last_name} (${associatedAgent.company_name || 'No Company'})` : 
        null;

      const updatedUser = {
        ...user,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        associated_agent_id: agentIdToStore,
        associated_agent_name: associatedAgentName,
      };
      
      toast({
        title: "User updated",
        description: "User profile has been updated successfully",
      });

      onUpdateUser(updatedUser);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Update error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user details and role. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          agents={agents}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={false}
          submitText="Save Changes"
          showOwnerRole={isOwner}
          defaultValues={{
            full_name: user.full_name || "",
            email: user.email,
            role: user.role as "admin" | "agent" | "owner",
            associated_agent_id: user.associated_agent_id || null,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
