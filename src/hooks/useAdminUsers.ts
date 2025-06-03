import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateRandomPassword } from '@/utils/passwordUtils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string; 
  is_associated: boolean;
  created_at: string;
  associated_agent_name: string | null;
  associated_agent_id: string | null;
}

interface Agent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
}

export const useAdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const logAdminAction = async (action: string, details: Record<string, any>) => {
    try {
      await supabase.rpc('log_admin_action', {
        action_type: action,
        table_name: 'profiles',
        record_id: null,
        details: details as any
      });
    } catch (error) {
      // Silent fail for audit logging to not disrupt user experience
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users as admin/owner...');
      
      // Use the get_admin_users RPC function instead of direct table query
      const { data: usersData, error: usersError } = await supabase.rpc('get_admin_users');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        // Fallback to direct query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, is_associated, created_at, associated_agent_id');

        if (fallbackError) {
          throw fallbackError;
        }
        
        // Process fallback data similarly
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('id, company_name');

        if (agentsError) throw agentsError;

        const usersWithAgentInfo = fallbackData?.map(user => {
          const agent = agentsData?.find(a => a.id === user.associated_agent_id);
          return {
            ...user,
            associated_agent_name: agent?.company_name || null
          };
        }) || [];

        setUsers(usersWithAgentInfo);
      } else {
        console.log('Successfully fetched users:', usersData?.length || 0);
        // Ensure the data includes associated_agent_id for TypeScript compatibility
        const formattedUsers = usersData?.map(user => ({
          ...user,
          associated_agent_id: null // RPC function doesn't return this, so set to null
        })) || [];
        setUsers(formattedUsers);
      }
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: `Failed to fetch users: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, email, first_name, last_name, company_name');

      if (error) throw error;

      setAgents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch agents: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateUserAssociation = async (userId: string, associate: boolean) => {
    try {
      // If we're disassociating, also remove the associated_agent_id
      const updates = associate 
        ? { is_associated: associate }
        : { is_associated: associate, associated_agent_id: null };
        
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // Log the admin action
      await logAdminAction('UPDATE_USER_ASSOCIATION', {
        user_id: userId,
        associated: associate,
        admin_user_id: user?.id
      });

      // Update local state
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_associated: associate, associated_agent_id: associate ? u.associated_agent_id : null, associated_agent_name: associate ? u.associated_agent_name : null } 
          : u
      ));

      toast({
        title: "Success",
        description: `User ${associate ? 'associated' : 'disassociated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateUserToOwner = async () => {
    try {
      // Find jim@californiatelecom.com and update to owner
      const { data: jimUser, error: findError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', 'jim@californiatelecom.com')
        .single();

      if (findError) {
        console.log('User jim@californiatelecom.com not found or error:', findError);
        return;
      }

      if (jimUser && jimUser.role !== 'owner') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'owner' })
          .eq('id', jimUser.id);

        if (updateError) {
          console.error('Failed to update user to owner:', updateError);
        } else {
          console.log('Successfully updated jim@californiatelecom.com to owner role');
          // Refresh the users list to show the change
          fetchUsers();
          toast({
            title: "User Updated",
            description: "jim@californiatelecom.com has been made an owner",
          });
        }
      }
    } catch (error) {
      console.error('Error updating user to owner:', error);
    }
  };

  const resetUserPassword = async (targetUser: UserProfile) => {
    try {
      console.log('Resetting password for user:', targetUser.email);
      
      // Generate a temporary password
      const tempPassword = generateRandomPassword(12);
      
      // Use the new edge function for admin password reset
      const { data: result, error: resetError } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          targetUserId: targetUser.id,
          targetUserEmail: targetUser.email,
          tempPassword: tempPassword,
          adminUserId: user?.id,
        },
      });

      if (resetError) {
        console.error('Password reset failed:', resetError);
        toast({
          title: "Password reset failed", 
          description: resetError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Password reset successful:', result);

      toast({
        title: "Password reset successful",
        description: `A temporary password has been sent to ${targetUser.email}`,
      });
    } catch (error: any) {
      console.error('Unexpected error during password reset:', error);
      toast({
        title: "Password reset error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUsers(users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));
  };

  const handleAddUser = (newUser: UserProfile) => {
    setUsers([...users, newUser]);
  };

  const handleUserDeleted = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  useEffect(() => {
    fetchUsers();
    fetchAgents();
    updateUserToOwner();
  }, []);

  return {
    users,
    agents,
    loading,
    fetchUsers,
    fetchAgents,
    updateUserAssociation,
    resetUserPassword,
    handleUpdateUser,
    handleAddUser,
    handleUserDeleted,
  };
};
