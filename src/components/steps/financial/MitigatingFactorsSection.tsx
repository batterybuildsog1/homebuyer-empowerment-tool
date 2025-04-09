
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mitigatingFactorsOptions = [
  { 
    id: "reserves", 
    label: "Cash reserves (at least 3 months of payments)",
    description: "You have enough cash saved to cover at least three months of mortgage payments, including principal, interest, taxes, and insurance."
  },
  { 
    id: "residualIncome", 
    label: "High residual income",
    description: "After paying all monthly obligations (including the new mortgage), you have a significant amount of income left over (typically at least 20% of your gross monthly income)."
  },
  { 
    id: "housingHistory", 
    label: "Excellent housing payment history",
    description: "You have a perfect 12-24 month history of on-time rent or mortgage payments, ideally with payments similar to your proposed new payment."
  },
  { 
    id: "minimalDebt", 
    label: "Minimal increase in housing payment",
    description: "Your proposed new monthly housing payment is not significantly higher than your current rent or mortgage payment (typically less than 20% increase)."
  },
];

interface MitigatingFactorsSectionProps {
  selectedFactors: string[];
  onFactorChange: (id: string) => void;
}

const MitigatingFactorsSection = ({ 
  selectedFactors, 
  onFactorChange 
}: MitigatingFactorsSectionProps) => {
  return (
    <TooltipProvider>
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          Mitigating Factors (if any)
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              These factors can help you qualify for a higher debt-to-income ratio, potentially increasing your borrowing power.
            </TooltipContent>
          </Tooltip>
        </Label>
        <div className="space-y-2">
          {mitigatingFactorsOptions.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Checkbox
                id={option.id}
                checked={selectedFactors.includes(option.id)}
                onCheckedChange={() => onFactorChange(option.id)}
              />
              <div className="flex items-center">
                <Label
                  htmlFor={option.id}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    {option.description}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          These factors may help you qualify for a higher loan amount.
        </p>
      </div>
    </TooltipProvider>
  );
};

export { mitigatingFactorsOptions };
export default MitigatingFactorsSection;
