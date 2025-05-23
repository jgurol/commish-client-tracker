
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface PaymentTabProps {
  isPaid: boolean;
  datePaid: string;
  setDatePaid: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  referenceNumber: string;
  setReferenceNumber: (value: string) => void;
  commissionPaidDate: string;
  setCommissionPaidDate: (value: string) => void;
  isApproved: boolean;
  setIsApproved: (value: boolean) => void;
}

export const PaymentTab = ({
  isPaid,
  datePaid,
  setDatePaid,
  paymentMethod,
  setPaymentMethod,
  referenceNumber,
  setReferenceNumber,
  commissionPaidDate,
  setCommissionPaidDate,
  isApproved,
  setIsApproved
}: PaymentTabProps) => {
  return (
    <div className="space-y-4">
      {isPaid && (
        <>
          <div className="space-y-2">
            <Label htmlFor="datePaid">Date Paid</Label>
            <Input
              id="datePaid"
              type="date"
              value={datePaid}
              onChange={(e) => setDatePaid(e.target.value)}
              required={isPaid}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="check" id="edit-check" />
                <Label htmlFor="edit-check">Check</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zelle" id="edit-zelle" />
                <Label htmlFor="edit-zelle">Zelle</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referenceNumber">
              {paymentMethod === "check" ? "Check Number" : "Zelle Reference"}
            </Label>
            <Input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={paymentMethod === "check" ? "Enter check number" : "Enter Zelle reference"}
            />
          </div>
        </>
      )}

      {/* Payment Approval - Always visible */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="isApproved" 
            checked={isApproved} 
            onCheckedChange={(checked) => setIsApproved(checked === true)}
          />
          <Label htmlFor="isApproved" className="font-medium text-sm">
            Payment approved
          </Label>
        </div>
        {!isPaid && (
          <div className="text-xs text-amber-600">
            ⚠️ Note: This transaction is not marked as paid yet
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="commissionPaidDate">Commission Paid Date</Label>
        <div className="flex gap-2">
          <Input
            id="commissionPaidDate"
            type="date"
            value={commissionPaidDate}
            onChange={(e) => setCommissionPaidDate(e.target.value)}
            placeholder="Leave blank if not yet paid"
            className="flex-1"
          />
          {commissionPaidDate && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCommissionPaidDate("")}
              className="shrink-0"
              title="Clear commission paid date"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Leave blank if the commission has not been paid yet
        </div>
      </div>
    </div>
  );
};
