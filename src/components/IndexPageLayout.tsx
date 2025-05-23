
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
  onAddClient: (client: Omit<Client, "id" | "totalEarnings" | "lastPayment">) => void;
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission: (transactionId: string, paidDate: string) => void;
  onFetchClients: () => void;
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left side - Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            
            {/* Recent Transactions Component */}
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

            {/* Commission Chart */}
            <CommissionChart 
              transactions={transactions} 
            />
          </div>

          {/* Right side - Agent Summary instead of full ClientList */}
          <div className="space-y-6">
            <AgentSummary 
              clients={clients} 
              transactions={transactions}
              isAdmin={isAdmin} 
            />
            
            {/* Additional card for quick access */}
            <Card className="bg-white shadow border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/agent-management">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCog className="mr-2 h-4 w-4" />
                    Manage Agents
                  </Button>
                </Link>
                <Link to="/client-management">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="mr-2 h-4 w-4" />
                    Manage Clients
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
