
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

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
  return (
    <div className="space-y-2">
      <Label htmlFor="annualIncome">Annual Income</Label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          id="annualIncome"
          type="number"
          className="pl-10"
          value={annualIncome}
          onChange={(e) => onIncomeChange(parseFloat(e.target.value) || 0)}
          placeholder="75000"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-muted-foreground">Enter your gross annual income before taxes.</p>
    </div>
  );
};

export default AnnualIncomeInput;
