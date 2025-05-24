
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TransactionHeaderProps {
  transactionCount: number;
  onAddTransaction: () => void;
}

export const TransactionHeader = ({
  transactionCount,
  onAddTransaction
}: TransactionHeaderProps) => {
  const { isAdmin } = useAuth();

  return (
    <div className="flex flex-row items-center justify-between space-y-0">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
        <p className="text-sm text-muted-foreground">
          Commission payments ({transactionCount} total)
        </p>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button 
            size="sm"
            onClick={onAddTransaction}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
};
