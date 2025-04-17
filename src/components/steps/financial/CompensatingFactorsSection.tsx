
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, PiggyBank, Briefcase, CreditCard, Home, Info, Scale, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Compensating factor options with detailed structure
export const compensatingFactorOptions = [
  {
    id: "cashReserves",
    label: "Cash Reserves (after closing)",
    icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />,
    options: [
      { value: "none", label: "None" },
      { value: "1-2 months", label: "1-2 months of payments" },
      { value: "3-5 months", label: "3-5 months of payments" },
      { value: "6+ months", label: "6+ months of payments" },
    ],
    description: "Months of mortgage payments left in savings after your down payment and closing costs.",
    isStrong: (value: string) => value === "6+ months"
  },
  {
    id: "residualIncome",
    label: "Residual Income",
    icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    options: [
      { value: "does not meet", label: "Does not meet VA guidelines" },
      { value: "meets VA guidelines", label: "Meets VA guidelines" },
    ],
    description: "Money left over after paying all bills. VA guidelines vary by family size and region.",
    isStrong: (value: string) => value === "meets VA guidelines",
    helpLink: "https://www.hud.gov/sites/documents/4155-1_4_SECE.PDF"
  },
  {
    id: "housingPaymentIncrease",
    label: "Housing Payment Increase",
    icon: <Home className="h-4 w-4 text-muted-foreground" />,
    options: [
      { value: ">20%", label: "More than 20% increase" },
      { value: "10-20%", label: "10-20% increase" },
      { value: "<10%", label: "Less than 10% increase" },
    ],
    description: "How much your new mortgage payment will increase compared to your current housing expense.",
    isStrong: (value: string) => value === "<10%"
  },
  {
    id: "employmentHistory",
    label: "Employment History",
    icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
    options: [
      { value: "<2 years", label: "Less than 2 years" },
      { value: "2-5 years", label: "2-5 years" },
      { value: ">5 years", label: "More than 5 years" },
    ],
    description: "How long you've been in your current job or career field.",
    isStrong: (value: string) => value === ">5 years"
  },
  {
    id: "creditUtilization",
    label: "Credit Utilization",
    icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    options: [
      { value: ">30%", label: "More than 30%" },
      { value: "10-30%", label: "10-30%" },
      { value: "<10%", label: "Less than 10%" },
    ],
    description: "The percentage of your available credit you're currently using.",
    isStrong: (value: string) => value === "<10%"
  },
  {
    id: "downPayment",
    label: "Down Payment",
    icon: <Percent className="h-4 w-4 text-muted-foreground" />,
    options: [
      { value: "<5%", label: "Less than 5%" },
      { value: "5-10%", label: "5-10%" },
      { value: ">10%", label: "More than 10%" },
    ],
    description: "The percentage of the home price you plan to pay upfront.",
    isStrong: (value: string) => value === ">10%"
  },
];

/**
 * Props for the CompensatingFactorsSection component
 */
interface CompensatingFactorsSectionProps {
  /** Selected factor values */
  selectedFactors: Record<string, string>;
  /** Handler for factor value changes */
  onFactorChange: (id: string, value: string) => void;
  /** Current housing payment amount */
  currentHousingPayment?: number;
  /** Handler for current housing payment changes */
  onCurrentHousingPaymentChange?: (value: number) => void;
}

/**
 * Component for displaying and managing compensating factors
 * These factors can help qualify for a higher DTI ratio
 */
const CompensatingFactorsSection = ({ 
  selectedFactors, 
  onFactorChange,
  currentHousingPayment = 0,
  onCurrentHousingPaymentChange
}: CompensatingFactorsSectionProps) => {
  // Count strong factors that significantly impact DTI allowance
  const countStrongFactors = () => {
    let count = 0;
    
    // Check each factor to see if it's a strong factor
    compensatingFactorOptions.forEach(factor => {
      if (factor.isStrong && factor.isStrong(selectedFactors[factor.id] || 'none')) {
        count++;
      }
    });
    
    // Check for credit history (this comes from FICO and isn't in the UI)
    if (selectedFactors.creditHistory === '760+') {
      count++;
    }
    
    // Check for non-housing DTI (this is calculated rather than selected)
    if (selectedFactors.nonHousingDTI === '<5%') {
      count++;
    }
    
    return count;
  };
  
  const strongFactorCount = countStrongFactors();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="bg-finance-purple/10 p-2 rounded-full flex-shrink-0">
          <Scale className="h-5 w-5 text-finance-purple" />
        </div>
        <div>
          <h3 className="text-base font-medium">Compensating Factors</h3>
          <p className="text-sm text-muted-foreground">
            These factors can significantly increase your purchasing power.
          </p>
        </div>
      </div>
      
      {compensatingFactorOptions.map((factor) => (
        <div key={factor.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              {factor.icon} {factor.label}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {factor.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            value={selectedFactors[factor.id] || factor.options[0].value} 
            onValueChange={(value) => {
              console.log(`Changing factor ${factor.id} to ${value}`);
              onFactorChange(factor.id, value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${factor.label}`} />
            </SelectTrigger>
            <SelectContent>
              {factor.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {factor.helpLink && (
            <p className="text-xs text-muted-foreground">
              <a href={factor.helpLink} target="_blank" rel="noopener noreferrer" className="underline">
                View guidelines
              </a>
            </p>
          )}
        </div>
      ))}
      
      {/* Current Housing Payment - only if handler provided */}
      {onCurrentHousingPaymentChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="currentHousingPayment">Current Housing Payment</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Your current monthly rent or mortgage payment.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="currentHousingPayment"
              type="number"
              className="pl-10"
              value={currentHousingPayment || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                console.log("Changing housing payment to", value);
                onCurrentHousingPaymentChange(value);
              }}
              placeholder="0"
            />
          </div>
        </div>
      )}
      
      <div className="bg-secondary/50 p-3 rounded-md border border-border mt-4">
        <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
          <Scale className="h-4 w-4 text-finance-purple" />
          Strong Factors for Higher DTI Approval
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 6+ months of cash reserves</li> 
          <li>• Credit score 760 or above</li>
          <li>• Minimal non-housing debt (less than 5% DTI)</li>
          <li>• Meeting VA residual income guidelines</li>
        </ul>
        <p className="text-xs mt-2">
          You have <span className={strongFactorCount >= 2 ? "text-finance-green font-medium" : ""}>{strongFactorCount} strong factor{strongFactorCount !== 1 ? 's' : ''}</span>.
          {strongFactorCount < 2 ? " Having at least two factors significantly increases approval chances." : ""}
        </p>
      </div>
    </div>
  );
};

export default CompensatingFactorsSection;
