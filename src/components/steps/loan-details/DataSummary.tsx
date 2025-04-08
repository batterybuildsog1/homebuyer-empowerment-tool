
import { Button } from "@/components/ui/button";

interface DataSummaryProps {
  loanType: 'conventional' | 'fha';
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  hasAttemptedFetch: boolean;
  onFetchData: () => Promise<void>;
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
  const hasData = conventionalInterestRate || fhaInterestRate || propertyTax || propertyInsurance;

  if (!hasData) {
    return (
      <div className="text-center py-4">
        <p className="mb-3 text-muted-foreground">No data fetched yet. Please fetch current rates and tax data.</p>
        <Button type="button" variant="outline" size="sm" onClick={onFetchData}>
          Fetch Current Data
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-medium">Data Summary</h3>
      
      {loanType === 'conventional' && conventionalInterestRate && (
        <div className="flex justify-between text-sm">
          <span>Base Interest Rate (Conventional):</span>
          <span className="font-medium">{formatInterestRate(conventionalInterestRate)}</span>
        </div>
      )}
      
      {loanType === 'fha' && fhaInterestRate && (
        <div className="flex justify-between text-sm">
          <span>Base Interest Rate (FHA):</span>
          <span className="font-medium">{formatInterestRate(fhaInterestRate)}</span>
        </div>
      )}
      
      {propertyTax && (
        <div className="flex justify-between text-sm">
          <span>Property Tax Rate:</span>
          <span className="font-medium">{propertyTax.toFixed(2)}%</span>
        </div>
      )}
      
      {propertyInsurance && (
        <div className="flex justify-between text-sm">
          <span>Annual Insurance Estimate:</span>
          <span className="font-medium">${propertyInsurance.toLocaleString()}</span>
        </div>
      )}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={onFetchData}
      >
        {hasAttemptedFetch ? "Refresh Data" : "Fetch Data"}
      </Button>
    </div>
  );
};

export default DataSummary;
