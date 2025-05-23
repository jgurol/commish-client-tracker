
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Transaction, Client, ClientInfo } from "@/pages/Index";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { TransactionHeader } from "@/components/TransactionHeader";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionEmptyState } from "@/components/TransactionEmptyState";
import { ApprovalWarningDialog } from "@/components/ApprovalWarningDialog";
import { useAuth } from "@/context/AuthContext";

interface RecentTransactionsProps {
  transactions: Transaction[];
  clients: Client[];
  clientInfos: ClientInfo[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string, paidDate: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
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
  onDeleteTransaction,
  associatedAgentId
}: RecentTransactionsProps) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [approvalWarningOpen, setApprovalWarningOpen] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  
  // These filter checkboxes no longer affect filtering - they're kept for UI consistency
  const [includePaidCommissions, setIncludePaidCommissions] = useState(false);
  const [showOnlyPaidInvoices, setShowOnlyPaidInvoices] = useState(true);

  // Function to determine if a transaction is from the current month
  const isCurrentMonth = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Function to handle editing a transaction - only for admins
  const handleEditClick = (transaction: Transaction) => {
    if (!isAdmin) return;
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
        <CardHeader>
          <TransactionHeader
            transactionCount={transactions.length}
            showOnlyPaidInvoices={showOnlyPaidInvoices}
            setShowOnlyPaidInvoices={setShowOnlyPaidInvoices}
            includePaidCommissions={includePaidCommissions}
            setIncludePaidCommissions={setIncludePaidCommissions}
            onAddTransaction={() => setIsAddTransactionOpen(true)}
          />
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-6">
              <TransactionEmptyState associatedAgentId={associatedAgentId} />
            </div>
          ) : (
            <TransactionTable
              transactions={transactions}
              clientInfos={clientInfos}
              onEditClick={isAdmin ? handleEditClick : undefined}
              onApproveCommission={onApproveCommission}
              onPayCommission={onPayCommission ? handlePayCommission : undefined}
              onDeleteTransaction={onDeleteTransaction}
              isCurrentMonth={isCurrentMonth}
            />
          )}
        </CardContent>
      </Card>

      <ApprovalWarningDialog
        open={approvalWarningOpen}
        onOpenChange={setApprovalWarningOpen}
        onConfirm={handleConfirmApproval}
        onCancel={handleCancelApproval}
      />

      {isAdmin && (
        <>
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
      )}
    </>
  );
};
