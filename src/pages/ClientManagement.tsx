
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientInfoList } from "@/components/ClientInfoList";
import { AddClientInfoDialog } from "@/components/AddClientInfoDialog";
import { ClientInfo } from "@/pages/Index";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface ExtendedClientInfo extends ClientInfo {
  agent_id?: string | null;
}

const ClientManagement = () => {
  const [clientInfos, setClientInfos] = useState<ExtendedClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentMapping, setAgentMapping] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // State for dialog
  const [isAddClientInfoOpen, setIsAddClientInfoOpen] = useState(false);

  // Load client info from Supabase
  useEffect(() => {
    const fetchClientInfos = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
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
  }, [user, toast]);

  // Fetch agent names for mapping
  const fetchAgentNames = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, company_name, first_name, last_name');
      
      if (error) {
        console.error('Error fetching agents:', error);
      } else if (data) {
        const mapping: Record<string, string> = {};
        data.forEach(agent => {
          mapping[agent.id] = agent.company_name || `${agent.first_name} ${agent.last_name}`;
        });
        setAgentMapping(mapping);
      }
    } catch (err) {
      console.error('Error creating agent mapping:', err);
    }
  };

  // Function to add client info
  const addClientInfo = async (newClientInfo: Omit<ExtendedClientInfo, "id" | "created_at" | "updated_at" | "user_id">) => {
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
  const updateClientInfo = async (updatedClientInfo: ExtendedClientInfo) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Header />

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
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <ClientInfoList 
                clientInfos={clientInfos}
                onUpdateClientInfo={updateClientInfo}
                agentMapping={agentMapping}
              />
            )}
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

export default ClientManagement;
