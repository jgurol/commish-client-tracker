
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
}

interface AddUserDialogProps {
  agents: Agent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (user: UserProfile) => void;
}

const formSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "agent"], {
    required_error: "Please select a role",
  }),
  associated_agent_id: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const AddUserDialog = ({ 
  agents,
  open, 
  onOpenChange, 
  onAddUser 
}: AddUserDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      role: "agent",
      associated_agent_id: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          }
        }
      });

      if (authError) {
        console.error("Error creating user:", authError);
        toast({
          title: "User creation failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "User creation failed",
          description: "No user data returned",
          variant: "destructive",
        });
        return;
      }

      // Update the user profile with the role and association
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: data.role,
          associated_agent_id: data.associated_agent_id === "none" ? null : data.associated_agent_id,
          is_associated: data.associated_agent_id && data.associated_agent_id !== "none" ? true : false
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast({
          title: "Profile update failed",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Find the associated agent name if an agent is selected
      const associatedAgent = agents.find(agent => agent.id === data.associated_agent_id);
      const associatedAgentName = associatedAgent ? 
        `${associatedAgent.first_name} ${associatedAgent.last_name} (${associatedAgent.company_name || 'No Company'})` : 
        null;

      const newUser: UserProfile = {
        id: authData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        is_associated: data.associated_agent_id ? true : false,
        created_at: new Date().toISOString(),
        associated_agent_id: data.associated_agent_id === "none" ? null : data.associated_agent_id,
        associated_agent_name: associatedAgentName,
      };

      toast({
        title: "User created",
        description: "User has been created successfully",
      });

      onAddUser(newUser);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Exception creating user:", error);
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
            Create a new user account with role and association settings.
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
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="associated_agent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associate with Agent</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {agents.length > 0 ? (
                        agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {`${agent.first_name} ${agent.last_name} (${agent.company_name || 'No Company'})`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-agents" disabled>
                          No agents available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
