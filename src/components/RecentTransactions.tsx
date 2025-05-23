import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Pencil, CheckCircle, Clock, Building, FileText, Users } from "lucide-react";
import { Transaction, Client, ClientInfo } from "@/pages/Index";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface RecentTransactionsProps {
  transactions: Transaction[];
  clients: Client[];
  clientInfos: ClientInfo[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string, paidDate: string) => void;
}

export const RecentTransactions = ({ 
  transactions, 
  clients, 
  clientInfos,
  onAddTransaction, 
  onUpdateTransaction,
  onApproveCommission,
  onPayCommission
}: RecentTransactionsProps) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  // State for the approval warning dialog
  const [approvalWarningOpen, setApprovalWarningOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  // New state for filtering paid commissions
  const [includePaidCommissions, setIncludePaidCommissions] = useState(true);
  // Changed default value to true for showOnlyPaidInvoices
  const [showOnlyPaidInvoices, setShowOnlyPaidInvoices] = useState(false);

  // Filter transactions based on the checkbox states
  const filteredTransactions = transactions
    .filter(transaction => {
      // Filter by paid commissions
      if (!includePaidCommissions && transaction.commissionPaidDate) {
        return false;
      }
      
      // Filter by paid invoices
      if (showOnlyPaidInvoices && !transaction.isPaid) {
        return false;
      }
      
      return true;
    });

  const handleEditClick = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsEditTransactionOpen(true);
  };

  // Function to determine if a transaction is from the current month
  const isCurrentMonth = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Function to handle commission approval with warning check
  const handleApproveCommission = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    
    // If transaction exists and is not paid, show warning dialog
    if (transaction && !transaction.isPaid) {
      setPendingApprovalId(transactionId);
      setApprovalWarningOpen(true);
    } else {
      // If paid or no transaction found, proceed with approval directly
      onApproveCommission(transactionId);
    }
  };

  // Function to handle confirmation of approval despite warning
  const handleConfirmApproval = () => {
    if (pendingApprovalId) {
      onApproveCommission(pendingApprovalId);
      setPendingApprovalId(null);
    }
    setApprovalWarningOpen(false);
  };

  // Function to cancel approval
  const handleCancelApproval = () => {
    setPendingApprovalId(null);
    setApprovalWarningOpen(false);
  };

  // Function to handle commission payment
  const handlePayCommission = (transactionId: string) => {
    if (onPayCommission) {
      // Use today's date as default payment date
      const today = new Date().toISOString().split('T')[0];
      onPayCommission(transactionId, today);
    }
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Transactions</CardTitle>
            <CardDescription>All commission payments</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="showOnlyPaidInvoices" 
                  checked={showOnlyPaidInvoices} 
                  onCheckedChange={(checked) => setShowOnlyPaidInvoices(checked === true)}
                />
                <label 
                  htmlFor="showOnlyPaidInvoices" 
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Show only paid invoices
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="includePaidCommissions" 
                  checked={includePaidCommissions} 
                  onCheckedChange={(checked) => setIncludePaidCommissions(checked === true)}
                />
                <label 
                  htmlFor="includePaidCommissions" 
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Include paid commissions
                </label>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={() => setIsAddTransactionOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{transaction.clientName}</h4>
                        <Badge variant="outline" className="text-xs">
                          ${transaction.amount.toLocaleString()}
                        </Badge>
                        {transaction.isPaid ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          isCurrentMonth(transaction.date) && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Due
                            </Badge>
                          )
                        )}
                        {transaction.paymentMethod && transaction.isPaid && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {transaction.paymentMethod === "check" ? "Check" : "Zelle"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-1 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        {transaction.companyName}
                      </div>
                      {/* Display client company if available */}
                      {transaction.clientInfoId && transaction.clientInfoId !== "none" && (
                        <div className="flex items-center gap-1 mb-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          Client: {transaction.clientCompanyName || clientInfos.find(ci => ci.id === transaction.clientInfoId)?.company_name || "N/A"}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        {transaction.invoiceNumber && (
                          <>
                            <FileText className="w-3 h-3" />
                            <span>Invoice #{transaction.invoiceNumber}</span>
                            {transaction.invoiceMonth && transaction.invoiceYear && (
                              <span className="text-gray-500">
                                ({months.find(m => m.value === transaction.invoiceMonth)?.label} {transaction.invoiceYear})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                        <span>Date: {new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.datePaid && (
                          <span>Paid: {new Date(transaction.datePaid).toLocaleDateString()}</span>
                        )}
                        {transaction.referenceNumber && transaction.isPaid && (
                          <span>
                            {transaction.paymentMethod === "check" ? "Check #: " : "Ref #: "}
                            {transaction.referenceNumber}
                          </span>
                        )}
                      </div>
                      
                      {/* Commission section with updated styling based on approval and payment status */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        <div className={`font-medium ${transaction.commissionPaidDate ? 'text-green-600' : transaction.isApproved ? 'text-amber-600' : 'text-gray-500'}`}>
                          Commission: ${transaction.commission?.toFixed(2) || '0.00'}
                          {transaction.commissionPaidDate && (
                            <span className="text-xs ml-2">
                              Paid: {new Date(transaction.commissionPaidDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!transaction.isApproved && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-7 border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => handleApproveCommission(transaction.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          )}
                          {transaction.isApproved && !transaction.commissionPaidDate && onPayCommission && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-50"
                              onClick={() => handlePayCommission(transaction.id)}
                            >
                              <DollarSign className="w-3 h-3 mr-1" /> Mark Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-blue-600"
                      onClick={() => handleEditClick(transaction)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Warning dialog for approving unpaid invoices */}
      <AlertDialog open={approvalWarningOpen} onOpenChange={setApprovalWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Unpaid Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve a commission for an invoice that hasn't been marked as paid yet. 
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelApproval}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmApproval} className="bg-amber-600 hover:bg-amber-700">
              Approve Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        onAddTransaction={onAddTransaction}
        clients={clients}
        clientInfos={clientInfos}
      />

      <EditTransactionDialog
        transaction={currentTransaction}
        open={isEditTransactionOpen}
        onOpenChange={setIsEditTransactionOpen}
        onUpdateTransaction={onUpdateTransaction}
        clients={clients}
        clientInfos={clientInfos}
      />
    </>
  );
};

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
