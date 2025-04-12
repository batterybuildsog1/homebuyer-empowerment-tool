
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import CompensatingFactorsForm from "./compensating/CompensatingFactorsForm";

const CompensatingFactorsStep: React.FC = () => {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Compensating Factors
        </CardTitle>
        <CardDescription>
          Select factors that may help you qualify for a better mortgage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CompensatingFactorsForm />
      </CardContent>
    </Card>
  );
};

export default CompensatingFactorsStep;
