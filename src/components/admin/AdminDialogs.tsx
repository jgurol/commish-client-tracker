
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

interface AdminDialogsProps {
  editingUser: UserProfile | null;
  associatingUser: UserProfile | null;
  deletingUser: UserProfile | null;
  isAddUserOpen: boolean;
  agents: Agent[];
  onCloseEditUser: () => void;
  onCloseAssociateUser: () => void;
  onCloseDeleteUser: () => void;
  onCloseAddUser: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onAddUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminDialogs = ({
  editingUser,
  associatingUser,
  deletingUser,
  isAddUserOpen,
  agents,
  onCloseEditUser,
  onCloseAssociateUser,
  onCloseDeleteUser,
  onCloseAddUser,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
}: AdminDialogsProps) => {
  return (
    <>
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          agents={agents}
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) onCloseEditUser();
          }}
          onUpdateUser={onUpdateUser}
        />
      )}

      {associatingUser && (
        <AssociateUserDialog
          user={associatingUser}
          agents={agents}
          open={!!associatingUser}
          onOpenChange={(open) => {
            if (!open) onCloseAssociateUser();
          }}
          onUpdateUser={onUpdateUser}
        />
      )}

      {isAddUserOpen && (
        <AddUserDialog
          agents={agents}
          open={isAddUserOpen}
          onOpenChange={onCloseAddUser}
          onAddUser={onAddUser}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => {
            if (!open) onCloseDeleteUser();
          }}
          onDeleteUser={onDeleteUser}
        />
      )}
    </>
  );
};
