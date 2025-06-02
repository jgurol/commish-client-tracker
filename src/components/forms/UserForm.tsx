
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormValues, formSchema } from "@/types/userForm";
import { Agent } from "@/types/user";

interface UserFormProps {
  agents: Agent[];
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitText: string;
  showOwnerRole: boolean;
  defaultValues?: Partial<FormValues>;
}

export const UserForm = ({
  agents,
  onSubmit,
  onCancel,
  isSubmitting,
  submitText,
  showOwnerRole,
  defaultValues = {
    full_name: "",
    email: "",
    role: "agent",
    associated_agent_id: null,
  }
}: UserFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
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
                  {showOwnerRole && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="owner" />
                      <FormLabel htmlFor="owner" className="cursor-pointer">Owner</FormLabel>
                    </div>
                  )}
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? `${submitText.split(' ')[0]}ing...` : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
};
