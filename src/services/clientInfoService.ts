
import { supabase } from "@/integrations/supabase/client";
import { ClientInfo } from "@/pages/Index";
import { AddClientInfoData, UpdateClientInfoData } from "@/types/clientManagement";

export const clientInfoService = {
  async fetchClientInfos(): Promise<ClientInfo[]> {
    console.log("=== CLIENT FETCH DEBUG ===");
    console.log("Attempting to fetch client_info records...");
    console.log("RLS policies will automatically handle filtering based on user role");
    
    const { data, error } = await supabase
      .from('client_info')
      .select('*')
      .order('company_name', { ascending: true });
    
    console.log("Raw Supabase response:");
    console.log("- Data:", data);
    console.log("- Error:", error);
    console.log("- Data length:", data?.length || 0);
    
    if (error) {
      console.error('Error fetching client info:', error);
      throw error;
    }
    
    console.log("Successfully fetched client data:", data);
    console.log("Client details:", data?.map(c => ({
      id: c.id,
      company_name: c.company_name,
      user_id: c.user_id,
      agent_id: c.agent_id
    })));
    
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
      console.error('Error adding client info:', error);
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
        address: clientInfoToUpdate.address,
        notes: clientInfoToUpdate.notes,
        agent_id: clientInfoToUpdate.agent_id
      })
      .eq('id', clientInfoToUpdate.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating client info:', error);
      throw error;
    }

    return data;
  }
};
