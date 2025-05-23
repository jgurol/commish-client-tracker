
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction, Client, ClientInfo } from "@/pages/Index";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  clients: Client[];
  clientInfos: ClientInfo[]; 
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
  const [commissionPaidDate, setCommissionPaidDate] = useState("");
  
  // Debug logging
  console.log("[AddTransactionDialog] Available agents:", clients);
  console.log("[AddTransactionDialog] Available clients:", clientInfos);
  
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

  // Handle client selection - auto-select agent based on client's agent_id
  useEffect(() => {
    if (clientInfoId && clientInfoId !== "none") {
      const selectedClient = clientInfos.find(info => info.id === clientInfoId);
      console.log("[AddTransactionDialog] Selected client:", selectedClient);
      
      if (selectedClient && selectedClient.agent_id) {
        console.log("[AddTransactionDialog] Auto-selecting agent:", selectedClient.agent_id);
        setClientId(selectedClient.agent_id);
      } else {
        console.log("[AddTransactionDialog] No agent associated with this client");
        setClientId("");
      }
    } else {
      console.log("[AddTransactionDialog] No client selected, clearing agent");
      setClientId("");
    }
  }, [clientInfoId, clientInfos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId && amount && date && description) {
      const selectedClient = clients.find(client => client.id === clientId);
      const selectedClientInfo = clientInfoId && clientInfoId !== "none" ? clientInfos.find(info => info.id === clientInfoId) : null;
      
      console.log("[AddTransactionDialog] Submitting transaction:");
      console.log("- Agent:", selectedClient);
      console.log("- Client:", selectedClientInfo);
      
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
          clientInfoId: clientInfoId !== "none" ? clientInfoId : undefined,
          clientCompanyName: selectedClientInfo?.company_name,
          commissionPaidDate: commissionPaidDate || undefined
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
        setCommissionPaidDate("");
        onOpenChange(false);
      }
    }
  };

  const selectedAgent = clientId ? clients.find(c => c.id === clientId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new commission payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="invoice">Invoice Details</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              {/* Client Selection - Primary selection */}
              <div className="space-y-2">
                <Label htmlFor="clientInfo">Client Company (Required)</Label>
                <Select value={clientInfoId} onValueChange={setClientInfoId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client company" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientInfos.length === 0 ? (
                      <SelectItem value="no-clients" disabled>
                        No clients available - Add clients first
                      </SelectItem>
                    ) : (
                      clientInfos.map((clientInfo) => (
                        <SelectItem key={clientInfo.id} value={clientInfo.id}>
                          {clientInfo.company_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {clientInfoId && clientInfoId !== "none" && (
                  <div className="text-xs text-gray-500">
                    Contact: {clientInfos.find(ci => ci.id === clientInfoId)?.contact_name || "N/A"}
                  </div>
                )}
              </div>

              {/* Agent Display - Shows auto-selected agent */}
              {selectedAgent && (
                <div className="space-y-2">
                  <Label>Associated Agent</Label>
                  <div className="border rounded-md px-3 py-2 bg-muted text-muted-foreground">
                    {selectedAgent.name} {selectedAgent.companyName && `(${selectedAgent.companyName})`}
                  </div>
                  <div className="text-xs text-green-600">
                    ✓ Agent automatically selected based on client
                  </div>
                </div>
              )}

              {/* Warning if no agent is associated */}
              {clientInfoId && clientInfoId !== "none" && !selectedAgent && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="text-sm text-yellow-800">
                    ⚠️ This client is not associated with any agent. Please associate this client with an agent first.
                  </div>
                </div>
              )}

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
                <Label htmlFor="date">Transaction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
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
            </TabsContent>
            
            <TabsContent value="invoice" className="space-y-4">
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
                <Label htmlFor="commissionPaidDate">Commission Paid Date</Label>
                <Input
                  id="commissionPaidDate"
                  type="date"
                  value={commissionPaidDate}
                  onChange={(e) => setCommissionPaidDate(e.target.value)}
                  placeholder="Leave blank if not yet paid"
                />
                <div className="text-xs text-gray-500">
                  Leave blank if the commission has not been paid yet
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-4">
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
              
              {isPaid && (
                <>
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
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedAgent || clientInfos.length === 0}
            >
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
