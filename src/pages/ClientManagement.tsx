
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

interface ClientManagementProps {}

const ClientManagement = () => {
  const [clientInfos, setClientInfos] = useState<ClientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Function to add client info
  const addClientInfo = async (newClientInfo: Omit<ClientInfo, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return;

    const clientInfoToInsert = {
      ...newClientInfo,
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

    try {
      const { data, error } = await supabase
        .from('client_info')
        .update({
          company_name: updatedClientInfo.company_name,
          contact_name: updatedClientInfo.contact_name,
          email: updatedClientInfo.email,
          phone: updatedClientInfo.phone,
          address: updatedClientInfo.address,
          notes: updatedClientInfo.notes
        })
        .eq('id', updatedClientInfo.id)
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
