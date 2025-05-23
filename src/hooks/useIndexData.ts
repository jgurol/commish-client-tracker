
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Client, Transaction, ClientInfo } from "@/pages/Index";

export const useIndexData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clientInfos, setClientInfos] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [associatedAgentId, setAssociatedAgentId] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Fetch the associated agent ID for the current user
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

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

  // Function to fetch transactions from Supabase
  const fetchTransactions = async () => {
    if (!user) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('[DEBUG] Starting transaction fetch with:');
      console.log('[DEBUG] - isAdmin:', isAdmin);
      console.log('[DEBUG] - associatedAgentId:', associatedAgentId);
      console.log('[DEBUG] - user.id:', user.id);
      
      // First, let's check the actual client_id of our target transaction
      console.log('[DEBUG] Checking actual client_id of target transaction...');
      const { data: targetTx, error: targetError } = await supabase
        .from('transactions')
        .select('id, client_id, user_id')
        .eq('id', 'd0b91f93-75fd-4d3c-8c8c-b41c86f05eb1')
        .single();
      
      if (targetError) {
        console.log('[DEBUG] Target transaction query error:', targetError);
      } else {
        console.log('[DEBUG] Target transaction actual data:', targetTx);
        console.log('[DEBUG] Target client_id:', targetTx?.client_id);
        console.log('[DEBUG] Expected client_id:', associatedAgentId);
        console.log('[DEBUG] Client IDs match:', targetTx?.client_id === associatedAgentId);
      }
      
      // Build the query with filtering logic
      let query = supabase.from('transactions').select('*');
      
      // ADMIN USERS: See ALL transactions with NO filtering whatsoever
      if (isAdmin) {
        console.log('[DEBUG] Admin user - no filtering applied');
        // Admins see everything - absolutely no WHERE clauses
      } else {
        // NON-ADMIN USERS: Only see transactions where client_id matches their associated agent
        if (associatedAgentId) {
          console.log('[DEBUG] Non-admin user - filtering by client_id =', associatedAgentId);
          query = query.eq('client_id', associatedAgentId);
        } else {
          console.log('[DEBUG] Non-admin user without agent ID - returning empty results');
          // For non-admin users without agent ID, return empty results
          setTransactions([]);
          setIsLoading(false);
          return;
        }
      }
      
      // Add ordering to ensure consistent results
      query = query.order('created_at', { ascending: false });
      
      console.log('[DEBUG] About to execute main query');
      
      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Failed to load transactions",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('[DEBUG] Raw transaction data from DB:', data);
      console.log('[DEBUG] Number of transactions returned:', data?.length || 0);
      
      // Check if our target transaction is in the results
      const targetTransaction = data?.find(t => t.id === 'd0b91f93-75fd-4d3c-8c8c-b41c86f05eb1');
      console.log('[DEBUG] Target transaction in main query results:', targetTransaction ? 'FOUND' : 'NOT FOUND');
      
      if (targetTransaction) {
        console.log('[DEBUG] Target transaction details:', targetTransaction);
      } else {
        console.log('[DEBUG] Target transaction missing - checking all returned IDs:');
        data?.forEach((t, i) => {
          console.log(`[DEBUG] Transaction ${i + 1}: ${t.id} (client_id: ${t.client_id})`);
        });
      }

      // Map database transactions to our Transaction interface
      const mappedTransactions = await Promise.all(data?.map(async (transaction) => {
        // Find client for this transaction
        const client = clients.find(c => c.id === transaction.client_id);
        
        // Find client info for this transaction if available
        let clientInfo = null;
        if (transaction.client_info_id) {
          clientInfo = clientInfos.find(ci => ci.id === transaction.client_info_id);
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
        
        return mappedTransaction;
      }) || []);
      
      console.log('[DEBUG] Final mapped transactions count:', mappedTransactions.length);
      
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('Exception in transaction fetch:', err);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    setClients,
    transactions,
    setTransactions,
    clientInfos,
    setClientInfos,
    isLoading,
    associatedAgentId,
    fetchClients,
    fetchTransactions,
    fetchClientInfos
  };
};
