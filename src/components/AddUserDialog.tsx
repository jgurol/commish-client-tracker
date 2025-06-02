
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { generateRandomPassword } from "@/utils/passwordUtils";
import { supabase } from "@/integrations/supabase/client";
import { UserForm } from "@/components/forms/UserForm";
import { UserProfile, Agent } from "@/types/user";
import { FormValues, formSchema } from "@/types/userForm";

interface AddUserDialogProps {
  agents: Agent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: UserProfile) => void;
}

export const AddUserDialog = ({ 
  agents,
  open, 
  onOpenChange, 
  onAddUser 
}: AddUserDialogProps) => {
  const { toast } = useToast();
  const { isOwner } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Starting user creation process with data:', data);
      
      // Generate a random password
      const generatedPassword = generateRandomPassword(12);
      console.log('Generated password for new user');

      // Call the edge function to create the user
      const { data: result, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: data.email,
          password: generatedPassword,
          fullName: data.full_name,
          role: data.role,
          associatedAgentId: data.associated_agent_id,
        },
      });

      if (error) {
        console.error('User creation error:', error);
        toast({
          title: "User creation failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('User created successfully:', result);

      // Find the associated agent name if an agent is selected
      const associatedAgent = agents.find(agent => agent.id === data.associated_agent_id);
      const associatedAgentName = associatedAgent ? 
        `${associatedAgent.first_name} ${associatedAgent.last_name} (${associatedAgent.company_name || 'No Company'})` : 
        null;

      const newUser: UserProfile = {
        ...result.user,
        associated_agent_name: associatedAgentName,
      };

      toast({
        title: "User created successfully",
        description: `${data.role === "admin" ? "Admin" : data.role === "owner" ? "Owner" : "Agent"} user has been created and their login credentials have been sent via email.`,
      });

      onAddUser(newUser);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Unexpected error during user creation:', error);
      toast({
        title: "Creation error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. They will receive their login credentials via email immediately.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          agents={agents}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitText="Create User"
          showOwnerRole={isOwner}
        />
      </DialogContent>
    </Dialog>
  );
};
