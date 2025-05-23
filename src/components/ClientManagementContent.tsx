
import { ClientInfoList } from "@/components/ClientInfoList";
import { ClientInfo } from "@/pages/Index";

interface ClientManagementContentProps {
  clientInfos: ClientInfo[];
  isLoading: boolean;
  agentMapping: Record<string, string>;
  onUpdateClientInfo: (clientInfo: ClientInfo) => void;
}

export const ClientManagementContent = ({ 
  clientInfos, 
  isLoading, 
  agentMapping, 
  onUpdateClientInfo 
}: ClientManagementContentProps) => {
  console.log("=== CLIENT MANAGEMENT CONTENT DEBUG ===");
  console.log("Received props:");
  console.log("- clientInfos count:", clientInfos.length);
  console.log("- isLoading:", isLoading);
  console.log("- agentMapping keys:", Object.keys(agentMapping));
  console.log("- Full clientInfos data:", clientInfos);
  console.log("- Client summaries:", clientInfos.map(c => ({ 
    id: c.id, 
    company_name: c.company_name, 
    agent_id: c.agent_id,
    user_id: c.user_id 
  })));

  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  console.log("Rendering ClientInfoList with", clientInfos.length, "clients");
  return (
    <ClientInfoList 
      clientInfos={clientInfos}
      onUpdateClientInfo={onUpdateClientInfo}
      agentMapping={agentMapping}
    />
  );
};
