
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface PaymentTabProps {
  isPaid: boolean;
  setIsPaid: (value: boolean) => void;
  datePaid: string;
  setDatePaid: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  referenceNumber: string;
  setReferenceNumber: (value: string) => void;
}

export const PaymentTab = ({
  isPaid,
  setIsPaid,
  datePaid,
  setDatePaid,
  paymentMethod,
  setPaymentMethod,
  referenceNumber,
  setReferenceNumber
}: PaymentTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="isPaid" 
          checked={isPaid} 
          onCheckedChange={(checked) => {
            setIsPaid(checked === true);
            if (checked === true && !datePaid) {
              setDatePaid(new Date().toISOString().split('T')[0]);
            }
          }}
        />
        <Label htmlFor="isPaid" className="font-medium text-sm">
          Invoice has been paid
        </Label>
      </div>
      
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
    </div>
  );
};
