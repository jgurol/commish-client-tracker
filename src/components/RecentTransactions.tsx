
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Pencil } from "lucide-react";
import { Transaction, Client } from "@/pages/Index";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";

interface RecentTransactionsProps {
  transactions: Transaction[];
  clients: Client[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

export const RecentTransactions = ({ 
  transactions, 
  clients, 
  onAddTransaction, 
  onUpdateTransaction 
}: RecentTransactionsProps) => {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const recentTransactions = transactions.slice(0, 5);

  const handleEditClick = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsEditTransactionOpen(true);
  };

  return (
    <>
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
            <CardDescription>Latest commission payments</CardDescription>
          </div>
          <Button 
            size="sm"
            onClick={() => setIsAddTransactionOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No transactions yet</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
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
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.date).toLocaleDateString()}
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
          {transactions.length > 5 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm">
                View All Transactions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        onAddTransaction={onAddTransaction}
        clients={clients}
      />

      <EditTransactionDialog
        transaction={currentTransaction}
        open={isEditTransactionOpen}
        onOpenChange={setIsEditTransactionOpen}
        onUpdateTransaction={onUpdateTransaction}
        clients={clients}
      />
    </>
  );
};
