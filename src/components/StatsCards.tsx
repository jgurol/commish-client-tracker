
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Client, Transaction } from "@/pages/Index";

interface StatsCardsProps {
  clients: Client[];
  transactions: Transaction[];
}

export const StatsCards = ({ clients, transactions }: StatsCardsProps) => {
  const totalEarnings = clients.reduce((sum, client) => sum + client.totalEarnings, 0);
  const avgCommissionRate = clients.length > 0 
    ? clients.reduce((sum, client) => sum + client.commissionRate, 0) / clients.length 
    : 0;
  const thisMonthEarnings = transactions
    .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{clients.length}</div>
          <p className="text-xs text-gray-500">Active commission clients</p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</div>
          <p className="text-xs text-gray-500">All-time commission earnings</p>
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

      <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">${thisMonthEarnings.toLocaleString()}</div>
          <p className="text-xs text-gray-500">Commission earnings</p>
        </CardContent>
      </Card>
    </div>
  );
};
