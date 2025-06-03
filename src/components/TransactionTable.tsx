
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
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
import { useState } from "react";
import { PayCommissionDialog } from "./PayCommissionDialog";
import { TransactionTableActions } from "./TransactionTableActions";
import { TransactionCommissionButtons } from "./TransactionCommissionButtons";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface TransactionTableProps {
  transactions: Transaction[];
  clientInfos: ClientInfo[];
  onEditClick?: (transaction: Transaction) => void;
  onApproveCommission: (transactionId: string) => void;
  onPayCommission?: (transactionId: string, paymentData: {
    paidDate: string;
    paymentMethod: string;
    referenceNumber: string;
  }) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
  isCurrentMonth: (dateStr: string) => boolean;
}

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
  onUpdateTransaction,
  isCurrentMonth
}: TransactionTableProps) => {
  const { isAdmin } = useAuth();
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");

  const handlePayCommission = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setPayDialogOpen(true);
  };

  const handleConfirmPayment = (paymentData: {
    paidDate: string;
    paymentMethod: string;
    referenceNumber: string;
  }) => {
    if (onPayCommission && selectedTransactionId) {
      onPayCommission(selectedTransactionId, paymentData);
    }
  };

  const handleInvoicePaidChange = async (transaction: Transaction, isPaid: boolean) => {
    if (onUpdateTransaction) {
      console.log('[TransactionTable] Updating transaction isPaid:', transaction.id, 'from', transaction.isPaid, 'to', isPaid);
      
      const updatedTransaction = {
        ...transaction,
        isPaid,
        datePaid: isPaid ? new Date().toISOString().split('T')[0] : undefined
      };
      
      onUpdateTransaction(updatedTransaction);
    }
  };

  return (
    <>
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Client Company</TableHead>
              <TableHead className="font-semibold">Agent</TableHead>
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
                    <div className="font-medium text-gray-900">
                      {transaction.clientInfoId && transaction.clientInfoId !== "none" 
                        ? (transaction.clientCompanyName || clientInfos.find(ci => ci.id === transaction.clientInfoId)?.company_name || "N/A")
                        : "No Client Company"
                      }
                    </div>
                    {transaction.description && (
                      <div className="text-sm text-gray-500 truncate max-w-[200px] mt-1">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium">{transaction.companyName}</div>
                    <div className="text-xs text-gray-500">
                      Agent: {transaction.clientName}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div>{formatDateForDisplay(transaction.date)}</div>
                    {transaction.datePaid && (
                      <div className="text-xs text-green-600">
                        Paid: {formatDateForDisplay(transaction.datePaid)}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {/* Invoice Paid Checkbox */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          id={`paid-${transaction.id}`}
                          checked={transaction.isPaid || false}
                          onCheckedChange={(checked) => handleInvoicePaidChange(transaction, checked as boolean)}
                        />
                        <label htmlFor={`paid-${transaction.id}`} className="text-xs text-gray-600 cursor-pointer">
                          Invoice Paid
                        </label>
                      </div>
                    )}
                    
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
                    
                    {/* Payment Status Badges */}
                    <div className="flex flex-col gap-1 mt-2">
                      {transaction.isPaid && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 w-fit">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
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
                          Paid: {formatDateForDisplay(transaction.commissionPaidDate)}
                        </div>
                      )}
                    </div>
                    
                    {/* Commission Status Badge */}
                    {transaction.isApproved && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 w-fit">
                        Approved
                      </Badge>
                    )}
                    
                    {/* Payment Method Badge */}
                    {transaction.paymentMethod && transaction.isPaid && transaction.paymentMethod !== "unpaid" && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 w-fit">
                        {transaction.paymentMethod === "check" ? "Check" : "Zelle"}
                      </Badge>
                    )}
                    
                    <TransactionCommissionButtons
                      transaction={transaction}
                      onApproveCommission={onApproveCommission}
                      onPayCommission={handlePayCommission}
                    />
                  </div>
                </TableCell>
                
                {isAdmin && (
                  <TableCell>
                    <TransactionTableActions
                      transaction={transaction}
                      onEditClick={onEditClick}
                      onApproveCommission={onApproveCommission}
                      onDeleteTransaction={onDeleteTransaction}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <PayCommissionDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        onPayCommission={handleConfirmPayment}
        transactionId={selectedTransactionId}
      />
    </>
  );
};
