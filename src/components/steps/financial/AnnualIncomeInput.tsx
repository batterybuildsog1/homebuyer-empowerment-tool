
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useState, useEffect } from "react";

interface AnnualIncomeInputProps {
  annualIncome: number;
  onIncomeChange: (value: number) => void;
  error?: string;
}

const AnnualIncomeInput = ({ 
  annualIncome, 
  onIncomeChange, 
  error 
}: AnnualIncomeInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  
  // Update display value when annualIncome changes
  useEffect(() => {
    // If annualIncome is 0, show empty string
    if (annualIncome === 0) {
      setDisplayValue('');
    } else {
      // Format without commas or currency symbols for input field
      setDisplayValue(annualIncome.toString());
    }
  }, [annualIncome]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    // Update display value
    setDisplayValue(rawValue);
    // Convert to number and pass to parent
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    onIncomeChange(numericValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="annualIncome">Annual Income</Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          id="annualIncome"
          type="text"
          className="pl-10"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="75000"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-muted-foreground">
        Enter your gross annual income before taxes. {annualIncome > 0 && (
          <span className="font-medium">{formatCurrency(annualIncome / 12, 0)}/month</span>
        )}
      </p>
    </div>
  );
};

export default AnnualIncomeInput;
