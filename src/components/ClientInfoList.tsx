
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MapPin, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ClientInfo } from "@/pages/Index";
import { EditClientInfoDialog } from "@/components/EditClientInfoDialog";
import { ClientInfoActions } from "@/components/ClientInfoActions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useClientSorting } from "@/hooks/useClientSorting";
import { useAuth } from "@/context/AuthContext";

interface ClientInfoListProps {
  clientInfos: ClientInfo[];
  onUpdateClientInfo: (clientInfo: ClientInfo) => void;
  agentMapping?: Record<string, string>;
}

export const ClientInfoList = ({ clientInfos, onUpdateClientInfo, agentMapping = {} }: ClientInfoListProps) => {
  const [editingClientInfo, setEditingClientInfo] = useState<ClientInfo | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const {
    sortedClientInfos,
    sortField,
    sortDirection,
    handleSort
  } = useClientSorting(clientInfos, agentMapping);

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('client_info')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client info:', error);
        toast({
          title: "Failed to delete client",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Client deleted",
          description: "Client has been deleted successfully.",
          variant: "default"
        });
        
        onUpdateClientInfo({
          ...clientInfos.find(client => client.id === clientId)!, 
          _delete: true
        } as any);
      }
    } catch (err) {
      console.error('Error in delete operation:', err);
      toast({
        title: "Error",
        description: "Failed to delete client information",
        variant: "destructive"
      });
    }
    setDeletingClientId(null);
  };

  const getAgentName = (agentId: string | null) => {
    if (!agentId || agentId === "none") return "-";
    return agentMapping[agentId] || "Unknown agent";
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1" /> : 
      <ArrowDown className="w-4 h-4 ml-1" />;
  };

  // Simplified view for agents - only show company names
  if (!isAdmin) {
    return (
      <>
        {clientInfos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No clients available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      className="flex items-center hover:text-blue-600 transition-colors"
                      onClick={() => handleSort('company_name')}
                    >
                      Company Name
                      {getSortIcon('company_name')}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClientInfos.map((clientInfo) => (
                  <TableRow key={clientInfo.id}>
                    <TableCell className="font-medium">{clientInfo.company_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </>
    );
  }

  // Full admin view with all columns and actions
  return (
    <>
      {clientInfos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No clients added yet. Click "Add Client" to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('company_name')}
                  >
                    Company Name
                    {getSortIcon('company_name')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('revio_id')}
                  >
                    Revio ID
                    {getSortIcon('revio_id')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('agent_id')}
                  >
                    Associated Agent
                    {getSortIcon('agent_id')}
                  </button>
                </TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClientInfos.map((clientInfo) => (
                <TableRow key={clientInfo.id}>
                  <TableCell className="font-medium">{clientInfo.company_name}</TableCell>
                  <TableCell className="font-mono text-sm">{clientInfo.revio_id || "-"}</TableCell>
                  <TableCell>{getAgentName(clientInfo.agent_id)}</TableCell>
                  <TableCell>{new Date(clientInfo.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <ClientInfoActions
                      clientInfo={clientInfo}
                      onEdit={setEditingClientInfo}
                      onDelete={handleDelete}
                      deletingClientId={deletingClientId}
                      setDeletingClientId={setDeletingClientId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingClientInfo && (
        <EditClientInfoDialog
          clientInfo={editingClientInfo}
          open={!!editingClientInfo}
          onOpenChange={(open) => !open && setEditingClientInfo(null)}
          onUpdateClientInfo={onUpdateClientInfo}
        />
      )}
    </>
  );
};
