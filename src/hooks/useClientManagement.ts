
import { useState, useEffect } from "react";
import { ClientInfo } from "@/pages/Index";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAgentMapping } from "@/hooks/useAgentMapping";
import { clientInfoService } from "@/services/clientInfoService";
import { ClientManagementHook } from "@/types/clientManagement";

export const useClientManagement = (): ClientManagementHook => {
  const [clientInfos, setClientInfos] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { agentMapping, fetchAgentNames } = useAgentMapping();

  // Load client info from Supabase
  useEffect(() => {
    const fetchClientInfos = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("User ID:", user.id);
        console.log("User Email:", user.email);
        console.log("Is Admin:", isAdmin);
        console.log("Auth context user:", user);
        
        const data = await clientInfoService.fetchClientInfos();
        console.log("Setting clientInfos state with:", data?.length || 0, "clients");
        
        setClientInfos(data);
        
        // Fetch agent names but don't let it block the loading state
        try {
          await fetchAgentNames();
        } catch (agentError) {
          console.error('Error fetching agent names:', agentError);
          // Don't throw here, just log the error
        }
      } catch (err) {
        console.error('Error in client info fetch:', err);
        toast({
          title: "Failed to load clients",
          description: err instanceof Error ? err.message : "Failed to load client information",
          variant: "destructive"
        });
      } finally {
        // Always set loading to false, regardless of success or error
        console.log("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    fetchClientInfos();
  }, [user, isAdmin, toast, fetchAgentNames]);

  // Function to add client info
  const addClientInfo = async (newClientInfo: Omit<ClientInfo, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!user) return;

    try {
      const data = await clientInfoService.addClientInfo(newClientInfo, user.id);
      
      toast({
        title: "Client added",
        description: `${data.company_name} has been added successfully.`,
        variant: "default"
      });
      setClientInfos([...clientInfos, data]);
    } catch (err) {
      console.error('Error in add client operation:', err);
      toast({
        title: "Failed to add client",
        description: err instanceof Error ? err.message : "Failed to add client information",
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

    try {
      const data = await clientInfoService.updateClientInfo(updatedClientInfo);
      
      toast({
        title: "Client updated",
        description: `${data.company_name} has been updated successfully.`,
        variant: "default"
      });
      setClientInfos(clientInfos.map(ci => ci.id === data.id ? data : ci));
    } catch (err) {
      console.error('Error in update client operation:', err);
      toast({
        title: "Failed to update client",
        description: err instanceof Error ? err.message : "Failed to update client information",
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
