
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientInfo } from "@/pages/Index";

interface EditClientInfoDialogProps {
  clientInfo: ClientInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateClientInfo: (clientInfo: ClientInfo) => void;
}

export const EditClientInfoDialog = ({ 
  clientInfo, 
  open, 
  onOpenChange, 
  onUpdateClientInfo 
}: EditClientInfoDialogProps) => {
  const [companyName, setCompanyName] = useState(clientInfo.company_name);
  const [contactName, setContactName] = useState(clientInfo.contact_name || "");
  const [email, setEmail] = useState(clientInfo.email || "");
  const [phone, setPhone] = useState(clientInfo.phone || "");
  const [address, setAddress] = useState(clientInfo.address || "");
  const [notes, setNotes] = useState(clientInfo.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when clientInfo changes
  useEffect(() => {
    setCompanyName(clientInfo.company_name);
    setContactName(clientInfo.contact_name || "");
    setEmail(clientInfo.email || "");
    setPhone(clientInfo.phone || "");
    setAddress(clientInfo.address || "");
    setNotes(clientInfo.notes || "");
  }, [clientInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName) {
      setIsSubmitting(true);
      try {
        await onUpdateClientInfo({
          ...clientInfo,
          company_name: companyName,
          contact_name: contactName || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
        });
        onOpenChange(false);
      } catch (err) {
        console.error('Error updating client info:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Update the client's information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-companyName" className="required">Company Name</Label>
            <Input
              id="edit-companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-contactName">Contact Name</Label>
            <Input
              id="edit-contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Enter contact person's name"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !companyName}
            >
              {isSubmitting ? 'Updating...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
