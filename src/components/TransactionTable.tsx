import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, DollarSign, Pencil, Trash2 } from "lucide-react";
import { Transaction, ClientInfo } from "@/pages/Index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";

interface TransactionTableProps {
  transactions: Transaction[];
  clientInfos: ClientInfo[];
  onEditClick?: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  isCurrentMonth: (dateStr: string) => boolean;
}

// Array for month names - needed for display
const months = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

export const TransactionTable = ({
  transactions,
  clientInfos,
  onEditClick,
  onApproveCommission,
  onPayCommission,
  onDeleteTransaction,
  isCurrentMonth
}: TransactionTableProps) => {
  const { isAdmin } = useAuth();

  const handlePayCommission = (transactionId: string) => {
    if (onPayCommission) {
      onPayCommission(transactionId);
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(transactionId);
    }
  };

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Client</TableHead>
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Invoice</TableHead>
            <TableHead className="font-semibold">Commission</TableHead>
            {isAdmin && <TableHead className="font-semibold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-gray-50">
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">{transaction.clientName}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {transaction.description}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium">{transaction.companyName}</div>
                  {transaction.clientInfoId && transaction.clientInfoId !== "none" && (
                    <div className="text-xs text-gray-500">
                      Client: {transaction.clientCompanyName || clientInfos.find(ci => ci.id === transaction.clientInfoId)?.company_name || "N/A"}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  ${transaction.amount.toLocaleString()}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <div>{new Date(transaction.date).toLocaleDateString()}</div>
                  {transaction.datePaid && (
                    <div className="text-xs text-green-600">
                      Paid: {new Date(transaction.datePaid).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {transaction.invoiceNumber && (
                    <div className="font-mono">#{transaction.invoiceNumber}</div>
                  )}
                  {transaction.invoiceMonth && transaction.invoiceYear && (
                    <div className="text-xs text-gray-500">
                      {months.find(m => m.value === transaction.invoiceMonth)?.label} {transaction.invoiceYear}
                    </div>
                  )}
                  {transaction.referenceNumber && transaction.isPaid && (
                    <div className="text-xs text-gray-500">
                      {transaction.paymentMethod === "check" ? "Check" : "Ref"} #{transaction.referenceNumber}
                    </div>
                  )}
                  
                  {/* Payment Status Badges - removed Due status */}
                  <div className="flex flex-col gap-1 mt-2">
                    {transaction.isPaid && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                    {transaction.paymentMethod && transaction.isPaid && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 w-fit">
                        {transaction.paymentMethod === "check" ? "Check" : "Zelle"}
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-2">
                  <div className={`text-sm font-medium ${transaction.commissionPaidDate ? 'text-green-600' : transaction.isApproved ? 'text-amber-600' : 'text-gray-500'}`}>
                    ${transaction.commission?.toFixed(2) || '0.00'}
                    {transaction.commissionPaidDate && (
                      <div className="text-xs">
                        Paid: {new Date(transaction.commissionPaidDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      {!transaction.isApproved && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-6 px-2 border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => onApproveCommission(transaction.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                      )}
                      {transaction.isApproved && !transaction.commissionPaidDate && onPayCommission && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-6 px-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => handlePayCommission(transaction.id)}
                        >
                          <DollarSign className="w-3 h-3 mr-1" /> Pay
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              
              {isAdmin && (
                <TableCell>
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
                        className="text-gray-500 hover:text-red-600 h-8 w-8 p-0"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
