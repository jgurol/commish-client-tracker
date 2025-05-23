
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface EditUserDialogProps {
  user: UserProfile;
  agents?: UserProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (user: UserProfile) => void;
}

// Define form schema for validation
const formSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "agent"], {
    required_error: "Please select a role",
  }),
  associated_agent_id: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const EditUserDialog = ({ 
  user, 
  agents = [],
  open, 
  onOpenChange, 
  onUpdateUser 
}: EditUserDialogProps) => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name || "",
      email: user.email,
      role: user.role as "admin" | "agent",
      associated_agent_id: user.associated_agent_id || null,
    },
  });

  // Update form when user changes
  useEffect(() => {
    form.reset({
      full_name: user.full_name || "",
      email: user.email,
      role: user.role as "admin" | "agent",
      associated_agent_id: user.associated_agent_id || null,
    });
  }, [user, form]);

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
        console.error("Error updating user profile:", error);
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update associated agent separately if needed
      if (data.associated_agent_id !== user.associated_agent_id) {
        const { error: agentError } = await supabase
          .from('profiles')
          .update({ 
            associated_agent_id: data.associated_agent_id,
            is_associated: data.associated_agent_id ? true : user.is_associated
          })
          .eq('id', user.id);

        if (agentError) {
          console.error("Error updating user association:", agentError);
          toast({
            title: "Association update failed",
            description: agentError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Find the associated agent name if an agent is selected
      const associatedAgent = agents.find(agent => agent.id === data.associated_agent_id);
      const associatedAgentName = associatedAgent?.full_name || null;

      const updatedUser = {
        ...user,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        associated_agent_id: data.associated_agent_id || null,
        associated_agent_name: associatedAgentName,
      };
      
      toast({
        title: "User updated",
        description: "User profile has been updated successfully",
      });

      onUpdateUser(updatedUser);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Exception updating user:", error);
      toast({
        title: "Update error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Filter out the current user from the agents list to prevent self-association
  const availableAgents = agents.filter(agent => agent.id !== user.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user details and role. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email address" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <FormLabel htmlFor="admin" className="cursor-pointer">Admin</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="agent" id="agent" />
                        <FormLabel htmlFor="agent" className="cursor-pointer">Agent</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Only show agent association field for non-admin users */}
            {form.watch("role") === "agent" && (
              <FormField
                control={form.control}
                name="associated_agent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associate with Agent</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availableAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.full_name || agent.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
