
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import { Transaction, Client, ClientInfo } from "@/pages/Index";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
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
import { useAuth } from "@/context/AuthContext";
import { TransactionDebugInfo } from "@/components/TransactionDebugInfo";
import { TransactionFilters } from "@/components/TransactionFilters";
import { TransactionCard } from "@/components/TransactionCard";

interface RecentTransactionsProps {
  transactions: Transaction[];
  clients: Client[];
  clientInfos: ClientInfo[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string, paidDate: string) => void;
  associatedAgentId?: string | null;
}

export const RecentTransactions = ({ 
  transactions, 
  clients, 
  clientInfos,
  onAddTransaction, 
  onUpdateTransaction,
  onApproveCommission,
  onPayCommission,
  associatedAgentId
}: RecentTransactionsProps) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  // State for the approval warning dialog
  const [approvalWarningOpen, setApprovalWarningOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  
  // These filter checkboxes no longer affect filtering - they're kept for UI consistency
  const [includePaidCommissions, setIncludePaidCommissions] = useState(false);
  const [showOnlyPaidInvoices, setShowOnlyPaidInvoices] = useState(true);

  // Get authentication info
  const { user, isAdmin } = useAuth();

  // Display transaction count for debugging
  const transactionCount = transactions.length;
  
  // Enhanced debugging
  console.log("[RecentTransactions] Transactions received:", transactions);
  console.log("[RecentTransactions] Current user:", user?.id);
  console.log("[RecentTransactions] Is admin:", isAdmin);
  console.log("[RecentTransactions] Total transactions count:", transactionCount);
  
  // Added debugging to check client/agent relationship
  transactions.forEach((transaction, index) => {
    console.log(`[RecentTransactions] Transaction ${index + 1} client ID: ${transaction.clientId}`);
    const client = clients.find(c => c.id === transaction.clientId);
    console.log(`[RecentTransactions] Transaction ${index + 1} client name: ${client?.name || 'Unknown'}`);
  });

  // Function to determine if a transaction is from the current month
  const isCurrentMonth = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Function to handle editing a transaction
  const handleEditClick = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsEditTransactionOpen(true);
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
            <CardDescription>Commission payments ({transactionCount} total)</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <TransactionFilters
              showOnlyPaidInvoices={showOnlyPaidInvoices}
              setShowOnlyPaidInvoices={setShowOnlyPaidInvoices}
              includePaidCommissions={includePaidCommissions}
              setIncludePaidCommissions={setIncludePaidCommissions}
            />
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
            <TransactionDebugInfo
              isAdmin={isAdmin}
              transactionCount={transactionCount}
              associatedAgentId={associatedAgentId}
            />
            
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No transactions found</p>
                  {!isAdmin && !associatedAgentId && (
                    <p className="text-xs mt-1">Contact admin to associate your account with an agent</p>
                  )}
                </div>
              ) : (
                // Display ALL transactions passed to this component (no local filtering)
                transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    clientInfos={clientInfos}
                    onEditClick={handleEditClick}
                    onApproveCommission={handleApproveCommission}
                    onPayCommission={onPayCommission ? handlePayCommission : undefined}
                    isCurrentMonth={isCurrentMonth}
                  />
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
