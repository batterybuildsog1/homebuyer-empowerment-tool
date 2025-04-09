
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, CreditCard, ChevronDown } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

export interface DebtItems {
  carLoan: number;
  studentLoan: number;
  creditCard: number;
  personalLoan: number;
  otherDebt: number;
}

export const debtCategories = [
  { id: "carLoan", label: "Car Loans" },
  { id: "studentLoan", label: "Student Loans" },
  { id: "creditCard", label: "Credit Cards" },
  { id: "personalLoan", label: "Personal Loans" },
  { id: "otherDebt", label: "Other Debt" }
];

interface DebtItemsSectionProps {
  debtItems: DebtItems;
  onDebtItemChange: (id: string, value: number) => void;
}

const DebtItemsSection = ({ 
  debtItems, 
  onDebtItemChange 
}: DebtItemsSectionProps) => {
  const [isDebtsOpen, setIsDebtsOpen] = useState(false);
  
  const calculateTotalMonthlyDebt = () => {
    return Object.values(debtItems).reduce((sum, value) => sum + (Number(value) || 0), 0);
  };
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-2">
      <Label>Monthly Debt Payments: {formatCurrency(calculateTotalMonthlyDebt())}</Label>
      <Collapsible
        open={isDebtsOpen}
        onOpenChange={setIsDebtsOpen}
        className="border rounded-md"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-secondary">
          <div className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
            <span>Itemize your monthly debts</span>
          </div>
          <ChevronDown className={`h-4 w-4 transform transition-transform ${isDebtsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0 space-y-3">
          {debtCategories.map((category) => (
            <div key={category.id} className="space-y-1">
              <Label htmlFor={category.id}>{category.label}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id={category.id}
                  type="number"
                  placeholder="0"
                  className="pl-10"
                  value={(debtItems as any)[category.id] || 0}
                  onChange={(e) => onDebtItemChange(category.id, parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center font-medium pt-2 border-t">
            <span>Total Monthly Debt:</span>
            <span>{formatCurrency(calculateTotalMonthlyDebt())}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <p className="text-sm text-muted-foreground">
        Include all recurring monthly debt obligations.
      </p>
    </div>
  );
};

export default DebtItemsSection;
