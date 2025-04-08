
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LoanTypeSelectorProps {
  loanType: 'conventional' | 'fha';
  upfrontMIP: number | null;
  ongoingMIP: number | null;
  onLoanTypeChange: (value: 'conventional' | 'fha') => void;
}

const LoanTypeSelector = ({ 
  loanType, 
  upfrontMIP, 
  ongoingMIP, 
  onLoanTypeChange 
}: LoanTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Loan Type</Label>
      <RadioGroup
        value={loanType}
        onValueChange={(value) => onLoanTypeChange(value as 'conventional' | 'fha')}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem 
            value="conventional" 
            id="conventional" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="conventional"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="font-semibold">Conventional</span>
            <span className="text-sm text-muted-foreground">3-20% Down</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem 
            value="fha" 
            id="fha" 
            className="peer sr-only" 
          />
          <Label
            htmlFor="fha"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span className="font-semibold">FHA</span>
            <span className="text-sm text-muted-foreground">3.5-10% Down</span>
          </Label>
        </div>
      </RadioGroup>
      
      <div className="text-sm pt-2">
        <p className="font-medium">Selected Option Features:</p>
        {loanType === 'conventional' ? (
          <ul className="list-disc pl-5 text-muted-foreground space-y-1 pt-1">
            <li>Typically requires higher credit scores (620+)</li>
            <li>No upfront mortgage insurance</li>
            <li>PMI can be removed at 80% LTV</li>
          </ul>
        ) : (
          <ul className="list-disc pl-5 text-muted-foreground space-y-1 pt-1">
            <li>More flexible credit requirements (580+)</li>
            <li>Upfront mortgage insurance premium (MIP): {upfrontMIP ? upfrontMIP.toFixed(2) : "N/A"}%</li>
            <li>Annual MIP: {ongoingMIP ? ongoingMIP.toFixed(2) : "N/A"}% (for the life of the loan)</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default LoanTypeSelector;
