
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
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
}

interface EditUserDialogProps {
  user: UserProfile;
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
});

type FormValues = z.infer<typeof formSchema>;

export const EditUserDialog = ({ 
  user, 
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
    },
  });

  // Update form when user changes
  useEffect(() => {
    form.reset({
      full_name: user.full_name || "",
      email: user.email,
      role: user.role as "admin" | "agent",
    });
  }, [user, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Update user profile in Supabase using the RPC function
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

      const updatedUser = {
        ...user,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
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
