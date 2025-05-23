
import { useState } from "react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { RecentTransactions } from "@/components/RecentTransactions";
import { CommissionChart } from "@/components/CommissionChart";
import { AgentSummary } from "@/components/AgentSummary";
import { AddClientDialog } from "@/components/AddClientDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Building } from "lucide-react";
import { Link } from "react-router-dom";
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
  onPayCommission: (transactionId: string, paidDate: string) => void;
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
        />

        {/* Quick Actions Card - moved to top */}
        <div className="mb-6">
          <Card className="bg-white shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link to="/agent-management">
                  <Button variant="outline" className="justify-start">
                    <UserCog className="mr-2 h-4 w-4" />
                    Manage Agents
                  </Button>
                </Link>
                <Link to="/client-management">
                  <Button variant="outline" className="justify-start">
                    <Building className="mr-2 h-4 w-4" />
                    Manage Clients
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

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
