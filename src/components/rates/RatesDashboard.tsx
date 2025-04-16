
import { MortgageRatesCard } from "./MortgageRatesCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const RatesDashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Mortgage Rate Dashboard</h2>
      
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Automated Rate Fetching</AlertTitle>
        <AlertDescription>
          Rates are automatically fetched daily at 4:00 PM UTC. You can manually refresh using the button below.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MortgageRatesCard />
        
        <Card>
          <CardHeader>
            <CardTitle>How Rates Are Used</CardTitle>
            <CardDescription>Understanding mortgage rate impacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Current mortgage rates are fetched from Mortgage News Daily (MND) and used throughout 
                the calculator to provide accurate estimates for your home buying power.
              </p>
              <p>
                The spread between conventional and FHA rates (measured in basis points or "bps") 
                is an important indicator of market conditions and potential savings between loan types.
              </p>
              <p>
                These rates are updated daily to ensure your mortgage calculations remain 
                accurate and reflect current market conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
