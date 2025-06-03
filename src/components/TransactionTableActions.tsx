
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign, Pencil, Trash2 } from "lucide-react";
import { Transaction } from "@/pages/Index";
import { useAuth } from "@/context/AuthContext";

interface TransactionTableActionsProps {
  transaction: Transaction;
  onEditClick?: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
}

export const TransactionTableActions = ({
  transaction,
  onEditClick,
  onApproveCommission,
  onPayCommission,
  onDeleteTransaction,
}: TransactionTableActionsProps) => {
  const { isAdmin, isOwner } = useAuth();

  if (!isAdmin) return null;

  const handlePayCommission = () => {
    if (onPayCommission) {
      onPayCommission(transaction.id);
    }
  };

  const handleDeleteTransaction = () => {
    if (onDeleteTransaction) {
      onDeleteTransaction(transaction.id);
    }
  };

  return (
    <div className="flex gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-500 hover:text-blue-600 h-8 w-8 p-0"
        onClick={() => onEditClick && onEditClick(transaction)}
      >
        <Pencil className="w-4 h-4" />
      </Button>
      
      {onDeleteTransaction && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          onClick={handleDeleteTransaction}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
