
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
  const { isAdmin } = useAuth();

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
        />

        {/* Main Content - Transactions taking full width */}
        <div className="space-y-6">
          {/* Transactions Section - Full Width */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            
            <RecentTransactions 
              transactions={transactions} 
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

          {/* Bottom section with Chart and Agent Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Commission Chart */}
            <div className="lg:col-span-2">
              <CommissionChart 
                transactions={transactions} 
              />
            </div>

            {/* Agent Summary - moved to bottom */}
            <div>
              <AgentSummary 
                clients={clients} 
                transactions={transactions}
                isAdmin={isAdmin} 
              />
            </div>
          </div>
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
