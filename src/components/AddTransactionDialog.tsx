import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Transaction, Client, ClientInfo } from "@/pages/Index";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  clients: Client[];
  clientInfos: ClientInfo[]; // Add clientInfos prop
}

export const AddTransactionDialog = ({ open, onOpenChange, onAddTransaction, clients, clientInfos }: AddTransactionDialogProps) => {
  const [clientId, setClientId] = useState("");
  const [clientInfoId, setClientInfoId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [datePaid, setDatePaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState("");
  const [invoiceYear, setInvoiceYear] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // Array for month names - needed for display
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId && amount && date && description) {
      const selectedClient = clients.find(client => client.id === clientId);
      const selectedClientInfo = clientInfoId ? clientInfos.find(info => info.id === clientInfoId) : null;
      
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
          referenceNumber: referenceNumber || undefined,
          invoiceMonth: invoiceMonth || undefined,
          invoiceYear: invoiceYear || undefined,
          invoiceNumber: invoiceNumber || undefined,
          isPaid,
          clientInfoId: clientInfoId || undefined,
          clientCompanyName: selectedClientInfo?.companyName
        });
        
        // Reset form
        setClientId("");
        setClientInfoId("");
        setAmount("");
        setDate(new Date().toISOString().split('T')[0]);
        setDescription("");
        setDatePaid("");
        setPaymentMethod("check");
        setReferenceNumber("");
        setInvoiceMonth("");
        setInvoiceYear("");
        setInvoiceNumber("");
        setIsPaid(false);
        onOpenChange(false);
      }
    }
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
            <Label htmlFor="client">Agent</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
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

          {/* New Client Info selection */}
          <div className="space-y-2">
            <Label htmlFor="clientInfo">Client Company</Label>
            <Select value={clientInfoId} onValueChange={setClientInfoId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {clientInfos.map((clientInfo) => (
                  <SelectItem key={clientInfo.id} value={clientInfo.id}>
                    {clientInfo.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clientInfoId && (
              <div className="text-sm text-gray-500">
                Contact: {clientInfos.find(ci => ci.id === clientInfoId)?.contactName || "N/A"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Invoice Period</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select value={invoiceMonth} onValueChange={setInvoiceMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={invoiceYear} onValueChange={setInvoiceYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
            />
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
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isPaid" 
              checked={isPaid} 
              onCheckedChange={(checked) => {
                setIsPaid(checked === true);
                if (checked === true && !datePaid) {
                  setDatePaid(new Date().toISOString().split('T')[0]);
                }
              }}
            />
            <Label htmlFor="isPaid" className="font-medium text-sm">
              Invoice has been paid
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          {isPaid && (
            <div className="space-y-2">
              <Label htmlFor="datePaid">Date Paid</Label>
              <Input
                id="datePaid"
                type="date"
                value={datePaid}
                onChange={(e) => setDatePaid(e.target.value)}
                required={isPaid}
              />
            </div>
          )}
          {isPaid && (
            <>
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
            </>
          )}
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
