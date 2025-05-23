
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Client } from "@/pages/Index";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClient: (client: Omit<Client, "id">) => void;
}

export const AddClientDialog = ({ open, onOpenChange, onAddClient }: AddClientDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [commissionRate, setCommissionRate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName && email && commissionRate) {
      onAddClient({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`, // Generate full name from first and last name
        email,
        commissionRate: parseFloat(commissionRate),
        totalEarnings: 0,
        lastPayment: new Date().toISOString().split('T')[0]
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setCommissionRate("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the client details and commission rate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter client email"
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
              Add Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
