
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

interface PaymentTabProps {
  isPaid: boolean;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  referenceNumber: string;
  setReferenceNumber: (value: string) => void;
  commissionPaidDate: string;
  setCommissionPaidDate: (value: string) => void;
  isApproved: boolean;
  setIsApproved: (value: boolean) => void;
  onImmediateUpdate?: () => void;
}

export const PaymentTab = ({
  isPaid,
  paymentMethod,
  setPaymentMethod,
  referenceNumber,
  setReferenceNumber,
  commissionPaidDate,
  setCommissionPaidDate,
  isApproved,
  setIsApproved,
  onImmediateUpdate
}: PaymentTabProps) => {
  const { isOwner } = useAuth();

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    if (onImmediateUpdate) {
      onImmediateUpdate();
    }
  };

  const handleCommissionApprovalChange = (checked: boolean) => {
    if (!isOwner) {
      // Don't allow non-owners to change approval status
      return;
    }
    setIsApproved(checked);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Commission Management</h4>
        
        {/* Commission Approval - Only owners can modify - MOVED TO TOP */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="edit-isApproved"
            checked={isApproved}
            onCheckedChange={handleCommissionApprovalChange}
            disabled={!isOwner}
          />
          <Label 
            htmlFor="edit-isApproved" 
            className={`text-sm ${!isOwner ? 'text-gray-400' : 'cursor-pointer'}`}
          >
            Commission Approved {!isOwner && "(Owner only)"}
          </Label>
        </div>

        {!isOwner && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Only owners can approve commissions. Current status: {isApproved ? 'Approved' : 'Not approved'}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="edit-commissionPaidDate">Commission Paid Date</Label>
          <Input
            id="edit-commissionPaidDate"
            type="date"
            value={commissionPaidDate}
            onChange={(e) => setCommissionPaidDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="edit-paymentMethod">Payment Method</Label>
        <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="zelle">Zelle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod !== "unpaid" && (
        <div className="space-y-2">
          <Label htmlFor="edit-referenceNumber">Reference Number</Label>
          <Input
            id="edit-referenceNumber"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Check number or reference"
          />
        </div>
      )}
    </div>
  );
};
