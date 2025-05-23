
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Percent, DollarSign, Users, Building, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Client, Transaction } from "@/pages/Index";
import { EditClientDialog } from "@/components/EditClientDialog";

interface ClientListProps {
  clients: Client[];
  transactions: Transaction[]; // Add transactions to props
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientList = ({ clients, transactions, onUpdateClient, onDeleteClient }: ClientListProps) => {
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Function to calculate commission totals for a specific client
  const calculateClientCommissions = (clientId: string) => {
    const clientTransactions = transactions.filter(t => t.clientId === clientId);
    
    const paidCommissions = clientTransactions
      .filter(t => t.isPaid && t.commission)
      .reduce((sum, t) => sum + (t.commission || 0), 0);
      
    const approvedUnpaidCommissions = clientTransactions
      .filter(t => !t.isPaid && t.isApproved && t.commission)
      .reduce((sum, t) => sum + (t.commission || 0), 0);
      
    const unapprovedCommissions = clientTransactions
      .filter(t => !t.isApproved && t.commission)
      .reduce((sum, t) => sum + (t.commission || 0), 0);

    return {
      paid: paidCommissions,
      approvedUnpaid: approvedUnpaidCommissions,
      unapproved: unapprovedCommissions,
      total: paidCommissions + approvedUnpaidCommissions + unapprovedCommissions
    };
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Agent Management</CardTitle>
          <CardDescription>Manage your commission agents and their rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No agents added yet. Click "Add Agent" to get started!</p>
              </div>
            ) : (
              clients.map((client) => {
                const commissions = calculateClientCommissions(client.id);
                
                return (
                  <div
                    key={client.id}
                    className="flex flex-col p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {client.commissionRate}% commission
                          </Badge>
                        </div>
                        {client.companyName && (
                          <div className="flex items-center gap-1 mb-1 text-sm text-gray-600">
                            <Building className="w-4 h-4" />
                            {client.companyName}
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Total: ${client.totalEarnings.toLocaleString()}
                          </div>
                          <div className="text-gray-500">
                            Last payment: {new Date(client.lastPayment).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingClient(client)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteClient(client.id)}
                          className="hover:bg-red-50 hover:border-red-300 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Commission breakdown section */}
                    <div className="mt-2 border-t border-gray-100 pt-3">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Commission Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Total Commissions</span>
                            <DollarSign className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="font-semibold">
                            ${commissions.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Paid</span>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </div>
                          <div className="font-semibold text-green-600">
                            ${commissions.paid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Approved (Unpaid)</span>
                            <Clock className="h-3 w-3 text-amber-600" />
                          </div>
                          <div className="font-semibold text-amber-600">
                            ${commissions.approvedUnpaid.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Unapproved</span>
                            <AlertCircle className="h-3 w-3 text-gray-600" />
                          </div>
                          <div className="font-semibold text-gray-500">
                            ${commissions.unapproved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {editingClient && (
        <EditClientDialog
          client={editingClient}
          open={!!editingClient}
          onOpenChange={(open) => !open && setEditingClient(null)}
          onUpdateClient={onUpdateClient}
        />
      )}
    </>
  );
};
