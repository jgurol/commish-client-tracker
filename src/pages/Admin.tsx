
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Navigate } from 'react-router-dom';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserManagementHeader } from '@/components/admin/UserManagementHeader';
import { UserTable } from '@/components/admin/UserTable';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { ResetPasswordDialog } from '@/components/ResetPasswordDialog';

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

export default function Admin() {
  const { isAdmin } = useAuth();
  const {
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
  } = useAdminUsers();

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [associatingUser, setAssociatingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<UserProfile | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleRefresh = () => {
    fetchUsers();
    fetchAgents();
  };

  const handleResetPassword = async (user: UserProfile) => {
    setIsResettingPassword(true);
    try {
      await resetUserPassword(user);
      setResettingPasswordUser(null);
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <Header />
      
      <UserManagementHeader
        onAddUser={() => setIsAddUserOpen(true)}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <UserTable
        users={users}
        loading={loading}
        onEditUser={setEditingUser}
        onAssociateUser={setAssociatingUser}
        onDeleteUser={setDeletingUser}
        onUpdateUserAssociation={updateUserAssociation}
        onResetPassword={setResettingPasswordUser}
      />

      <AdminDialogs
        editingUser={editingUser}
        associatingUser={associatingUser}
        deletingUser={deletingUser}
        isAddUserOpen={isAddUserOpen}
        agents={agents}
        onCloseEditUser={() => setEditingUser(null)}
        onCloseAssociateUser={() => setAssociatingUser(null)}
        onCloseDeleteUser={() => setDeletingUser(null)}
        onCloseAddUser={() => setIsAddUserOpen(false)}
        onUpdateUser={handleUpdateUser}
        onAddUser={handleAddUser}
        onDeleteUser={handleUserDeleted}
      />

      <ResetPasswordDialog
        user={resettingPasswordUser}
        open={!!resettingPasswordUser}
        onOpenChange={(open) => !open && setResettingPasswordUser(null)}
        onResetPassword={handleResetPassword}
        isResetting={isResettingPassword}
      />
    </div>
  );
}
