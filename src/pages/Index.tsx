import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { RecentTransactions } from "@/components/RecentTransactions";
import { ClientList } from "@/components/ClientList";
import { AddClientDialog } from "@/components/AddClientDialog";
import { CommissionChart } from "@/components/CommissionChart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Define the Client type
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  companyName: string | null;
  commissionRate: number;
  totalEarnings: number;
  lastPayment: string;
}

// Define the Transaction type
export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  amount: number;
  date: string;
  description: string;
  datePaid?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  invoiceMonth?: string;
  invoiceYear?: string;
  invoiceNumber?: string;
  isPaid?: boolean;
  commission?: number;
  isApproved?: boolean;
  clientInfoId?: string;
  clientCompanyName?: string;
  commissionPaidDate?: string;
}

// Define the ClientInfo type
export interface ClientInfo {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

const IndexPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientInfos, setClientInfos] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [associatedAgentId, setAssociatedAgentId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Fetch the associated agent ID for the current user
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Fetch user's profile to get associated agent ID
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('associated_agent_id')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('[fetchUserProfile] Error fetching user profile:', error);
        return;
      }
      
      console.log("[fetchUserProfile] User profile data:", data);
      setAssociatedAgentId(data?.associated_agent_id || null);
    } catch (err) {
      console.error('[fetchUserProfile] Exception fetching user profile:', err);
    }
  };

  // Load clients from Supabase when component mounts
  useEffect(() => {
    if (associatedAgentId !== undefined) {
      fetchClients();
      fetchClientInfos();
    }
  }, [associatedAgentId]);

  // Function to fetch transactions from Supabase
  useEffect(() => {
    if (clients.length > 0) {
      fetchTransactions();
    }
  }, [clients]);

  // Function to fetch clients from Supabase
  const fetchClients = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // If admin, fetch all agents, otherwise fetch only the associated agent
      let query = supabase.from('agents').select('*');
      
      // If user is not admin and has an associated agent, filter by that agent ID
      if (!isAdmin && associatedAgentId) {
        query = query.eq('id', associatedAgentId);
      }
      
      query = query.order('last_name', { ascending: true });
      
      const { data, error } = await query;

      if (error) {
        console.error('[fetchClients] Error fetching agents:', error);
        toast({
          title: "Failed to load agents",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log("[fetchClients] Fetched agents:", data);

      // Map the data to match our Client interface
      const mappedClients: Client[] = data?.map(agent => ({
        id: agent.id,
        firstName: agent.first_name,
        lastName: agent.last_name,
        name: `${agent.first_name} ${agent.last_name}`,
        email: agent.email,
        companyName: agent.company_name,
        commissionRate: agent.commission_rate,
        totalEarnings: agent.total_earnings || 0,
        lastPayment: agent.last_payment ? new Date(agent.last_payment).toISOString() : new Date().toISOString()
      })) || [];

      setClients(mappedClients);
    } catch (err) {
      console.error('[fetchClients] Error in client fetch:', err);
      toast({
        title: "Error",
        description: "Failed to load agent data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch client info from Supabase
  const fetchClientInfos = async () => {
    if (!user) return;
    
    try {
      let query = supabase.from('client_info').select('*');
      
      query = query.order('company_name', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[fetchClientInfos] Error fetching client info:', error);
        toast({
          title: "Failed to load clients",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log("[fetchClientInfos] Fetched client infos:", data);
        setClientInfos(data || []);
      }
    } catch (err) {
      console.error('[fetchClientInfos] Error in client info fetch:', err);
      toast({
        title: "Error",
        description: "Failed to load client information",
        variant: "destructive"
      });
    }
  };

  // COMPLETELY FIXED transaction fetch function
  const fetchTransactions = async () => {
    if (!user) {
      console.log("❌ [fetchTransactions] No user found, skipping transaction fetch");
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log("=== TRANSACTION FETCH DEBUGGING (FIXED) ===");
      console.log("[fetchTransactions] Current user:", user.id);
      console.log("[fetchTransactions] User email:", user.email);
      console.log("[fetchTransactions] User isAdmin:", isAdmin);
      console.log("[fetchTransactions] Associated agent ID:", associatedAgentId);
      
      // Build the query with COMPLETELY FIXED filtering logic
      let query = supabase.from('transactions').select('*');
      
      // ADMIN USERS: See ALL transactions with NO filtering whatsoever
      if (isAdmin) {
        console.log("🔍 [fetchTransactions] ADMIN MODE - NO FILTERING - fetching ALL transactions");
        // Admins see everything - absolutely no WHERE clauses
      } else {
        // NON-ADMIN USERS: Only see transactions where client_id matches their associated agent
        if (associatedAgentId) {
          console.log(`🔍 [fetchTransactions] NON-ADMIN MODE - filtering for agent ID: ${associatedAgentId}`);
          query = query.eq('client_id', associatedAgentId);
        } else {
          console.log("🔍 [fetchTransactions] NON-ADMIN USER without agent ID - returning empty results");
          // For non-admin users without agent ID, use a condition that will never match
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }
      
      // Add ordering to ensure consistent results
      query = query.order('created_at', { ascending: false });
      
      console.log("[fetchTransactions] Executing query...");
      
      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error('❌ [fetchTransactions] Error fetching transactions:', error);
        toast({
          title: "Failed to load transactions",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log("✅ [fetchTransactions] Raw transaction data from database:", data);
      console.log("✅ [fetchTransactions] Number of transactions fetched:", data?.length || 0);

      // Log each transaction in detail
      if (data && data.length > 0) {
        console.log("=== INDIVIDUAL TRANSACTION DETAILS ===");
        data.forEach((trans, index) => {
          console.log(`[fetchTransactions] Transaction ${index + 1}:`, {
            id: trans.id,
            client_id: trans.client_id,
            user_id: trans.user_id,
            amount: trans.amount,
            description: trans.description,
            date: trans.date,
            client_info_id: trans.client_info_id,
            is_paid: trans.is_paid,
            commission: trans.commission,
            created_at: trans.created_at
          });
        });
      } else {
        console.log("❌ [fetchTransactions] NO TRANSACTIONS RETURNED FROM DATABASE");
        console.log("[fetchTransactions] This could indicate:");
        console.log("- Database is empty");
        console.log("- RLS policies are blocking access");
        console.log("- Query filtering is too restrictive");
      }

      // Map database transactions to our Transaction interface
      console.log("🔄 [fetchTransactions] Mapping transactions...");
      console.log("[fetchTransactions] Available clients for mapping:", clients.map(c => ({ id: c.id, name: c.name })));
      
      const mappedTransactions = await Promise.all(data?.map(async (transaction) => {
        console.log(`🔄 [fetchTransactions] Processing transaction ${transaction.id} for client_id: ${transaction.client_id}`);
        
        // Find client for this transaction
        const client = clients.find(c => c.id === transaction.client_id);
        console.log(`[fetchTransactions] Client found for transaction ${transaction.id}:`, client?.name || "❌ NOT FOUND");
        
        // Find client info for this transaction if available
        let clientInfo = null;
        if (transaction.client_info_id) {
          clientInfo = clientInfos.find(ci => ci.id === transaction.client_info_id);
          console.log(`[fetchTransactions] Client info found for transaction ${transaction.id}:`, clientInfo?.company_name || "❌ NOT FOUND");
        }

        const mappedTransaction = {
          id: transaction.id,
          clientId: transaction.client_id,
          clientName: client?.name || "Unknown Agent",
          companyName: client?.companyName || client?.name || "Unknown Company",
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
          datePaid: transaction.date_paid,
          paymentMethod: transaction.payment_method,
          referenceNumber: transaction.reference_number,
          invoiceMonth: transaction.invoice_month,
          invoiceYear: transaction.invoice_year,
          invoiceNumber: transaction.invoice_number,
          isPaid: transaction.is_paid,
          commission: transaction.commission,
          isApproved: transaction.is_approved,
          clientInfoId: transaction.client_info_id,
          clientCompanyName: clientInfo?.company_name,
          commissionPaidDate: transaction.commission_paid_date
        };
        
        console.log(`✅ [fetchTransactions] Mapped transaction ${transaction.id}:`, mappedTransaction);
        return mappedTransaction;
      }) || []);

      console.log("✅ [fetchTransactions] Final mapped transactions:", mappedTransactions);
      console.log("✅ [fetchTransactions] Total mapped transactions:", mappedTransactions.length);
      console.log("=== END TRANSACTION FETCH DEBUGGING ===");
      
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('💥 [fetchTransactions] Exception in transaction fetch:', err);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a new client to Supabase
  const addClient = async (newClient: Omit<Client, "id" | "totalEarnings" | "lastPayment">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          first_name: newClient.firstName,
          last_name: newClient.lastName,
          email: newClient.email,
          company_name: newClient.companyName,
          commission_rate: newClient.commissionRate,
          user_id: user.id,
          total_earnings: 0,
          last_payment: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding agent:', error);
        toast({
          title: "Failed to add agent",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        // Map the returned data to our Client interface
        const newClientWithId: Client = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          companyName: data.company_name,
          commissionRate: data.commission_rate,
          totalEarnings: data.total_earnings || 0,
          lastPayment: data.last_payment ? new Date(data.last_payment).toISOString() : new Date().toISOString()
        };

        setClients([...clients, newClientWithId]);
        toast({
          title: "Agent added",
          description: `${newClientWithId.name} has been added successfully.`,
        });
      }
    } catch (err) {
      console.error('Error in add client operation:', err);
      toast({
        title: "Error",
        description: "Failed to add agent",
        variant: "destructive"
      });
    }
  };

  // Function to add a new transaction to Supabase
  const addTransaction = async (newTransaction: Omit<Transaction, "id">) => {
    if (!user) return;
    
    try {
      // Find the client to get their commission rate
      const client = clients.find(c => c.id === newTransaction.clientId);
      if (!client) {
        toast({
          title: "Error",
          description: "Client not found",
          variant: "destructive"
        });
        return;
      }

      // Calculate commission based on client's rate
      const commission = (client.commissionRate / 100) * newTransaction.amount;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          client_id: newTransaction.clientId,
          client_info_id: newTransaction.clientInfoId === "none" ? null : newTransaction.clientInfoId,
          amount: newTransaction.amount,
          date: newTransaction.date,
          description: newTransaction.description,
          date_paid: newTransaction.datePaid,
          payment_method: newTransaction.paymentMethod,
          reference_number: newTransaction.referenceNumber,
          invoice_month: newTransaction.invoiceMonth,
          invoice_year: newTransaction.invoiceYear,
          invoice_number: newTransaction.invoiceNumber,
          is_paid: newTransaction.isPaid || false,
          commission: commission,
          is_approved: false, // Default to not approved
          commission_paid_date: newTransaction.commissionPaidDate,
          user_id: user.id
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Failed to add transaction",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        // Refresh transactions to get the new one
        fetchTransactions();
        toast({
          title: "Transaction added",
          description: `Transaction for ${client.name} has been added successfully.`,
        });
      }
    } catch (err) {
      console.error('Error in add transaction operation:', err);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  // Function to update a transaction in Supabase
  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;
    
    try {
      // Find the client to get their commission rate
      const client = clients.find(c => c.id === updatedTransaction.clientId);
      if (!client) {
        toast({
          title: "Error",
          description: "Client not found",
          variant: "destructive"
        });
        return;
      }

      // Calculate commission based on client's rate
      const commission = (client.commissionRate / 100) * updatedTransaction.amount;

      const { data, error } = await supabase
        .from('transactions')
        .update({
          client_id: updatedTransaction.clientId,
          client_info_id: updatedTransaction.clientInfoId === "none" ? null : updatedTransaction.clientInfoId,
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
          description: updatedTransaction.description,
          date_paid: updatedTransaction.datePaid,
          payment_method: updatedTransaction.paymentMethod,
          reference_number: updatedTransaction.referenceNumber,
          invoice_month: updatedTransaction.invoiceMonth,
          invoice_year: updatedTransaction.invoiceYear,
          invoice_number: updatedTransaction.invoiceNumber,
          is_paid: updatedTransaction.isPaid || false,
          commission: commission,
          is_approved: updatedTransaction.isApproved || false,
          commission_paid_date: updatedTransaction.commissionPaidDate
        })
        .eq('id', updatedTransaction.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        toast({
          title: "Failed to update transaction",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to get the updated one
        fetchTransactions();
        toast({
          title: "Transaction updated",
          description: `Transaction for ${client.name} has been updated successfully.`,
        });
      }
    } catch (err) {
      console.error('Error in update transaction operation:', err);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    }
  };

  // Function to update a client in Supabase
  const updateClient = async (updatedClient: Client) => {
    // Update locally first
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
  };

  // Function to delete a client
  const deleteClient = async (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId));
  };

  // Function to approve a commission
  const approveCommission = async (transactionId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          is_approved: true
        })
        .eq('id', transactionId)
        .select('*')
        .single();

      if (error) {
        console.error('[approveCommission] Error approving commission:', error);
        toast({
          title: "Failed to approve commission",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to get the updated one
        fetchTransactions();
        toast({
          title: "Commission approved",
          description: "The commission has been approved successfully.",
        });
      }
    } catch (err) {
      console.error('[approveCommission] Error in approve commission operation:', err);
      toast({
        title: "Error",
        description: "Failed to approve commission",
        variant: "destructive"
      });
    }
  };

  // Function to mark a commission as paid
  const payCommission = async (transactionId: string, paidDate: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          commission_paid_date: paidDate
        })
        .eq('id', transactionId)
        .select('*')
        .single();

      if (error) {
        console.error('[payCommission] Error marking commission as paid:', error);
        toast({
          title: "Failed to mark commission as paid",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to get the updated one
        fetchTransactions();
        toast({
          title: "Commission marked as paid",
          description: `The commission has been marked as paid on ${new Date(paidDate).toLocaleDateString()}.`,
        });
      }
    } catch (err) {
      console.error('[payCommission] Error in pay commission operation:', err);
      toast({
        title: "Error",
        description: "Failed to mark commission as paid",
        variant: "destructive"
      });
    }
  };

  // Calculate the total value of all transactions
  const totalTransactionValue = transactions.reduce((total, transaction) => total + transaction.amount, 0);
  
  // Calculate the total approved commissions
  const totalApprovedCommissions = transactions
    .filter(transaction => transaction.isApproved)
    .reduce((total, transaction) => total + (transaction.commission || 0), 0);
  
  // Calculate the total paid commissions
  const totalPaidCommissions = transactions
    .filter(transaction => transaction.commissionPaidDate)
    .reduce((total, transaction) => total + (transaction.commission || 0), 0);

  // Calculate the number of transactions this month
  const getThisMonthTransactions = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions.filter(transaction => new Date(transaction.date) >= startOfMonth).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Header />

        {/* Enhanced debugging notice */}
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-lg">
          <p className="text-red-800 font-medium">
            🔥 CRITICAL DEBUG MODE: Transaction filtering updated
          </p>
          <p className="text-red-700 text-sm mt-1">
            User ID: {user?.id} | Admin: {isAdmin ? 'Yes' : 'No'} | Agent ID: {associatedAgentId || 'None'}
          </p>
          <p className="text-red-700 text-sm mt-1">
            Filter: {!isAdmin && associatedAgentId ? `client_id = ${associatedAgentId}` : 'No filter (admin mode)'}
          </p>
          <p className="text-red-700 text-sm mt-1">
            Transactions displayed: {transactions.length} | Clients: {clients.length}  
          </p>
        </div>

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
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              onApproveCommission={approveCommission}
              onPayCommission={payCommission}
              associatedAgentId={associatedAgentId}
            />

            {/* Commission Chart */}
            <CommissionChart 
              transactions={transactions} 
            />
          </div>

          {/* Right side - Client List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Agents</h2>
              {isAdmin && (
                <Button 
                  onClick={() => setIsAddClientOpen(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Agent
                </Button>
              )}
            </div>

            {/* Client List Component */}
            <ClientList 
              clients={clients} 
              transactions={transactions}
              onUpdateClient={updateClient}
              onDeleteClient={deleteClient}
              onUpdateTransactions={setTransactions}
              onFetchClients={fetchClients}
            />
          </div>
        </div>
      </div>

      {/* Add Client Dialog */}
      {isAdmin && (
        <AddClientDialog 
          open={isAddClientOpen}
          onOpenChange={setIsAddClientOpen}
          onAddClient={addClient}
          onFetchClients={fetchClients}
        />
      )}
    </div>
  );
};

export default IndexPage;
