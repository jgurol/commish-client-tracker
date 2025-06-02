
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface UserManagementHeaderProps {
  onAddUser: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const UserManagementHeader = ({ onAddUser, onRefresh, loading }: UserManagementHeaderProps) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <div className="flex gap-2">
        <Button 
          onClick={onAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
        <Button onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
};
