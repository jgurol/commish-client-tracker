
import { Button } from "@/components/ui/button";
import { CheckCircle, DollarSign } from "lucide-react";
import { Transaction } from "@/pages/Index";
import { useAuth } from "@/context/AuthContext";

interface TransactionCommissionButtonsProps {
  transaction: Transaction;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string) => void;
}

export const TransactionCommissionButtons = ({
  transaction,
  onApproveCommission,
  onPayCommission,
}: TransactionCommissionButtonsProps) => {
  const { isAdmin, isOwner } = useAuth();

  if (!isAdmin) return null;

  const handleApproveCommission = () => {
    console.log('[TransactionCommissionButtons] Approving commission for transaction:', transaction.id);
    onApproveCommission(transaction.id);
  };

  const handlePayCommission = () => {
    if (onPayCommission) {
      onPayCommission(transaction.id);
    }
  };

  return (
    <div className="flex gap-1">
      {/* Approve Commission Button */}
      {!transaction.isApproved && transaction.isPaid && isOwner && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-6 px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={handleApproveCommission}
        >
          Approve
        </Button>
      )}
      
      {/* Show disabled approve button if not owner but conditions are met */}
      {!transaction.isApproved && transaction.isPaid && !isOwner && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-6 px-2 border-gray-200 text-gray-400 cursor-not-allowed"
          disabled
          title="Only owners can approve commissions"
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Approve
        </Button>
      )}
      
      {/* Show disabled approve button if invoice not paid */}
      {!transaction.isApproved && !transaction.isPaid && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-6 px-2 border-gray-200 text-gray-400 cursor-not-allowed"
          disabled
          title="Invoice must be paid before approving commission"
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Approve
        </Button>
      )}
      
      {/* Pay Commission Button */}
      {transaction.isApproved && !transaction.commissionPaidDate && transaction.isPaid && onPayCommission && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-6 px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={handlePayCommission}
        >
          <DollarSign className="w-3 h-3 mr-1" /> Pay
        </Button>
      )}
      
      {/* Show disabled pay button if invoice not paid */}
      {transaction.isApproved && !transaction.commissionPaidDate && !transaction.isPaid && onPayCommission && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-6 px-2 border-gray-200 text-gray-400 cursor-not-allowed"
          disabled
          title="Invoice must be paid before paying commission"
        >
          <DollarSign className="w-3 h-3 mr-1" /> Pay
        </Button>
      )}
    </div>
  );
};
