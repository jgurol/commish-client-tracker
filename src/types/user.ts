
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_associated: boolean;
  created_at: string;
  associated_agent_name?: string | null;
  associated_agent_id?: string | null;
}

export interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
}
