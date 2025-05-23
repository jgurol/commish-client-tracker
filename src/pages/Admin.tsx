
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
import { Shield, UserCheck, UserX } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'agent';
  is_associated: boolean;
  created_at: string;
}

export default function Admin() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use the RPC function instead of directly querying the profiles table
      const { data, error } = await supabase
        .rpc('get_admin_users');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: `Failed to fetch users: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserAssociation = async (userId: string, associate: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_associated: associate })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_associated: associate } : u
      ));

      toast({
        title: "Success",
        description: `User ${associate ? 'associated' : 'disassociated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Header />
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userProfile) => (
                  <TableRow key={userProfile.id} className={userProfile.id === user?.id ? "bg-blue-50" : ""}>
                    <TableCell>{userProfile.full_name || 'No name'}</TableCell>
                    <TableCell>{userProfile.email}</TableCell>
                    <TableCell>
                      {userProfile.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Agent
                        </span>
                      )}
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
                              onClick={() => updateUserAssociation(userProfile.id, true)}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Associate
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
