
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Shield, Crown } from 'lucide-react';

export const Header = () => {
  const { user, signOut, isAdmin, isOwner, refreshUserProfile } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600">Manage your agent commissions and track earnings</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-2 px-4 rounded-full">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">
            {user?.email}
            {isOwner && (
              <span className="ml-1 text-xs bg-purple-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <Crown className="w-3 h-3" /> Owner
              </span>
            )}
            {isAdmin && !isOwner && (
              <span className="ml-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
            {!isAdmin && !isOwner && (
              <span className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                Agent
              </span>
            )}
          </span>
        </div>
        
        <Button 
          onClick={() => {
            // Refresh user profile before signing out to ensure up-to-date permissions
            refreshUserProfile().then(() => signOut());
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
