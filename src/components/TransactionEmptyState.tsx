
import { DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TransactionEmptyStateProps {
  associatedAgentId?: string | null;
}

export const TransactionEmptyState = ({ associatedAgentId }: TransactionEmptyStateProps) => {
  const { isAdmin } = useAuth();

  return (
    <div className="text-center py-6 text-gray-500">
      <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-300" />
      <p>No transactions found</p>
      {!isAdmin && !associatedAgentId && (
        <p className="text-xs mt-1">Contact admin to associate your account with an agent</p>
      )}
    </div>
  );
};
