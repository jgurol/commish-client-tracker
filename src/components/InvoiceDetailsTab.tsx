
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceDetailsTabProps {
  invoiceMonth: string;
  setInvoiceMonth: (value: string) => void;
  invoiceYear: string;
  setInvoiceYear: (value: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (value: string) => void;
  isPaid: boolean;
  setIsPaid: (value: boolean) => void;
  datePaid: string;
  setDatePaid: (value: string) => void;
}

// Array for month names - needed for display
const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Helper function to get today's date in local timezone as YYYY-MM-DD
const getTodayLocalDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const InvoiceDetailsTab = ({
  invoiceMonth,
  setInvoiceMonth,
  invoiceYear,
  setInvoiceYear,
  invoiceNumber,
  setInvoiceNumber,
  isPaid,
  setIsPaid,
  datePaid,
  setDatePaid
}: InvoiceDetailsTabProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Invoice Period</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select value={invoiceMonth} onValueChange={setInvoiceMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={invoiceYear} onValueChange={setInvoiceYear}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input
          id="invoiceNumber"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Enter invoice number"
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="isPaid" 
          checked={isPaid} 
          onCheckedChange={(checked) => {
            setIsPaid(checked === true);
            if (checked === true && !datePaid) {
              setDatePaid(getTodayLocalDate());
            } else if (checked === false) {
              // Clear the paid date when unchecking
              setDatePaid("");
            }
          }}
        />
        <Label htmlFor="isPaid" className="font-medium text-sm">
          Invoice has been paid
        </Label>
      </div>

      {/* Show date paid input only when isPaid is true */}
      {isPaid && (
        <div className="space-y-2">
          <Label htmlFor="datePaid">Date Paid</Label>
          <Input
            id="datePaid"
            type="date"
            value={datePaid}
            onChange={(e) => setDatePaid(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
