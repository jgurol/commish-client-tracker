
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Transaction, Client } from "@/pages/Index";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  clients: Client[];
}

export const EditTransactionDialog = ({ transaction, open, onOpenChange, onUpdateTransaction, clients }: EditTransactionDialogProps) => {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [datePaid, setDatePaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [referenceNumber, setReferenceNumber] = useState("");

  // Update form values when transaction changes
  useEffect(() => {
    if (transaction) {
      setClientId(transaction.clientId);
      setAmount(transaction.amount.toString());
      setDate(transaction.date);
      setDescription(transaction.description);
      setDatePaid(transaction.datePaid || "");
      setPaymentMethod(transaction.paymentMethod || "check");
      setReferenceNumber(transaction.referenceNumber || "");
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction && clientId && amount && date && description) {
      const selectedClient = clients.find(client => client.id === clientId);
      if (selectedClient) {
        onUpdateTransaction({
          id: transaction.id,
          clientId,
          clientName: selectedClient.name,
          amount: parseFloat(amount),
          date,
          description,
          datePaid: datePaid || undefined,
          paymentMethod,
          referenceNumber: referenceNumber || undefined
        });
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details.
          </DialogDescription>
        </DialogHeader>
        {transaction && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datePaid">Date Paid (leave empty if unpaid)</Label>
              <Input
                id="datePaid"
                type="date"
                value={datePaid}
                onChange={(e) => setDatePaid(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={setPaymentMethod}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="check" id="edit-check" />
                  <Label htmlFor="edit-check">Check</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zelle" id="edit-zelle" />
                  <Label htmlFor="edit-zelle">Zelle</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">
                {paymentMethod === "check" ? "Check Number" : "Zelle Reference"}
              </Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={paymentMethod === "check" ? "Enter check number" : "Enter Zelle reference"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter transaction description"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Transaction
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
