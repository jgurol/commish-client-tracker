
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Fetch the associated agent ID for the current user
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Load clients from Supabase when profile is loaded
  useEffect(() => {
    if (profileLoaded) {
      fetchClients();
      fetchClientInfos();
    }
  }, [profileLoaded, associatedAgentId]);

  // Function to fetch transactions from Supabase - only after profile is loaded
  useEffect(() => {
    if (profileLoaded) {
      fetchTransactions();
    }
  }, [profileLoaded, associatedAgentId, isAdmin]);

  // Fetch user's profile to get associated agent ID
  const fetchUserProfile = async () => {
    try {
      console.log('[fetchUserProfile] Fetching user profile for:', user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('associated_agent_id, role, is_associated, full_name')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('[fetchUserProfile] Error fetching user profile:', error);
        setProfileLoaded(true);
        return;
      }
      
      console.log("[fetchUserProfile] User profile data:", data);
      setAssociatedAgentId(data?.associated_agent_id || null);
      setProfileLoaded(true);
    } catch (err) {
      console.error('[fetchUserProfile] Exception fetching user profile:', err);
      setProfileLoaded(true);
    }
  };

  // Function to fetch clients from Supabase
  const fetchClients = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      console.log('[fetchClients] Fetching clients - isAdmin:', isAdmin, 'associatedAgentId:', associatedAgentId);
      
      // If admin, fetch all agents, otherwise fetch only the associated agent
      let query = supabase.from('agents').select('*');
      
      // If user is not admin and has an associated agent, filter by that agent ID
      if (!isAdmin && associatedAgentId) {
        query = query.eq('id', associatedAgentId);
      } else if (!isAdmin && !associatedAgentId) {
        console.log('[fetchClients] Non-admin user with NO associated agent - will return empty results');
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

      console.log("[fetchClients] Fetched agents:", data?.length || 0);

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
        console.log("[fetchClientInfos] Fetched client infos:", data?.length || 0);
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
      console.log('[fetchTransactions] No user found, skipping transaction fetch');
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('[fetchTransactions] Starting transaction fetch - isAdmin:', isAdmin, 'associatedAgentId:', associatedAgentId);
      
      // Build the query with filtering logic
      let query = supabase.from('transactions').select('*');
      
      // ADMIN USERS: See ALL transactions with NO filtering whatsoever
      if (isAdmin) {
        console.log('[fetchTransactions] Admin user - no filtering applied');
        // Admins see everything - absolutely no WHERE clauses
      } else {
        // NON-ADMIN USERS: Only see transactions where client_id matches their associated agent
        if (associatedAgentId) {
          console.log('[fetchTransactions] Non-admin user - filtering by client_id =', associatedAgentId);
          query = query.eq('client_id', associatedAgentId);
        } else {
          console.log('[fetchTransactions] Non-admin user without agent ID - returning empty results');
          // For non-admin users without agent ID, return empty results
          setTransactions([]);
          setIsLoading(false);
          return;
        }
      }
      
      // Add ordering to ensure consistent results
      query = query.order('created_at', { ascending: false });
      
      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error('[fetchTransactions] Error fetching transactions:', error);
        toast({
          title: "Failed to load transactions",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('[fetchTransactions] Fetched transactions:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('[fetchTransactions] No transactions found - setting empty array');
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      // Fetch agent and client info data in parallel
      const [agentResponse, clientInfoResponse] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase.from('client_info').select('*')
      ]);

      const agentData = agentResponse.data || [];
      const clientInfoData = clientInfoResponse.data || [];

      // Map database transactions to our Transaction interface
      const mappedTransactions = data.map((transaction) => {
        // Find client for this transaction
        const client = agentData.find(c => c.id === transaction.client_id);
        
        // Find client info for this transaction if available
        let clientInfo = null;
        if (transaction.client_info_id) {
          clientInfo = clientInfoData.find(ci => ci.id === transaction.client_info_id);
        }

        return {
          id: transaction.id,
          clientId: transaction.client_id,
          clientName: client?.first_name && client?.last_name 
            ? `${client.first_name} ${client.last_name}`
            : "Unknown Agent",
          companyName: client?.company_name || (client?.first_name ? `${client.first_name} ${client.last_name}` : "Unknown Company"),
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
          commissionPaidDate: transaction.commission_paid_date,
          commissionOverride: transaction.commission_override
        };
      });
      
      console.log('[fetchTransactions] Final mapped transactions count:', mappedTransactions.length);
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('[fetchTransactions] Exception in transaction fetch:', err);
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
