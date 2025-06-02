import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shield, UserCheck, UserX, PencilIcon, UserPlus, Trash2, Crown } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { EditUserDialog } from '@/components/EditUserDialog';
import { AssociateUserDialog } from '@/components/AssociateUserDialog';
import { AddUserDialog } from '@/components/AddUserDialog';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';

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

export default function Admin() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [associatingUser, setAssociatingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    fetchUsers();
    fetchAgents();
    // Auto-update jim@californiatelecom.com to owner role
    updateUserToOwner();
  }, []);

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

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
  };

  const handleAssociateUser = (user: UserProfile) => {
    setAssociatingUser(user);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setDeletingUser(user);
  };

  const handleAddUser = (newUser: UserProfile) => {
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    // Update local state
    setUsers(users.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ));

    // Close the dialogs
    setEditingUser(null);
    setAssociatingUser(null);
  };

  const handleUserDeleted = (userId: string) => {
    // Remove user from local state
    setUsers(users.filter(u => u.id !== userId));
    setDeletingUser(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'owner':
        return <Crown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            <Shield className="w-3 h-3" />
            Admin
          </span>
        );
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
            <Crown className="w-3 h-3" />
            Owner
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            Agent
          </span>
        );
    }
  };

  const canDeleteUser = (userProfile: UserProfile) => {
    // Owners cannot be deleted
    if (userProfile.role === 'owner') {
      return false;
    }
    // Users cannot delete themselves
    if (userProfile.id === user?.id) {
      return false;
    }
    return true;
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

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Header />
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddUserOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
          <Button onClick={() => { fetchUsers(); fetchAgents(); }} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Associated With</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userProfile) => (
                  <TableRow key={userProfile.id} className={userProfile.id === user?.id ? "bg-blue-50" : ""}>
                    <TableCell>{userProfile.full_name || 'No name'}</TableCell>
                    <TableCell>{userProfile.email}</TableCell>
                    <TableCell>
                      {getRoleBadge(userProfile.role)}
                    </TableCell>
                    <TableCell>
                      {userProfile.is_associated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          <UserCheck className="w-3 h-3" />
                          Associated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          <UserX className="w-3 h-3" />
                          Not Associated
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {userProfile.associated_agent_name ? (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {userProfile.associated_agent_name}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(userProfile)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        
                        {userProfile.role === 'agent' && userProfile.id !== user?.id && (
                          <>
                            {userProfile.is_associated ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => updateUserAssociation(userProfile.id, false)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Disassociate
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAssociateUser(userProfile)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Associate
                              </Button>
                            )}
                          </>
                        )}

                        {canDeleteUser(userProfile) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(userProfile)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          agents={agents}
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {associatingUser && (
        <AssociateUserDialog
          user={associatingUser}
          agents={agents}
          open={!!associatingUser}
          onOpenChange={(open) => {
            if (!open) setAssociatingUser(null);
          }}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {isAddUserOpen && (
        <AddUserDialog
          agents={agents}
          open={isAddUserOpen}
          onOpenChange={setIsAddUserOpen}
          onAddUser={handleAddUser}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => {
            if (!open) setDeletingUser(null);
          }}
          onDeleteUser={handleUserDeleted}
        />
      )}
    </div>
  );
}
