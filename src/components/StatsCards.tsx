
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, ArrowRight, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { Client, Transaction, ClientInfo } from "@/pages/Index";

interface StatsCardsProps {
  clients: Client[];
  transactions: Transaction[];
  clientInfos: ClientInfo[];
  isAdmin: boolean;
  associatedAgentId?: string | null;
}

export const StatsCards = ({ clients, transactions, clientInfos, isAdmin, associatedAgentId }: StatsCardsProps) => {
  // Safely calculate totals with null checks
  const totalRevenue = transactions && transactions.length > 0
    ? transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    : 0;
  
  const avgCommissionRate = clients && clients.length > 0 
    ? clients.reduce((sum, client) => sum + client.commissionRate, 0) / clients.length 
    : 0;
    
  // Calculate qualified commissions with null checks - transactions with paid invoices but not approved commissions
  const qualifiedCommissions = transactions && transactions.length > 0
    ? transactions
        .filter(t => t.isPaid && !t.isApproved && t.commission)
        .reduce((sum, t) => sum + (t.commission || 0), 0)
    : 0;

  // Calculate commission totals with null checks
  const paidCommissions = transactions && transactions.length > 0
    ? transactions
        .filter(t => t.commissionPaidDate && t.commission)
        .reduce((sum, t) => sum + (t.commission || 0), 0)
    : 0;
    
  const approvedUnpaidCommissions = transactions && transactions.length > 0
    ? transactions
        .filter(t => !t.commissionPaidDate && t.isApproved && t.commission)
        .reduce((sum, t) => sum + (t.commission || 0), 0)
    : 0;
    
  const unapprovedCommissions = transactions && transactions.length > 0
    ? transactions
        .filter(t => !t.isApproved && !t.isPaid && t.commission)
        .reduce((sum, t) => sum + (t.commission || 0), 0)
    : 0;

  // Filter client infos for agents - only show clients associated with this agent
  const getClientInfoCount = () => {
    if (isAdmin) {
      return clientInfos ? clientInfos.length : 0;
    } else {
      // For agents, only count client infos where agent_id matches associatedAgentId
      return clientInfos 
        ? clientInfos.filter(clientInfo => clientInfo.agent_id === associatedAgentId).length 
        : 0;
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <Link to="/agent-management" className="block">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 hover:scale-105 transform cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Agents</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{clients ? clients.length : 0}</div>
                  <p className="text-xs text-gray-500">Active commission agents</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/client-management" className="block">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 hover:scale-105 transform cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
                  <Building className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{getClientInfoCount()}</div>
                  <p className="text-xs text-gray-500">Client companies</p>
                </CardContent>
              </Card>
            </Link>
          </>
        ) : (
          <Link to="/client-management" className="block">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 hover:scale-105 transform cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
                <Building className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{getClientInfoCount()}</div>
                <p className="text-xs text-gray-500">Associated client companies</p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">All-time invoice amounts</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Commission Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgCommissionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Average across all clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Flow Cards - Linear Row with Arrows */}
      <div className="flex items-center gap-4 overflow-x-auto">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unapproved Commissions</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">${unapprovedCommissions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-gray-500">Pending client payment</p>
          </CardContent>
        </Card>

        <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Qualified Commissions</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${qualifiedCommissions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-gray-500">Paid invoices with unapproved commissions</p>
          </CardContent>
        </Card>

        <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Commissions</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${approvedUnpaidCommissions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-gray-500">Approved but unpaid</p>
          </CardContent>
        </Card>

        <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />

        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0 flex-shrink-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Commissions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidCommissions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-gray-500">Transactions marked paid</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
