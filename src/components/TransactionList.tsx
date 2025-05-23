
import { Transaction, ClientInfo } from "@/pages/Index";
import { TransactionCard } from "@/components/TransactionCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionListProps {
  transactions: Transaction[];
  clientInfos: ClientInfo[];
  onEditClick: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string) => void;
  isCurrentMonth: (dateStr: string) => boolean;
}

export const TransactionList = ({
  transactions,
  clientInfos,
  onEditClick,
  onApproveCommission,
  onPayCommission,
  isCurrentMonth
}: TransactionListProps) => {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            clientInfos={clientInfos}
            onEditClick={onEditClick}
            onApproveCommission={onApproveCommission}
            onPayCommission={onPayCommission}
            isCurrentMonth={isCurrentMonth}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
