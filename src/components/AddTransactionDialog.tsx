
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Transaction, Client } from "@/pages/Index";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  clients: Client[];
}

export const AddTransactionDialog = ({ open, onOpenChange, onAddTransaction, clients }: AddTransactionDialogProps) => {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [datePaid, setDatePaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId && amount && date && description) {
      const selectedClient = clients.find(client => client.id === clientId);
      if (selectedClient) {
        onAddTransaction({
          clientId,
          clientName: selectedClient.name,
          companyName: selectedClient.companyName || selectedClient.name,
          amount: parseFloat(amount),
          date,
          description,
          datePaid: datePaid || undefined,
          paymentMethod,
          referenceNumber: referenceNumber || undefined
        });
        setClientId("");
        setAmount("");
        setDate(new Date().toISOString().split('T')[0]);
        setDescription("");
        setDatePaid("");
        setPaymentMethod("check");
        setReferenceNumber("");
        onOpenChange(false);
      }
    }
  };

  // Find the client's company name based on clientId
  const getClientCompanyName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? (client.companyName || client.name) : "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new commission payment.
          </DialogDescription>
        </DialogHeader>
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
                    {client.companyName || client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clientId && (
              <div className="text-sm text-gray-500">
                Contact: {clients.find(c => c.id === clientId)?.name}
              </div>
            )}
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
                <RadioGroupItem value="check" id="check" />
                <Label htmlFor="check">Check</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zelle" id="zelle" />
                <Label htmlFor="zelle">Zelle</Label>
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
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
