
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Pencil, CheckCircle, Clock, Building, FileText, Users } from "lucide-react";
import { Transaction, Client, ClientInfo } from "@/pages/Index";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";

interface RecentTransactionsProps {
  transactions: Transaction[];
  clients: Client[];
  clientInfos: ClientInfo[]; // Add clientInfos prop
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
}

export const RecentTransactions = ({ 
  transactions, 
  clients, 
  clientInfos, // Add clientInfos
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

  // Function to determine if a transaction is from the current month
  const isCurrentMonth = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
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
                      {transaction.isPaid ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        isCurrentMonth(transaction.date) && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Due
                          </Badge>
                        )
                      )}
                      {transaction.paymentMethod && transaction.isPaid && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {transaction.paymentMethod === "check" ? "Check" : "Zelle"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-1 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      {transaction.companyName}
                    </div>
                    {/* Display client company if available */}
                    {transaction.clientInfoId && (
                      <div className="flex items-center gap-1 mb-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        Client: {transaction.clientCompanyName || clientInfos.find(ci => ci.id === transaction.clientInfoId)?.companyName || "N/A"}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      {transaction.invoiceNumber && (
                        <>
                          <FileText className="w-3 h-3" />
                          <span>Invoice #{transaction.invoiceNumber}</span>
                          {transaction.invoiceMonth && transaction.invoiceYear && (
                            <span className="text-gray-500">
                              ({months.find(m => m.value === transaction.invoiceMonth)?.label} {transaction.invoiceYear})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      <span>Date: {new Date(transaction.date).toLocaleDateString()}</span>
                      {transaction.datePaid && (
                        <span>Paid: {new Date(transaction.datePaid).toLocaleDateString()}</span>
                      )}
                      {transaction.referenceNumber && transaction.isPaid && (
                        <span>
                          {transaction.paymentMethod === "check" ? "Check #: " : "Ref #: "}
                          {transaction.referenceNumber}
                        </span>
                      )}
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

// Array for month names - needed for display
const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
