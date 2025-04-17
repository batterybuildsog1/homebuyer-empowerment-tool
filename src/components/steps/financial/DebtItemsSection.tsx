
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, CreditCard, ChevronDown, AlertCircle } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DebtItems } from "@/context/mortgage/types";

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
  monthlyIncome?: number; // Optional, used for non-housing DTI calculation
}

const DebtItemsSection = ({ 
  debtItems, 
  onDebtItemChange,
  monthlyIncome = 0
}: DebtItemsSectionProps) => {
  const [isDebtsOpen, setIsDebtsOpen] = useState(false);
  
  const calculateTotalMonthlyDebt = () => {
    return Object.values(debtItems).reduce((sum, value) => sum + (Number(value) || 0), 0);
  };
  
  const calculateNonHousingDTI = () => {
    if (monthlyIncome <= 0) return 0;
    return (calculateTotalMonthlyDebt() / monthlyIncome) * 100;
  };
  
  const getNonHousingDTICategory = () => {
    const dti = calculateNonHousingDTI();
    if (dti < 5) return { text: "Low (<5%)", color: "text-green-600" };
    if (dti <= 10) return { text: "Moderate (5-10%)", color: "text-amber-600" };
    return { text: "High (>10%)", color: "text-red-600" };
  };
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalMonthlyDebt = calculateTotalMonthlyDebt();
  const nonHousingDTI = calculateNonHousingDTI();
  const dtiCategory = getNonHousingDTICategory();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Monthly Debt Payments: {formatCurrency(totalMonthlyDebt)}</Label>
        
        {monthlyIncome > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 text-xs">
                <span className={`font-medium ${dtiCategory.color}`}>{dtiCategory.text}</span>
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Non-Housing DTI: {nonHousingDTI.toFixed(1)}%<br />
                  (Monthly debt / monthly income)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
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
                  value={debtItems[category.id] || 0}
                  onChange={(e) => onDebtItemChange(category.id, parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center font-medium pt-2 border-t">
            <span>Total Monthly Debt:</span>
            <span>{formatCurrency(totalMonthlyDebt)}</span>
          </div>
          
          {monthlyIncome > 0 && (
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span>Non-Housing DTI:</span>
              <span className={`font-medium ${dtiCategory.color}`}>
                {nonHousingDTI.toFixed(1)}%
              </span>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      <p className="text-sm text-muted-foreground">
        Include all recurring monthly debt obligations.
      </p>
    </div>
  );
};

export default DebtItemsSection;
