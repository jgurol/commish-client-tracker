
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientList } from "@/components/ClientList";
import { AddClientDialog } from "@/components/AddClientDialog";
import { CommissionChart } from "@/components/CommissionChart";
import { RecentTransactions } from "@/components/RecentTransactions";
import { StatsCards } from "@/components/StatsCards";
import { ClientInfoList } from "@/components/ClientInfoList";
import { AddClientInfoDialog } from "@/components/AddClientInfoDialog";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Keeping for compatibility
  companyName?: string; // Using as primary index for Agent name
  email: string;
  commissionRate: number;
  totalEarnings: number;
  lastPayment: string;
  // New fields for client information
  clients?: ClientInfo[]; // Linked clients to this agent
}

// New interface for client information
export interface ClientInfo {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string; // Added as primary index for Agent name
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
  clientInfoId?: string; // Reference to the client info
  clientCompanyName?: string; // Client company name for display
  commission?: number; // Commission amount
  isApproved?: boolean; // Whether the commission has been approved
  commissionPaidDate?: string; // New field to track when commission was paid
}

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New state for client information
  const [clientInfos, setClientInfos] = useState<ClientInfo[]>([
    {
      id: "1",
      companyName: "Tech Corp",
      contactName: "John Smith",
      email: "john@techcorp.com",
      phone: "555-123-4567",
      createdAt: "2024-05-10",
      updatedAt: "2024-05-10"
    },
    {
      id: "2",
      companyName: "InnoSoft Solutions",
      contactName: "Jane Doe",
      email: "jane@innosoft.com",
      phone: "555-987-6543",
      createdAt: "2024-05-12",
      updatedAt: "2024-05-15"
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
  // New state for client info dialog
  const [isAddClientInfoOpen, setIsAddClientInfoOpen] = useState(false);

  // Fetch agents from the database
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*');

      if (error) throw error;

      if (data) {
        // Transform data to match Client interface
        const formattedClients: Client[] = data.map(agent => ({
          id: agent.id,
          firstName: agent.first_name,
          lastName: agent.last_name,
          name: `${agent.first_name} ${agent.last_name}`,
          companyName: agent.company_name || '',
          email: agent.email,
          commissionRate: Number(agent.commission_rate),
          totalEarnings: Number(agent.total_earnings || 0),
          lastPayment: agent.last_payment || new Date().toISOString().split('T')[0]
        }));

        setClients(formattedClients);
      }
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: `Failed to fetch agents: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addClient = (newClient: Omit<Client, "id">) => {
    // Local state update is now handled after DB insert in AddClientDialog
    const client: Client = {
      ...newClient,
      id: Date.now().toString(), // This ID will be replaced by the DB-generated one
    };
    setClients([...clients, client]);
  };

  const updateClient = (updatedClient: Client) => {
    // Local state update - database update is handled in ClientList component
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  const deleteClient = (clientId: string) => {
    // Local state update - database deletion is handled in ClientList component
    setClients(clients.filter(client => client.id !== clientId));
    setTransactions(transactions.filter(transaction => transaction.clientId !== clientId));
  };

  // New function to update transactions
  const updateTransactions = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions);
  };

  // New function to add client info
  const addClientInfo = (newClientInfo: Omit<ClientInfo, "id" | "createdAt" | "updatedAt">) => {
    const clientInfo: ClientInfo = {
      ...newClientInfo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setClientInfos([...clientInfos, clientInfo]);
  };

  // New function to update client info
  const updateClientInfo = (updatedClientInfo: ClientInfo) => {
    setClientInfos(clientInfos.map(clientInfo => 
      clientInfo.id === updatedClientInfo.id ? 
        { ...updatedClientInfo, updatedAt: new Date().toISOString().split('T')[0] } : 
        clientInfo
    ));
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    // Find the client to get their commission rate
    const client = clients.find(c => c.id === transaction.clientId);
    
    // Calculate commission based on client's commission rate
    const commissionRate = client ? client.commissionRate : 0;
    const commissionAmount = transaction.amount * (commissionRate / 100);
    
    // Process clientInfoId to handle the "none" value
    const processedTransaction = {
      ...transaction,
      clientInfoId: transaction.clientInfoId === "none" ? undefined : transaction.clientInfoId,
      id: Date.now().toString(),
      // Set calculated commission based on client's rate
      commission: commissionAmount,
      isApproved: false, // Default to not approved
    };
    
    setTransactions([processedTransaction, ...transactions]);

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
    // Process clientInfoId to handle the "none" value
    const processedTransaction = {
      ...updatedTransaction,
      clientInfoId: updatedTransaction.clientInfoId === "none" ? undefined : updatedTransaction.clientInfoId,
    };
    
    // If we need to recalculate the commission (e.g., if amount or client changed)
    if (updatedTransaction.clientId) {
      const client = clients.find(c => c.id === updatedTransaction.clientId);
      if (client) {
        // Recalculate commission based on the client's rate and new amount
        processedTransaction.commission = updatedTransaction.amount * (client.commissionRate / 100);
      }
    }
    
    setTransactions(transactions.map(transaction => {
      if (transaction.id === processedTransaction.id) {
        return processedTransaction;
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

  // New function to approve a commission
  const approveCommission = (transactionId: string) => {
    setTransactions(transactions.map(transaction => {
      if (transaction.id === transactionId) {
        return {
          ...transaction,
          isApproved: true
        };
      }
      return transaction;
    }));
  };

  // Updated function to handle mark commission as paid
  const payCommission = (transactionId: string, paidDate: string) => {
    setTransactions(transactions.map(transaction => {
      if (transaction.id === transactionId) {
        return {
          ...transaction,
          commissionPaidDate: paidDate
        };
      }
      return transaction;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatsCards clients={clients} transactions={transactions} />

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CommissionChart transactions={transactions} />
          <RecentTransactions 
            transactions={transactions} 
            clients={clients}
            clientInfos={clientInfos}
            onAddTransaction={addTransaction}
            onUpdateTransaction={updateTransaction}
            onApproveCommission={approveCommission}
            onPayCommission={payCommission}
          />
        </div>

        {/* Client List */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Agents</h2>
          <Button 
            onClick={() => setIsAddClientOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agent
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">Loading agents...</div>
        ) : (
          <ClientList 
            clients={clients} 
            transactions={transactions}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
            onUpdateTransactions={updateTransactions}
            onFetchClients={fetchAgents}
          />
        )}

        {/* Add Client Dialog */}
        <AddClientDialog 
          open={isAddClientOpen}
          onOpenChange={setIsAddClientOpen}
          onAddClient={addClient}
          onFetchClients={fetchAgents}
        />

        {/* Client info management UI */}
        <Card className="bg-white shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Client Management</CardTitle>
            <CardDescription>Manage your clients' information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setIsAddClientInfoOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
            <ClientInfoList 
              clientInfos={clientInfos}
              onUpdateClientInfo={updateClientInfo}
            />
          </CardContent>
        </Card>

        {/* Add ClientInfo Dialog */}
        <AddClientInfoDialog
          open={isAddClientInfoOpen}
          onOpenChange={setIsAddClientInfoOpen}
          onAddClientInfo={addClientInfo}
        />
      </div>
    </div>
  );
};

export default Index;
