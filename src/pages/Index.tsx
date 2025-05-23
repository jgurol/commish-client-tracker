import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientList } from "@/components/ClientList";
import { AddClientDialog } from "@/components/AddClientDialog";
import { CommissionChart } from "@/components/CommissionChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { StatsCards } from "@/components/StatsCards";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Keeping for compatibility
  companyName?: string; // Using as primary index
  email: string;
  commissionRate: number;
  totalEarnings: number;
  lastPayment: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string; // Added as primary index
  amount: number;
  date: string;
  description: string;
  datePaid?: string; // Optional field to track when payment was made
  paymentMethod?: string; // Check or Zelle
  referenceNumber?: string; // Check number or Zelle reference
  invoiceMonth?: string; // Month of the invoice period
  invoiceYear?: string; // Year of the invoice period
  invoiceNumber?: string; // Invoice number
  isPaid?: boolean; // Whether the customer has paid the invoice
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      firstName: "Acme",
      lastName: "Corporation",
      name: "Acme Corporation",
      companyName: "Acme Inc.",
      email: "contact@acme.com",
      commissionRate: 5,
      totalEarnings: 12500,
      lastPayment: "2024-05-20"
    },
    {
      id: "2",
      firstName: "Tech",
      lastName: "Solutions",
      name: "Tech Solutions Ltd",
      companyName: "TechSol Group",
      email: "admin@techsolutions.com",
      commissionRate: 7.5,
      totalEarnings: 18750,
      lastPayment: "2024-05-18"
    },
    {
      id: "3",
      firstName: "Global",
      lastName: "Enterprises",
      name: "Global Enterprises",
      companyName: "Global Holdings",
      email: "info@globalent.com",
      commissionRate: 6,
      totalEarnings: 9200,
      lastPayment: "2024-05-15"
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      clientId: "1",
      clientName: "Acme Corporation",
      companyName: "Acme Inc.",
      amount: 2500,
      date: "2024-05-20",
      description: "Q1 Sales Commission",
      paymentMethod: "check",
      referenceNumber: "12345"
    },
    {
      id: "2",
      clientId: "2",
      clientName: "Tech Solutions Ltd",
      companyName: "TechSol Group",
      amount: 3750,
      date: "2024-05-18",
      description: "Monthly Commission",
      paymentMethod: "zelle",
      referenceNumber: "ZL98765"
    },
    {
      id: "3",
      clientId: "3",
      clientName: "Global Enterprises",
      companyName: "Global Holdings",
      amount: 1840,
      date: "2024-05-15",
      description: "Project Completion Bonus"
    }
  ]);

  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const addClient = (newClient: Omit<Client, "id">) => {
    const client: Client = {
      ...newClient,
      id: Date.now().toString(),
    };
    setClients([...clients, client]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const deleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId));
    setTransactions(transactions.filter(transaction => transaction.clientId !== clientId));
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);

    // Update client's total earnings
    setClients(clients.map(client => {
      if (client.id === transaction.clientId) {
        return {
          ...client,
          totalEarnings: client.totalEarnings + transaction.amount,
          lastPayment: transaction.date
        };
      }
      return client;
    }));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(transaction => {
      if (transaction.id === updatedTransaction.id) {
        return updatedTransaction;
      }
      return transaction;
    }));

    // Update client's total earnings if amount has changed
    const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (oldTransaction && oldTransaction.amount !== updatedTransaction.amount) {
      const amountDifference = updatedTransaction.amount - oldTransaction.amount;
      
      setClients(clients.map(client => {
        if (client.id === updatedTransaction.clientId) {
          return {
            ...client,
            totalEarnings: client.totalEarnings + amountDifference,
            lastPayment: updatedTransaction.date
          };
        }
        return client;
      }));
    }

    // If client has changed, update both clients' earnings
    if (oldTransaction && oldTransaction.clientId !== updatedTransaction.clientId) {
      setClients(clients.map(client => {
        if (client.id === oldTransaction.clientId) {
          return {
            ...client,
            totalEarnings: client.totalEarnings - oldTransaction.amount
          };
        }
        if (client.id === updatedTransaction.clientId) {
          return {
            ...client,
            totalEarnings: client.totalEarnings + updatedTransaction.amount,
            lastPayment: updatedTransaction.date
          };
        }
        return client;
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Commission Tracker</h1>
            <p className="text-lg text-gray-600">Manage your client commissions and track earnings</p>
          </div>
          <Button 
            onClick={() => setIsAddClientOpen(true)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards clients={clients} transactions={transactions} />

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CommissionChart transactions={transactions} />
          <RecentTransactions 
            transactions={transactions} 
            clients={clients}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
          />
        </div>

        {/* Client List */}
        <ClientList 
          clients={clients} 
          onUpdateClient={updateClient}
          onDeleteClient={deleteClient}
        />

        {/* Add Client Dialog */}
        <AddClientDialog 
          open={isAddClientOpen}
          onOpenChange={setIsAddClientOpen}
          onAddClient={addClient}
        />
      </div>
    </div>
  );
};

export default Index;
