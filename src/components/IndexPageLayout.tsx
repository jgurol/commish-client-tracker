
import { useState } from "react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { RecentTransactions } from "@/components/RecentTransactions";
import { CommissionChart } from "@/components/CommissionChart";
import { AgentSummary } from "@/components/AgentSummary";
import { AddClientDialog } from "@/components/AddClientDialog";
import { Client, Transaction, ClientInfo } from "@/pages/Index";
import { useAuth } from "@/context/AuthContext";

interface IndexPageLayoutProps {
  clients: Client[];
  transactions: Transaction[];
  clientInfos: ClientInfo[];
  associatedAgentId: string | null;
  onAddClient: (client: Omit<Client, "id" | "totalEarnings" | "lastPayment">) => Promise<void>;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission: (transactionId: string, paymentData: {
    paidDate: string;
    paymentMethod: string;
    referenceNumber: string;
  }) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onFetchClients: () => Promise<void>;
}

export const IndexPageLayout = ({
  clients,
  transactions,
  clientInfos,
  associatedAgentId,
  onAddClient,
  onAddTransaction,
  onUpdateTransaction,
  onApproveCommission,
  onPayCommission,
  onDeleteTransaction,
  onFetchClients
}: IndexPageLayoutProps) => {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  // Filter transactions based on the selected filter
  const getFilteredTransactions = () => {
    if (!transactionFilter) return transactions;

    switch (transactionFilter) {
      case 'unapproved':
        // Transactions with unpaid invoices, unpaid commissions, and unapproved status
        return transactions.filter(t => !t.isPaid && !t.commissionPaidDate && !t.isApproved);
      
      case 'qualified':
        // Transactions with paid invoices but not commissioned or approved for commission
        return transactions.filter(t => t.isPaid && !t.isApproved && !t.commissionPaidDate);
      
      case 'approved':
        // Transactions that are paid invoices and have been approved
        return transactions.filter(t => t.isPaid && t.isApproved && !t.commissionPaidDate);
      
      case 'paid':
        // Transactions that are paid invoice, commission paid
        return transactions.filter(t => t.isPaid && t.commissionPaidDate);
      
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatsCards 
          clients={clients}
          transactions={transactions}
          clientInfos={clientInfos}
          isAdmin={isAdmin}
          associatedAgentId={associatedAgentId}
          onFilterChange={setTransactionFilter}
          activeFilter={transactionFilter}
        />

        {/* Main Content - Transactions taking full width */}
        <div className="space-y-6">
          {/* Transactions Section - Full Width */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Activity
                {transactionFilter && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    (Filtered by {transactionFilter === 'unapproved' ? 'Unqualified Commissions' : 
                                transactionFilter === 'qualified' ? 'Qualified Commissions' :
                                transactionFilter === 'approved' ? 'Approved Commissions' : 
                                'Paid Commissions'})
                  </span>
                )}
              </h2>
              {transactionFilter && (
                <button
                  onClick={() => setTransactionFilter(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            <RecentTransactions 
              transactions={filteredTransactions} 
              clients={clients}
              clientInfos={clientInfos}
              onAddTransaction={onAddTransaction}
              onUpdateTransaction={onUpdateTransaction}
              onApproveCommission={onApproveCommission}
              onPayCommission={onPayCommission}
              onDeleteTransaction={onDeleteTransaction}
              associatedAgentId={associatedAgentId}
            />
          </div>

          {/* Bottom section with Chart and Agent Summary - Only for admins/owners */}
          {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Commission Chart */}
              <div className="lg:col-span-2">
                <CommissionChart 
                  transactions={filteredTransactions} 
                />
              </div>

              {/* Agent Summary */}
              <div>
                <AgentSummary 
                  clients={clients} 
                  transactions={filteredTransactions}
                  allTransactions={transactions}
                  isAdmin={isAdmin}
                  activeFilter={transactionFilter}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Dialog */}
      {isAdmin && (
        <AddClientDialog 
          open={isAddClientOpen}
          onOpenChange={setIsAddClientOpen}
          onAddClient={onAddClient}
          onFetchClients={onFetchClients}
        />
      )}
    </div>
  );
};
