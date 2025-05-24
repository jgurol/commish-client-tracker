import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transaction, Client, ClientInfo } from "@/pages/Index";
import { BasicInfoTab } from "./BasicInfoTab";
import { InvoiceDetailsTab } from "./InvoiceDetailsTab";
import { PaymentTab } from "./PaymentTab";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  clients: Client[];
  clientInfos: ClientInfo[];
}

// Helper function to format date for input field (YYYY-MM-DD) - using local date
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return "";
  
  console.log("[formatDateForInput] Input dateString:", dateString);
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    console.log("[formatDateForInput] Already in YYYY-MM-DD format, returning:", dateString);
    return dateString;
  }
  
  // Parse the date string directly without timezone conversion
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  if (isNaN(date.getTime())) {
    console.log("[formatDateForInput] Invalid date, returning empty string");
    return "";
  }
  
  // Use local date methods to avoid timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  console.log("[formatDateForInput] Formatted result:", result);
  return result;
};

// Helper function to create a date string from input (keeps it in YYYY-MM-DD format)
const createDateString = (inputValue: string): string => {
  console.log("[createDateString] Input value:", inputValue);
  if (!inputValue) return "";
  // Return the input value as-is since it's already in YYYY-MM-DD format
  console.log("[createDateString] Returning:", inputValue);
  return inputValue;
};

export const EditTransactionDialog = ({ transaction, open, onOpenChange, onUpdateTransaction, clients, clientInfos }: EditTransactionDialogProps) => {
  const [clientId, setClientId] = useState("");
  const [clientInfoId, setClientInfoId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(""); // Main transaction date
  const [description, setDescription] = useState("");
  const [datePaid, setDatePaid] = useState(""); // Invoice paid date - separate from transaction date
  const [paymentMethod, setPaymentMethod] = useState("check");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState("");
  const [invoiceYear, setInvoiceYear] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [commissionPaidDate, setCommissionPaidDate] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [commissionOverride, setCommissionOverride] = useState("");

  // Filter client infos based on selected agent
  const [filteredClientInfos, setFilteredClientInfos] = useState<ClientInfo[]>(clientInfos);

  // Update form values when transaction changes
  useEffect(() => {
    if (transaction) {
      console.log("[EditTransactionDialog] Loading transaction:", transaction);
      console.log("[EditTransactionDialog] Original transaction date:", transaction.date);
      console.log("[EditTransactionDialog] Original date paid:", transaction.datePaid);
      
      setClientId(transaction.clientId);
      setClientInfoId(transaction.clientInfoId || "none");
      setAmount(transaction.amount.toString());
      
      // Format the transaction date for input
      const formattedDate = formatDateForInput(transaction.date);
      console.log("[EditTransactionDialog] Setting transaction date to:", formattedDate);
      setDate(formattedDate);
      
      setDescription(transaction.description);
      
      // Format the date paid for input
      const formattedDatePaid = formatDateForInput(transaction.datePaid);
      console.log("[EditTransactionDialog] Setting date paid to:", formattedDatePaid);
      setDatePaid(formattedDatePaid);
      
      setPaymentMethod(transaction.paymentMethod || "unpaid");
      setReferenceNumber(transaction.referenceNumber || "");
      setInvoiceMonth(transaction.invoiceMonth || "");
      setInvoiceYear(transaction.invoiceYear || "");
      setInvoiceNumber(transaction.invoiceNumber || "");
      setIsPaid(transaction.isPaid || false);
      setCommissionPaidDate(formatDateForInput(transaction.commissionPaidDate));
      setIsApproved(transaction.isApproved || false);
      setCommissionOverride(transaction.commissionOverride?.toString() || "");
    }
  }, [transaction]);

  // Handle client info selection - auto-select agent
  useEffect(() => {
    if (clientInfoId && clientInfoId !== "none") {
      const selectedClientInfo = clientInfos.find(info => info.id === clientInfoId);
      if (selectedClientInfo && selectedClientInfo.agent_id) {
        setClientId(selectedClientInfo.agent_id);
      }
    }
  }, [clientInfoId, clientInfos]);

  // Update filtered client infos when agent changes
  useEffect(() => {
    if (clientId) {
      setFilteredClientInfos(clientInfos.filter(info => !info.agent_id || info.agent_id === clientId));
    } else {
      setFilteredClientInfos(clientInfos);
    }
  }, [clientId, clientInfos]);

  const handleImmediateUpdate = () => {
    // Immediately save the current state to database when "unpaid" is selected
    if (transaction && clientId && amount && date) {
      const selectedClient = clients.find(client => client.id === clientId);
      const selectedClientInfo = clientInfoId && clientInfoId !== "none" ? clientInfos.find(info => info.id === clientInfoId) : null;
      
      console.log("[EditTransactionDialog] Immediate update - sending transaction date:", date);
      console.log("[EditTransactionDialog] Immediate update - sending date paid:", datePaid);
      
      if (selectedClient) {
        onUpdateTransaction({
          id: transaction.id,
          clientId,
          clientName: selectedClient.name,
          companyName: selectedClient.companyName || selectedClient.name,
          amount: parseFloat(amount),
          date: createDateString(date), // Main transaction date
          description: description || "",
          datePaid: isPaid && datePaid ? createDateString(datePaid) : undefined, // Invoice paid date
          paymentMethod,
          referenceNumber: referenceNumber || undefined,
          invoiceMonth: invoiceMonth || undefined,
          invoiceYear: invoiceYear || undefined,
          invoiceNumber: invoiceNumber || undefined,
          isPaid,
          clientInfoId: clientInfoId !== "none" ? clientInfoId : undefined,
          clientCompanyName: selectedClientInfo?.company_name,
          commission: transaction.commission,
          isApproved,
          commissionPaidDate: commissionPaidDate ? createDateString(commissionPaidDate) : undefined,
          commissionOverride: commissionOverride ? parseFloat(commissionOverride) : undefined
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction && clientId && amount && date) {
      const selectedClient = clients.find(client => client.id === clientId);
      const selectedClientInfo = clientInfoId && clientInfoId !== "none" ? clientInfos.find(info => info.id === clientInfoId) : null;
      
      console.log("[EditTransactionDialog] Submit - sending transaction date:", date);
      console.log("[EditTransactionDialog] Submit - sending date paid:", datePaid);
      
      if (selectedClient) {
        onUpdateTransaction({
          id: transaction.id,
          clientId,
          clientName: selectedClient.name,
          companyName: selectedClient.companyName || selectedClient.name,
          amount: parseFloat(amount),
          date: createDateString(date), // Main transaction date
          description: description || "",
          datePaid: isPaid && datePaid ? createDateString(datePaid) : undefined, // Invoice paid date
          paymentMethod,
          referenceNumber: referenceNumber || undefined,
          invoiceMonth: invoiceMonth || undefined,
          invoiceYear: invoiceYear || undefined,
          invoiceNumber: invoiceNumber || undefined,
          isPaid,
          clientInfoId: clientInfoId !== "none" ? clientInfoId : undefined,
          clientCompanyName: selectedClientInfo?.company_name,
          commission: transaction.commission,
          isApproved,
          commissionPaidDate: commissionPaidDate ? createDateString(commissionPaidDate) : undefined,
          commissionOverride: commissionOverride ? parseFloat(commissionOverride) : undefined
        });
        onOpenChange(false);
      }
    }
  };

  const selectedAgent = clientId ? clients.find(c => c.id === clientId) : null;
  const selectedClientInfo = clientInfoId && clientInfoId !== "none" ? clientInfos.find(info => info.id === clientInfoId) : null;

  // Calculate effective commission rate for display
  const getEffectiveCommissionRate = () => {
    if (commissionOverride) return parseFloat(commissionOverride);
    if (selectedClientInfo?.commission_override) return selectedClientInfo.commission_override;
    if (selectedAgent) return selectedAgent.commissionRate;
    return null;
  };

  const effectiveRate = getEffectiveCommissionRate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details.
          </DialogDescription>
        </DialogHeader>
        {transaction && (
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="invoice">Invoice Details</TabsTrigger>
                <TabsTrigger value="payment">Commission</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <div className="space-y-4">
                  <BasicInfoTab
                    clientId={clientId}
                    setClientId={setClientId}
                    clientInfoId={clientInfoId}
                    setClientInfoId={setClientInfoId}
                    amount={amount}
                    setAmount={setAmount}
                    date={date}
                    setDate={setDate}
                    description={description}
                    setDescription={setDescription}
                    clients={clients}
                    clientInfos={clientInfos}
                    filteredClientInfos={filteredClientInfos}
                  />
                  
                  {/* Commission Override */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-commissionOverride">Transaction Commission Override (%)</Label>
                    <Input
                      id="edit-commissionOverride"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={commissionOverride}
                      onChange={(e) => setCommissionOverride(e.target.value)}
                      placeholder="Enter commission rate override (optional)"
                    />
                    <div className="text-xs text-gray-500">
                      Optional. This will override both client and agent commission rates for this transaction.
                      {effectiveRate && (
                        <div className="mt-1 font-medium text-blue-600">
                          Effective rate: {effectiveRate}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="invoice">
                <InvoiceDetailsTab
                  invoiceMonth={invoiceMonth}
                  setInvoiceMonth={setInvoiceMonth}
                  invoiceYear={invoiceYear}
                  setInvoiceYear={setInvoiceYear}
                  invoiceNumber={invoiceNumber}
                  setInvoiceNumber={setInvoiceNumber}
                  isPaid={isPaid}
                  setIsPaid={setIsPaid}
                  datePaid={datePaid}
                  setDatePaid={setDatePaid}
                />
              </TabsContent>
              
              <TabsContent value="payment">
                <PaymentTab
                  isPaid={isPaid}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  referenceNumber={referenceNumber}
                  setReferenceNumber={setReferenceNumber}
                  commissionPaidDate={commissionPaidDate}
                  setCommissionPaidDate={setCommissionPaidDate}
                  isApproved={isApproved}
                  setIsApproved={setIsApproved}
                  onImmediateUpdate={handleImmediateUpdate}
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 mt-6">
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
