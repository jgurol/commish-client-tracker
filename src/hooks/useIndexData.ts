
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
      console.log('[DEBUG] === FETCHING USER PROFILE ===');
      console.log('[DEBUG] Current user:', user);
      console.log('[DEBUG] User ID:', user?.id);
      console.log('[DEBUG] Is Admin:', isAdmin);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('associated_agent_id, role, is_associated, full_name')
        .eq('id', user?.id)
        .single();
      
      if (error) {
        console.error('[fetchUserProfile] Error fetching user profile:', error);
        setProfileLoaded(true); // Still mark as loaded even if there's an error
        return;
      }
      
      console.log("[fetchUserProfile] User profile data:", data);
      console.log("[fetchUserProfile] Associated agent ID:", data?.associated_agent_id);
      console.log("[fetchUserProfile] User role:", data?.role);
      console.log("[fetchUserProfile] Is associated:", data?.is_associated);
      
      // Check if this agent actually exists in the agents table
      if (data?.associated_agent_id) {
        console.log('[DEBUG] Checking if associated agent exists in agents table...');
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('id, first_name, last_name, email')
          .eq('id', data.associated_agent_id)
          .single();
        
        if (agentError) {
          console.log('[DEBUG] Associated agent NOT FOUND in agents table:', agentError);
        } else {
          console.log('[DEBUG] Associated agent found:', agentData);
        }
      }
      
      setAssociatedAgentId(data?.associated_agent_id || null);
      setProfileLoaded(true); // Mark profile as loaded after setting the agent ID
    } catch (err) {
      console.error('[fetchUserProfile] Exception fetching user profile:', err);
      setProfileLoaded(true); // Still mark as loaded even if there's an exception
    }
  };

  // Function to fetch clients from Supabase
  const fetchClients = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      console.log('[DEBUG] === FETCHING CLIENTS ===');
      console.log('[DEBUG] Is Admin:', isAdmin);
      console.log('[DEBUG] Associated Agent ID:', associatedAgentId);
      
      // If admin, fetch all agents, otherwise fetch only the associated agent
      let query = supabase.from('agents').select('*');
      
      // If user is not admin and has an associated agent, filter by that agent ID
      if (!isAdmin && associatedAgentId) {
        console.log('[DEBUG] Non-admin user - filtering agents by associated_agent_id:', associatedAgentId);
        query = query.eq('id', associatedAgentId);
      } else if (!isAdmin && !associatedAgentId) {
        console.log('[DEBUG] Non-admin user with NO associated agent - will return empty results');
      } else {
        console.log('[DEBUG] Admin user - fetching ALL agents');
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
      console.log("[fetchClients] Number of agents returned:", data?.length || 0);

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

      console.log("[fetchClients] Mapped clients:", mappedClients);
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
      console.log('[DEBUG] No user found, skipping transaction fetch');
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('[DEBUG] === STARTING TRANSACTION FETCH ===');
      console.log('[DEBUG] - User:', user);
      console.log('[DEBUG] - User ID:', user.id);
      console.log('[DEBUG] - isAdmin:', isAdmin);
      console.log('[DEBUG] - associatedAgentId:', associatedAgentId);
      console.log('[DEBUG] - profileLoaded:', profileLoaded);
      
      // First, let's check the actual database connection and table structure
      console.log('[DEBUG] Testing database connection...');
      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
      
      console.log('[DEBUG] Transaction count from database:', count);
      if (countError) {
        console.error('[DEBUG] Count error:', countError);
      }
      
      // Let's also check if there are any RLS issues by checking our user's role
      console.log('[DEBUG] Checking user role in database...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_associated, associated_agent_id')
        .eq('id', user.id)
        .single();
      
      console.log('[DEBUG] User profile from DB:', profileData);
      if (profileError) {
        console.error('[DEBUG] Profile error:', profileError);
      }
      
      // First, let's see ALL transactions in the database with more detailed logging
      console.log('[DEBUG] Fetching ALL transactions from database (no filters)...');
      const { data: allTransactions, error: allError } = await supabase
        .from('transactions')
        .select('*');
      
      if (allError) {
        console.error('[DEBUG] Error fetching all transactions:', allError);
        console.error('[DEBUG] Error code:', allError.code);
        console.error('[DEBUG] Error message:', allError.message);
        console.error('[DEBUG] Error details:', allError.details);
      } else {
        console.log('[DEBUG] ALL transactions in database:', allTransactions);
        console.log('[DEBUG] Total transactions in DB:', allTransactions?.length || 0);
        if (allTransactions && allTransactions.length > 0) {
          console.log('[DEBUG] Sample transaction:', allTransactions[0]);
        }
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
      
      console.log('[DEBUG] About to execute filtered query for user display');
      
      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error('[DEBUG] Error fetching filtered transactions:', error);
        console.error('[DEBUG] Filtered query error code:', error.code);
        console.error('[DEBUG] Filtered query error message:', error.message);
        console.error('[DEBUG] Filtered query error details:', error.details);
        toast({
          title: "Failed to load transactions",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('[DEBUG] Filtered transaction data from DB:', data);
      console.log('[DEBUG] Number of filtered transactions returned:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('[DEBUG] No transactions found after filtering - setting empty array');
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      // Fetch agent and client info data in parallel
      console.log('[DEBUG] Fetching agent and client info data...');
      const [agentResponse, clientInfoResponse] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase.from('client_info').select('*')
      ]);

      const agentData = agentResponse.data || [];
      const clientInfoData = clientInfoResponse.data || [];

      console.log('[DEBUG] Agent data for mapping:', agentData);
      console.log('[DEBUG] Client info data for mapping:', clientInfoData);

      // Map database transactions to our Transaction interface
      console.log('[DEBUG] Starting transaction mapping...');
      const mappedTransactions = data.map((transaction, index) => {
        console.log(`[DEBUG] Mapping transaction ${index + 1}/${data.length}:`, transaction);
        
        // Find client for this transaction
        const client = agentData.find(c => c.id === transaction.client_id);
        
        // Find client info for this transaction if available
        let clientInfo = null;
        if (transaction.client_info_id) {
          clientInfo = clientInfoData.find(ci => ci.id === transaction.client_info_id);
        }

        console.log(`[DEBUG] Transaction ${transaction.id}:`);
        console.log(`[DEBUG] - client_id: ${transaction.client_id}`);
        console.log(`[DEBUG] - found client:`, client);
        console.log(`[DEBUG] - client_info_id: ${transaction.client_info_id}`);
        console.log(`[DEBUG] - found clientInfo:`, clientInfo);

        const mappedTransaction = {
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
          commissionPaidDate: transaction.commission_paid_date
        };
        
        console.log(`[DEBUG] Mapped transaction ${index + 1}:`, mappedTransaction);
        return mappedTransaction;
      });
      
      console.log('[DEBUG] Final mapped transactions:', mappedTransactions);
      console.log('[DEBUG] Final mapped transactions count:', mappedTransactions.length);
      console.log('[DEBUG] Setting transactions state with:', mappedTransactions);
      
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('[DEBUG] Exception in transaction fetch:', err);
      toast({
        title: "Error",
        description: "Failed to load transaction data",
        variant: "destructive"
      });
    } finally {
      console.log('[DEBUG] Setting isLoading to false');
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
