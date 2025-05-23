
import { ClientInfo } from "@/pages/Index";

export interface ClientManagementHook {
  clientInfos: ClientInfo[];
  isLoading: boolean;
  agentMapping: Record<string, string>;
  addClientInfo: (newClientInfo: Omit<ClientInfo, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>;
  updateClientInfo: (updatedClientInfo: ClientInfo) => Promise<void>;
}

export interface AddClientInfoData {
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  agent_id: string | null;
}

export interface UpdateClientInfoData extends AddClientInfoData {
  id: string;
}
