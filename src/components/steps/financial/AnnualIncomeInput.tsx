import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useState, useEffect, useRef } from "react";
import { useDataFetching } from "@/hooks/data/useDataFetching";
import { useMortgage } from "@/context/MortgageContext";

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
  const [fetchCalled, setFetchCalled] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { fetchExternalData } = useDataFetching();
  const { updateLoanDetails } = useMortgage();
  
  useEffect(() => {
    if (annualIncome === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(annualIncome.toString());
    }
  }, [annualIncome]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (annualIncome > 0 && !fetchCalled) {
      debounceTimerRef.current = setTimeout(async () => {
        console.log("Triggering background data fetch based on income entry:", annualIncome);
        try {
          const success = await fetchExternalData(true);
          if (success) {
            setFetchCalled(true);
            localStorage.setItem("data_fetch_timestamp", Date.now().toString());
          }
        } catch (error) {
          console.error("Background data fetch failed:", error);
        }
      }, 800);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [annualIncome, fetchCalled, fetchExternalData]);

  useEffect(() => {
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    if (lastFetchTime) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastFetchTime) > oneHourAgo) {
        setFetchCalled(true);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setDisplayValue(rawValue);
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    onIncomeChange(numericValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="bg-[#8b76e0]/10 p-2 rounded-full flex-shrink-0">
          <TrendingUp className="h-5 w-5 text-[#8b76e0]" />
        </div>
        <div>
          <Label htmlFor="annualIncome" className="text-base font-medium">Annual Income</Label>
          <p className="text-sm text-muted-foreground">
            Enter your gross annual income before taxes.
          </p>
        </div>
      </div>
      
      <div className="relative">
        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input
          id="annualIncome"
          type="text"
          className="pl-10 font-medium text-base border-muted/30 focus:border-[#8b76e0] transition-colors"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="75000"
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
      
      {annualIncome > 0 && (
        <div className="bg-[#8b76e0]/5 p-3 rounded-md border border-[#8b76e0]/20 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Monthly Income</span>
          <span className="text-[#8b76e0] font-semibold">
            {formatCurrency(annualIncome / 12, 0)}/month
          </span>
        </div>
      )}
    </div>
  );
};

export default AnnualIncomeInput;
