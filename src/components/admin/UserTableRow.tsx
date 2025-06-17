
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Shield, UserCheck, UserX, PencilIcon, Trash2, Crown, KeyRound } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string; 
  is_associated: boolean;
  created_at: string;
  last_login?: string | null;
  associated_agent_name: string | null;
  associated_agent_id: string | null;
}

interface UserTableRowProps {
  userProfile: UserProfile;
  onEdit: (user: UserProfile) => void;
  onAssociate: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
  onUpdateAssociation: (userId: string, associate: boolean) => void;
  onResetPassword: (user: UserProfile) => void;
}

export const UserTableRow = ({ 
  userProfile, 
  onEdit, 
  onAssociate, 
  onDelete, 
  onUpdateAssociation,
  onResetPassword
}: UserTableRowProps) => {
  const { user } = useAuth();

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

  const formatLastLogin = (lastLogin: string | null | undefined) => {
    if (!lastLogin) {
      return <span className="text-gray-500 text-xs">Never</span>;
    }
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    // Always show both date and time
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();
    const fullDateTime = `${dateStr} ${timeStr}`;
    
    if (diffInHours < 24) {
      return <span className="text-green-600 text-xs">{fullDateTime}</span>;
    } else if (diffInHours < 168) { // 7 days
      return <span className="text-blue-600 text-xs">{fullDateTime}</span>;
    } else {
      return <span className="text-gray-600 text-xs">{fullDateTime}</span>;
    }
  };

  const canDeleteUser = (userProfile: UserProfile) => {
    if (userProfile.role === 'owner') return false;
    if (userProfile.id === user?.id) return false;
    return true;
  };

  const canResetPassword = (userProfile: UserProfile) => {
    if (userProfile.id === user?.id) return false;
    return true;
  };

  return (
    <TableRow className={userProfile.id === user?.id ? "bg-blue-50" : ""}>
      <TableCell>{userProfile.full_name || 'No name'}</TableCell>
      <TableCell>{userProfile.email}</TableCell>
      <TableCell>{getRoleBadge(userProfile.role)}</TableCell>
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
        {formatLastLogin(userProfile.last_login)}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(userProfile)}
            className="text-blue-600 hover:bg-blue-50"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </Button>
          
          {canResetPassword(userProfile) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResetPassword(userProfile)}
              className="text-orange-600 hover:bg-orange-50"
            >
              <KeyRound className="w-4 h-4 mr-1" />
              Reset Password
            </Button>
          )}
          
          {userProfile.role === 'agent' && userProfile.id !== user?.id && (
            <>
              {userProfile.is_associated ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onUpdateAssociation(userProfile.id, false)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Disassociate
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAssociate(userProfile)}
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
              onClick={() => onDelete(userProfile)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
