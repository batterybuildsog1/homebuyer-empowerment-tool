import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
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
          const fetchedData = await fetchExternalData(true);
          if (fetchedData && 
              (fetchedData.conventionalInterestRate !== null || 
               fetchedData.fhaInterestRate !== null)) {
            console.log("Updating context with fetched data:", fetchedData);
            updateLoanDetails(fetchedData);
          }
          
          setFetchCalled(true);
          
          localStorage.setItem("data_fetch_timestamp", Date.now().toString());
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
  }, [annualIncome, fetchCalled, fetchExternalData, updateLoanDetails]);

  useEffect(() => {
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    if (lastFetchTime) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastFetchTime) > oneHourAgo) {
        setFetchCalled(true);
      }
    }
    
    const cachedData = localStorage.getItem("cached_loan_data");
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (parsedData.conventionalInterestRate !== null || 
            parsedData.fhaInterestRate !== null) {
          console.log("Loading cached loan data from AnnualIncomeInput:", parsedData);
          updateLoanDetails(parsedData);
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
      }
    }
  }, [updateLoanDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setDisplayValue(rawValue);
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
