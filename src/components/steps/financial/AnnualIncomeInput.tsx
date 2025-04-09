
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useState, useEffect, useRef } from "react";
import { useLoanData } from "@/hooks/useLoanData";
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
  const { fetchExternalData } = useLoanData();
  const { updateLoanDetails } = useMortgage();
  
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

  // Effect to trigger data fetching when income is non-zero
  useEffect(() => {
    // Clear any existing timers to prevent multiple calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only proceed if we haven't already fetched and income is greater than zero
    if (annualIncome > 0 && !fetchCalled) {
      // Set a debounce timer to prevent rapid API calls
      debounceTimerRef.current = setTimeout(async () => {
        console.log("Triggering background data fetch based on income entry:", annualIncome);
        try {
          // Fetch data in the background without showing loading animation
          const fetchedData = await fetchExternalData(true); // Background fetch
          
          // If we got data, update the loan details context directly
          if (fetchedData && 
              (fetchedData.conventionalInterestRate !== null || 
               fetchedData.fhaInterestRate !== null)) {
            console.log("Updating context with fetched data:", fetchedData);
            updateLoanDetails(fetchedData);
          }
          
          setFetchCalled(true);
          
          // Store in localStorage to prevent fetching again in this session
          localStorage.setItem("data_fetch_timestamp", Date.now().toString());
        } catch (error) {
          console.error("Background data fetch failed:", error);
          // We don't show an error here as this is a background operation
        }
      }, 800); // 800ms debounce
    }

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [annualIncome, fetchCalled, fetchExternalData, updateLoanDetails]);

  // Check localStorage on component mount to prevent repeated fetches
  useEffect(() => {
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    if (lastFetchTime) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastFetchTime) > oneHourAgo) {
        // If we fetched less than an hour ago, don't fetch again
        setFetchCalled(true);
      }
    }
    
    // Check if we already have data in localStorage that needs to be loaded into context
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
