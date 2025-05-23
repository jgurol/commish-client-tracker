
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClient: (client: Omit<Client, "id">) => void;
  onFetchClients: () => void; // Add this to refresh clients after DB insert
}

export const AddClientDialog = ({ 
  open, 
  onOpenChange, 
  onAddClient,
  onFetchClients
}: AddClientDialogProps) => {
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName && email && commissionRate) {
      const parsedRate = parseFloat(commissionRate);
      
      if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
        toast({
          title: "Invalid Commission Rate",
          description: "Commission rate must be between 0 and 100",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // Insert into database
        const { data, error } = await supabase
          .from('agents')
          .insert({
            user_id: user?.id, // Link to current user
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
            email,
            commission_rate: parsedRate,
            total_earnings: 0,
            last_payment: new Date().toISOString().split('T')[0]
          })
          .select();

        if (error) throw error;

        if (data && data[0]) {
          // Format for local state
          const newClientData = {
            id: data[0].id,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            companyName,
            email,
            commissionRate: parsedRate,
            totalEarnings: 0,
            lastPayment: new Date().toISOString().split('T')[0]
          };
          
          // Update local state
          onAddClient(newClientData);
          
          // Reset form
          setCompanyName("");
          setFirstName("");
          setLastName("");
          setEmail("");
          setCommissionRate("");
          
          toast({
            title: "Success",
            description: "Agent added successfully to the database",
          });
          
          // Refresh clients list to get the latest data
          onFetchClients();
          
          // Close dialog
          onOpenChange(false);
        }
      } catch (error: any) {
        console.error('Error adding agent to database:', error);
        toast({
          title: "Error",
          description: `Failed to add agent to database: ${error.message}`,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogDescription>
            Enter the agent details and commission rate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Agent Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter agent email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission">Commission Rate (%)</Label>
            <Input
              id="commission"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="Enter commission rate"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add Agent
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
