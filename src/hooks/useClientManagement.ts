
import { useState, useEffect } from "react";
import { ClientInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useClientManagement = () => {
  const [clientInfos, setClientInfos] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentMapping, setAgentMapping] = useState<Record<string, string>>({});
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Load client info from Supabase
  useEffect(() => {
    const fetchClientInfos = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching client info for user:", user.id, "isAdmin:", isAdmin);
        
        // Always fetch all clients for both admin and agent views
        const { data, error } = await supabase
          .from('client_info')
          .select('*')
          .order('company_name', { ascending: true });
        
        if (error) {
          console.error('Error fetching client info:', error);
          toast({
            title: "Failed to load clients",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log("Fetched all client data:", data);
          console.log("Setting clientInfos to:", data?.length || 0, "clients");
          setClientInfos(data || []);
          await fetchAgentNames();
        }
      } catch (err) {
        console.error('Error in client info fetch:', err);
        toast({
          title: "Error",
          description: "Failed to load client information",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientInfos();
  }, [user, isAdmin, toast]);

  // Fetch agent names for mapping
  const fetchAgentNames = async () => {
    try {
      console.log("Fetching agent names for mapping");
      const { data, error } = await supabase
        .from('agents')
        .select('id, company_name, first_name, last_name');
      
      if (error) {
        console.error('Error fetching agents:', error);
      } else if (data) {
        console.log("Fetched agent data:", data);
        const mapping: Record<string, string> = {};
        data.forEach(agent => {
          mapping[agent.id] = agent.company_name || `${agent.first_name} ${agent.last_name}`;
        });
        console.log("Agent mapping created:", mapping);
        setAgentMapping(mapping);
      }
    } catch (err) {
      console.error('Error creating agent mapping:', err);
    }
  };

  // Function to add client info
  const addClientInfo = async (newClientInfo: Omit<ClientInfo, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) return;

    // Handle the "none" special value for agent_id
    const clientInfoToInsert = {
      ...newClientInfo,
      agent_id: newClientInfo.agent_id === "none" ? null : newClientInfo.agent_id,
      user_id: user.id
    };

    try {
      const { data, error } = await supabase
        .from('client_info')
        .insert(clientInfoToInsert)
        .select('*')
        .single();

      if (error) {
        console.error('Error adding client info:', error);
        toast({
          title: "Failed to add client",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        toast({
          title: "Client added",
          description: `${data.company_name} has been added successfully.`,
          variant: "default"
        });
        setClientInfos([...clientInfos, data]);
      }
    } catch (err) {
      console.error('Error in add client operation:', err);
      toast({
        title: "Error",
        description: "Failed to add client information",
        variant: "destructive"
      });
    }
  };

  // Function to update client info
  const updateClientInfo = async (updatedClientInfo: ClientInfo) => {
    if (!user) return;

    // Check if this is a delete operation (special case)
    if ((updatedClientInfo as any)._delete) {
      setClientInfos(clientInfos.filter(ci => ci.id !== updatedClientInfo.id));
      return;
    }

    // Handle the "none" special value for agent_id
    const clientInfoToUpdate = {
      ...updatedClientInfo,
      agent_id: updatedClientInfo.agent_id === "none" ? null : updatedClientInfo.agent_id,
    };

    try {
      const { data, error } = await supabase
        .from('client_info')
        .update({
          company_name: clientInfoToUpdate.company_name,
          contact_name: clientInfoToUpdate.contact_name,
          email: clientInfoToUpdate.email,
          phone: clientInfoToUpdate.phone,
          address: clientInfoToUpdate.address,
          notes: clientInfoToUpdate.notes,
          agent_id: clientInfoToUpdate.agent_id
        })
        .eq('id', clientInfoToUpdate.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating client info:', error);
        toast({
          title: "Failed to update client",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        toast({
          title: "Client updated",
          description: `${data.company_name} has been updated successfully.`,
          variant: "default"
        });
        setClientInfos(clientInfos.map(ci => ci.id === data.id ? data : ci));
      }
    } catch (err) {
      console.error('Error in update client operation:', err);
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive"
      });
    }
  };

  return {
    clientInfos,
    isLoading,
    agentMapping,
    addClientInfo,
    updateClientInfo
  };
};
