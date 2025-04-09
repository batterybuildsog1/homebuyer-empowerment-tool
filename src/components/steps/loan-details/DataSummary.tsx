
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface DataSummaryProps {
  loanType: 'conventional' | 'fha';
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  hasAttemptedFetch: boolean;
  onFetchData: () => Promise<any>; 
}

const DataSummary = ({
  loanType,
  conventionalInterestRate,
  fhaInterestRate,
  propertyTax,
  propertyInsurance,
  hasAttemptedFetch,
  onFetchData
}: DataSummaryProps) => {
  // Helper function to format interest rates with two decimal places
  const formatInterestRate = (rate: number | null): string => {
    if (rate === null) return "N/A";
    return rate.toFixed(2) + "%";
  };

  // Check if we have any data to display
  const hasData = conventionalInterestRate !== null || fhaInterestRate !== null || propertyTax !== null || propertyInsurance !== null;
  
  // Check if we have the required data for current loan type
  const hasRequiredData = loanType === 'conventional' ? 
    (conventionalInterestRate !== null && propertyTax !== null && propertyInsurance !== null) : 
    (fhaInterestRate !== null && propertyTax !== null && propertyInsurance !== null);
  
  // Only show the fetch button if we've never attempted a fetch OR we've attempted but don't have data
  const shouldShowFetchButton = !hasRequiredData;

  const handleFetchClick = async () => {
    try {
      const result = await onFetchData();
      if (!result || (result.conventionalInterestRate === null && result.fhaInterestRate === null)) {
        toast.error("Couldn't retrieve data. Please check your location information and try again.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data.");
    }
  };

  if (!hasData) {
    return (
      <div className="text-center py-4">
        <p className="mb-3 text-muted-foreground">
          {hasAttemptedFetch 
            ? "Data fetch attempted but no results were found. Please check your location information and try again."
            : "No data fetched yet. Data will be automatically retrieved when you enter your annual income."
          }
        </p>
        {shouldShowFetchButton && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleFetchClick}
            className="flex items-center gap-1"
          >
            {hasAttemptedFetch ? <AlertCircle className="h-4 w-4" /> : null}
            {hasAttemptedFetch ? "Retry Fetch Data" : "Fetch Current Data"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium">Data Summary</h3>
      
      {loanType === 'conventional' && conventionalInterestRate !== null && (
        <div className="flex justify-between text-sm">
          <span>Base Interest Rate (Conventional):</span>
          <span className="font-medium">{formatInterestRate(conventionalInterestRate)}</span>
        </div>
      )}
      
      {loanType === 'fha' && fhaInterestRate !== null && (
        <div className="flex justify-between text-sm">
          <span>Base Interest Rate (FHA):</span>
          <span className="font-medium">{formatInterestRate(fhaInterestRate)}</span>
        </div>
      )}
      
      {propertyTax !== null && (
        <div className="flex justify-between text-sm">
          <span>Property Tax Rate:</span>
          <span className="font-medium">{propertyTax.toFixed(2)}%</span>
        </div>
      )}
      
      {propertyInsurance !== null && (
        <div className="flex justify-between text-sm">
          <span>Annual Insurance Estimate:</span>
          <span className="font-medium">${propertyInsurance?.toLocaleString()}</span>
        </div>
      )}
      
      {!hasRequiredData && (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
            onClick={handleFetchClick}
          >
            {hasAttemptedFetch ? <AlertCircle className="h-4 w-4" /> : null}
            {hasAttemptedFetch ? "Retry Data Fetch" : "Fetch Missing Data"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataSummary;
