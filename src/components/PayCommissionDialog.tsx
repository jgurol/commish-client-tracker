
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PayCommissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayCommission: (paidDate: string) => void;
  transactionId: string;
}

export const PayCommissionDialog = ({ 
  open, 
  onOpenChange, 
  onPayCommission,
  transactionId 
}: PayCommissionDialogProps) => {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paidDate) {
      onPayCommission(paidDate);
      onOpenChange(false);
      // Reset form
      setPaidDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod("check");
      setReferenceNumber("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Commission</DialogTitle>
          <DialogDescription>
            Mark this commission as paid and record the payment details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="check" id="pay-check" />
                <Label htmlFor="pay-check">Check</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zelle" id="pay-zelle" />
                <Label htmlFor="pay-zelle">Zelle</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === "check" && (
            <div className="space-y-2">
              <Label htmlFor="checkNumber">Check #</Label>
              <Input
                id="checkNumber"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter check number"
              />
            </div>
          )}

          {paymentMethod === "zelle" && (
            <div className="space-y-2">
              <Label htmlFor="zelleRef">Zelle Ref#</Label>
              <Input
                id="zelleRef"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter Zelle reference number"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="paidDate">Date Paid</Label>
            <Input
              id="paidDate"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Mark as Paid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
