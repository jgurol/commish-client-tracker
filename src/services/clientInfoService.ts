
import { supabase } from "@/integrations/supabase/client";
import { ClientInfo } from "@/pages/Index";
import { AddClientInfoData, UpdateClientInfoData } from "@/types/clientManagement";

export const clientInfoService = {
  async fetchClientInfos(): Promise<ClientInfo[]> {
    const { data, error } = await supabase
      .from('client_info')
      .select('*')
      .order('company_name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  },

  async addClientInfo(clientData: AddClientInfoData, userId: string): Promise<ClientInfo> {
    const clientInfoToInsert = {
      ...clientData,
      agent_id: clientData.agent_id === "none" ? null : clientData.agent_id,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('client_info')
      .insert(clientInfoToInsert)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateClientInfo(clientData: UpdateClientInfoData): Promise<ClientInfo> {
    const clientInfoToUpdate = {
      ...clientData,
      agent_id: clientData.agent_id === "none" ? null : clientData.agent_id,
    };

    const { data, error } = await supabase
      .from('client_info')
      .update({
        company_name: clientInfoToUpdate.company_name,
        contact_name: clientInfoToUpdate.contact_name,
        email: clientInfoToUpdate.email,
        phone: clientInfoToUpdate.phone,
        notes: clientInfoToUpdate.notes,
        revio_id: clientInfoToUpdate.revio_id,
        agent_id: clientInfoToUpdate.agent_id,
        commission_override: clientInfoToUpdate.commission_override
      })
      .eq('id', clientInfoToUpdate.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
};
