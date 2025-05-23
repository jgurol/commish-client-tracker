
import { Checkbox } from "@/components/ui/checkbox";

interface TransactionFiltersProps {
  showOnlyPaidInvoices: boolean;
  setShowOnlyPaidInvoices: (checked: boolean) => void;
  includePaidCommissions: boolean;
  setIncludePaidCommissions: (checked: boolean) => void;
}

export const TransactionFilters = ({
  showOnlyPaidInvoices,
  setShowOnlyPaidInvoices,
  includePaidCommissions,
  setIncludePaidCommissions
}: TransactionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
      <div className="flex items-center gap-2">
        <Checkbox 
          id="showOnlyPaidInvoices" 
          checked={showOnlyPaidInvoices} 
          onCheckedChange={(checked) => setShowOnlyPaidInvoices(checked === true)}
        />
        <label 
          htmlFor="showOnlyPaidInvoices" 
          className="text-sm text-gray-600 cursor-pointer"
        >
          Show only paid invoices
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox 
          id="includePaidCommissions" 
          checked={includePaidCommissions} 
          onCheckedChange={(checked) => setIncludePaidCommissions(checked === true)}
        />
        <label 
          htmlFor="includePaidCommissions" 
          className="text-sm text-gray-600 cursor-pointer"
        >
          Include paid commissions
        </label>
      </div>
    </div>
  );
};
