
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientInfoList } from "@/components/ClientInfoList";
import { AddClientInfoDialog } from "@/components/AddClientInfoDialog";
import { ClientInfo } from "@/pages/Index";
import { Header } from "@/components/Header";

interface ClientManagementProps {}

const ClientManagement = () => {
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

  // State for dialog
  const [isAddClientInfoOpen, setIsAddClientInfoOpen] = useState(false);

  // Function to add client info
  const addClientInfo = (newClientInfo: Omit<ClientInfo, "id" | "createdAt" | "updatedAt">) => {
    const clientInfo: ClientInfo = {
      ...newClientInfo,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setClientInfos([...clientInfos, clientInfo]);
  };

  // Function to update client info
  const updateClientInfo = (updatedClientInfo: ClientInfo) => {
    setClientInfos(clientInfos.map(clientInfo => 
      clientInfo.id === updatedClientInfo.id ? 
        { ...updatedClientInfo, updatedAt: new Date().toISOString().split('T')[0] } : 
        clientInfo
    ));
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

export default ClientManagement;
