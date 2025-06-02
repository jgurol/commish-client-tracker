
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { UserTableRow } from './UserTableRow';

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

interface UserTableProps {
  users: UserProfile[];
  loading: boolean;
  onEditUser: (user: UserProfile) => void;
  onAssociateUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onUpdateUserAssociation: (userId: string, associate: boolean) => void;
}

export const UserTable = ({ 
  users, 
  loading, 
  onEditUser, 
  onAssociateUser, 
  onDeleteUser, 
  onUpdateUserAssociation 
}: UserTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-10 text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <UserTableRow
                key={userProfile.id}
                userProfile={userProfile}
                onEdit={onEditUser}
                onAssociate={onAssociateUser}
                onDelete={onDeleteUser}
                onUpdateAssociation={onUpdateUserAssociation}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
