
import { AlertCircle } from "lucide-react";

interface TransactionDebugInfoProps {
  isAdmin: boolean;
  transactionCount: number;
  associatedAgentId: string | null;
}

export const TransactionDebugInfo = ({ 
  isAdmin, 
  transactionCount, 
  associatedAgentId 
}: TransactionDebugInfoProps) => {
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium mb-1">TRANSACTION STATUS</p>
        <p>User: {isAdmin ? 'Admin (sees all)' : `Agent (filtered)`}</p>
        <p>Transactions displayed: {transactionCount}</p>
        <p>Filter: {isAdmin ? 'No filtering (admin sees all)' : (associatedAgentId ? `Filtered by agent ${associatedAgentId}` : 'No agent access')}</p>
      </div>
    </div>
  );
};
