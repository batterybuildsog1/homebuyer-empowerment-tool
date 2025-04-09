
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  
  // Check what specific data is missing
  const missingData = {
    interestRate: loanType === 'conventional' ? conventionalInterestRate === null : fhaInterestRate === null,
    propertyTax: propertyTax === null,
    propertyInsurance: propertyInsurance === null
  };
  
  const handleFetchClick = async () => {
    try {
      toast.info("Fetching current mortgage data...");
      const result = await onFetchData();
      if (!result) {
        toast.error("Couldn't retrieve data. Please check your location information and try again.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data.");
    }
  };

  if (!hasData) {
    return (
      <Card className="p-4 border border-amber-200 bg-amber-50">
        <div className="text-center py-4">
          <p className="mb-3 text-amber-800">
            {hasAttemptedFetch 
              ? "Data fetch attempted but no results were found. Please check your location information and try again."
              : "No data fetched yet. Data will be automatically retrieved when you enter your location and income."
            }
          </p>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleFetchClick}
            className="flex items-center gap-1"
          >
            {hasAttemptedFetch ? <RefreshCw className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {hasAttemptedFetch ? "Retry Fetch Data" : "Fetch Current Data"}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium">Data Summary</h3>
      
      <div className="space-y-2 divide-y">
        <div className="pb-2">
          <h4 className="text-sm font-medium mb-1">Interest Rates</h4>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex justify-between text-sm">
              <span>Conventional:</span>
              <span className={conventionalInterestRate === null ? "text-amber-500" : "font-medium"}>
                {formatInterestRate(conventionalInterestRate)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>FHA:</span>
              <span className={fhaInterestRate === null ? "text-amber-500" : "font-medium"}>
                {formatInterestRate(fhaInterestRate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="py-2">
          <h4 className="text-sm font-medium mb-1">Property Data</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Property Tax Rate:</span>
              <span className={propertyTax === null ? "text-amber-500" : "font-medium"}>
                {propertyTax === null ? "N/A" : `${propertyTax.toFixed(2)}%`}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Annual Insurance:</span>
              <span className={propertyInsurance === null ? "text-amber-500" : "font-medium"}>
                {propertyInsurance === null ? "N/A" : `$${propertyInsurance?.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {!hasRequiredData && (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1"
            onClick={handleFetchClick}
          >
            <RefreshCw className="h-4 w-4" />
            Fetch Missing Data
          </Button>
          <p className="text-xs text-amber-600 mt-2 text-center">
            {missingData.interestRate && `Missing ${loanType} interest rate. `}
            {missingData.propertyTax && "Missing property tax rate. "}
            {missingData.propertyInsurance && "Missing insurance data. "}
            These are required to calculate accurate results.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataSummary;
