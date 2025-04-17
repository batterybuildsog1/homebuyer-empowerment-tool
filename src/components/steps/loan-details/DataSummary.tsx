
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { formatPercentage, formatCurrency } from "@/utils/formatters";
import { useMortgage } from "@/context/MortgageContext";
import { getRelativeTimeString } from "@/utils/formatters";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataSummaryProps {
  loanType: 'conventional' | 'fha';
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  hasAttemptedFetch: boolean;
  isError: boolean; // Add isError prop to explicitly track error state
  errorMessage: string | null; // Add error message prop
  isLoading: boolean; // Add loading state prop
  onFetchData: () => Promise<any>;
}

const DataSummary: React.FC<DataSummaryProps> = ({
  loanType,
  conventionalInterestRate,
  fhaInterestRate,
  propertyTax,
  propertyInsurance,
  hasAttemptedFetch,
  isError,
  errorMessage,
  isLoading,
  onFetchData
}) => {
  const { userData } = useMortgage();
  const interestRate = loanType === 'conventional' ? conventionalInterestRate : fhaInterestRate;
  const dataSource = userData.loanDetails.dataSource || 'unknown';
  const dataTimestamp = userData.loanDetails.dataTimestamp || 0;
  
  // Format relative time for when data was last updated
  const timeString = dataTimestamp > 0 
    ? getRelativeTimeString(new Date(dataTimestamp)) 
    : 'unknown';

  // Determine if we have data or not
  const hasData = interestRate !== null && propertyTax !== null && propertyInsurance !== null;

  const renderDataSourceBadge = () => {
    if (dataSource === 'api') {
      return <Badge variant="default" className="ml-2">Live Data</Badge>;
    } else if (dataSource === 'cache') {
      return <Badge variant="secondary" className="ml-2">Cached</Badge>;
    } else if (dataSource === 'test_data') {
      return <Badge variant="outline" className="ml-2">Test Data</Badge>;
    }
    return null;
  };

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Data Summary</h3>
        <div className="flex items-center">
          {renderDataSourceBadge()}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={onFetchData}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Display error alert when there's an error */}
      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage || "Failed to retrieve mortgage rate data. Please ensure your location is set correctly and try refreshing."}
          </AlertDescription>
        </Alert>
      )}

      {/* Display missing data alert when attempted fetch but no data */}
      {!hasData && hasAttemptedFetch && !isError && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some mortgage data is not available. Please ensure your location is set correctly and try refreshing.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">
            <p className="text-muted-foreground">Current {loanType === 'conventional' ? 'Conventional' : 'FHA'} Rate:</p>
            <p className="font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...
                </span>
              ) : interestRate ? (
                formatPercentage(interestRate)
              ) : (
                <span className={isError ? "text-destructive" : "text-amber-500"}>
                  {isError ? "Error loading rate" : "Not available"}
                </span>
              )}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Property Tax Rate:</p>
            <p className="font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...
                </span>
              ) : propertyTax ? (
                formatPercentage(propertyTax)
              ) : (
                <span className={isError ? "text-destructive" : "text-amber-500"}>
                  {isError ? "Error loading rate" : "Not available"}
                </span>
              )}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Annual Insurance:</p>
            <p className="font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading...
                </span>
              ) : propertyInsurance ? (
                formatCurrency(propertyInsurance)
              ) : (
                <span className={isError ? "text-destructive" : "text-amber-500"}>
                  {isError ? "Error loading amount" : "Not available"}
                </span>
              )}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Data Updated:</p>
            <p className="font-medium">
              {dataTimestamp > 0 ? timeString : (
                <span className="text-amber-500">Never</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSummary;
