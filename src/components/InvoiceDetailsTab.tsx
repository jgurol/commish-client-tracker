
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceDetailsTabProps {
  invoiceMonth: string;
  setInvoiceMonth: (value: string) => void;
  invoiceYear: string;
  setInvoiceYear: (value: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (value: string) => void;
  commissionPaidDate: string;
  setCommissionPaidDate: (value: string) => void;
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

export const InvoiceDetailsTab = ({
  invoiceMonth,
  setInvoiceMonth,
  invoiceYear,
  setInvoiceYear,
  invoiceNumber,
  setInvoiceNumber,
  commissionPaidDate,
  setCommissionPaidDate
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

      <div className="space-y-2">
        <Label htmlFor="commissionPaidDate">Commission Paid Date</Label>
        <Input
          id="commissionPaidDate"
          type="date"
          value={commissionPaidDate}
          onChange={(e) => setCommissionPaidDate(e.target.value)}
          placeholder="Leave blank if not yet paid"
        />
        <div className="text-xs text-gray-500">
          Leave blank if the commission has not been paid yet
        </div>
      </div>
    </div>
  );
};
