
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ClientList } from "@/components/ClientList";
import { AddClientDialog } from "@/components/AddClientDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Client, Transaction } from "@/pages/Index";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [associatedAgentId, setAssociatedAgentId] = useState<string | null>(null);
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

  // Function to fetch transactions from Supabase
  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      // Similar transaction fetching logic as in Index.tsx
      let query = supabase.from('transactions').select('*');
      
      if (isAdmin) {
        // Admins see everything
      } else if (associatedAgentId) {
        query = query.eq('client_id', associatedAgentId);
      } else {
        // For non-admin users without agent ID, use a condition that will never match
        query = query.eq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      // Map the data to match our Transaction interface
      const mappedTransactions: Transaction[] = data?.map(transaction => {
        const client = clients.find(c => c.id === transaction.client_id);
        
        return {
          id: transaction.id,
          clientId: transaction.client_id,
          clientName: client?.name || "Unknown Agent",
          companyName: client?.companyName || "Unknown Company",
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
          commissionPaidDate: transaction.commission_paid_date
        };
      }) || [];

      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('Error in transaction fetch:', err);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <Card className="bg-white shadow-lg border-0 mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Agent Management</CardTitle>
          <CardDescription>Manage your commission agents and their rates</CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin && (
            <div className="flex justify-end mb-4">
              <Button 
                onClick={() => setIsAddClientOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Agent
              </Button>
            </div>
          )}
          
          <ClientList 
            clients={clients} 
            transactions={transactions}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
            onUpdateTransactions={setTransactions}
            onFetchClients={fetchClients}
          />
        </CardContent>
      </Card>

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
}
