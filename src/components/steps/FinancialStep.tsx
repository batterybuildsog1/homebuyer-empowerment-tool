
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import FinancialStepForm from "./financial/FinancialStepForm";

const FinancialStep: React.FC = () => {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Financial Details
        </CardTitle>
        <CardDescription>
          Tell us about your financial situation to calculate your mortgage affordability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FinancialStepForm />
      </CardContent>
    </Card>
  );
};

export default FinancialStep;
