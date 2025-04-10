
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMortgage } from "@/context/MortgageContext";
import { getCreditHistoryOption } from "@/utils/mortgageCalculations";

const factorOptions = [
  {
    id: "cashReserves",
    label: "Cash Reserves",
    options: [
      { value: "none", label: "None" },
      { value: "3-6 months", label: "3-6 months of mortgage payments (+2% DTI)" },
      { value: "6+ months", label: "6+ months of mortgage payments (+4% DTI)" },
    ],
    description: "Cash saved to cover mortgage payments in case of financial hardship."
  },
  {
    id: "residualIncome",
    label: "High Residual Income",
    options: [
      { value: "none", label: "None" },
      { value: "20-30%", label: "20-30% of gross income after debts (+2% DTI)" },
      { value: "30%+", label: "30%+ of gross income after debts (+4% DTI)" },
    ],
    description: "Income left after paying all monthly obligations, indicating financial cushion."
  },
  {
    id: "housingPaymentIncrease",
    label: "Minimal Housing Payment Increase",
    options: [
      { value: "none", label: "None" },
      { value: "<10%", label: "Increase <10% (+3% DTI)" },
      { value: "10-20%", label: "Increase 10-20% (+2% DTI)" },
    ],
    description: "The proposed new monthly housing payment compared to your current payment."
  },
  {
    id: "employmentHistory",
    label: "Stable Employment History",
    options: [
      { value: "none", label: "None" },
      { value: "3-5 years", label: "3-5 years with same employer (+1% DTI)" },
      { value: "5+ years", label: "5+ years with same employer (+2% DTI)" },
    ],
    description: "Consistent employment with the same employer, proving income reliability."
  },
  {
    id: "creditUtilization",
    label: "Low Credit Utilization",
    options: [
      { value: "none", label: "None" },
      { value: "<30%", label: "Utilization <30% (+1% DTI)" },
      { value: "<10%", label: "Utilization <10% (+2% DTI)" },
    ],
    description: "Percentage of available credit you're using, indicating responsible credit management."
  },
  {
    id: "downPayment",
    label: "Large Down Payment",
    options: [
      { value: "none", label: "None" },
      { value: "10-15%", label: "10-15% down payment (+1% DTI)" },
      { value: "15%+", label: "15%+ down payment (+2% DTI)" },
    ],
    description: "A larger down payment reduces lender risk, even beyond the minimum required."
  },
  {
    id: "creditHistory",
    label: "Excellent Credit History (Auto-selected based on FICO)",
    options: [
      { value: "none", label: "FICO <720 (No adjustment)" },
      { value: "720-759", label: "FICO 720-759 (+2% DTI)" },
      { value: "760+", label: "FICO 760+ (+3% DTI)" },
    ],
    description: "Your credit score determines this factor automatically, reflecting your creditworthiness."
  },
];

interface MitigatingFactorsSectionProps {
  selectedFactors: Record<string, string>;
  onFactorChange: (id: string, value: string) => void;
}

const MitigatingFactorsSection = ({ 
  selectedFactors, 
  onFactorChange 
}: MitigatingFactorsSectionProps) => {
  const { userData } = useMortgage();
  const [activeItem, setActiveItem] = useState<string>("cashReserves");

  useEffect(() => {
    const ficoScore = userData.financials.ficoScore;
    const creditHistoryOption = getCreditHistoryOption(ficoScore);
    onFactorChange("creditHistory", creditHistoryOption);
  }, [userData.financials.ficoScore, onFactorChange]);

  const handleSelection = (factorId: string, value: string) => {
    onFactorChange(factorId, value);
    
    // Automatically open the next accordion item after selection
    const currentIndex = factorOptions.findIndex(f => f.id === factorId);
    const nextIndex = (currentIndex + 1) % factorOptions.length;
    setActiveItem(factorOptions[nextIndex].id);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Label className="text-lg font-semibold">Compensating Factors</Label>
        <p className="text-sm text-muted-foreground mb-4">
          These factors may help you qualify for a higher loan amount. Select options that apply to your situation.
        </p>
        
        <Accordion type="single" value={activeItem} onValueChange={setActiveItem} collapsible>
          {factorOptions.map(factor => (
            <AccordionItem key={factor.id} value={factor.id} className="border-b">
              <AccordionTrigger className="py-4">{factor.label}</AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center gap-2 py-2">
                  <Select
                    value={selectedFactors[factor.id] || "none"}
                    onValueChange={(value) => handleSelection(factor.id, value)}
                    disabled={factor.id === "creditHistory"}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {factor.options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      {factor.description}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </TooltipProvider>
  );
};

export { factorOptions };
export default MitigatingFactorsSection;
