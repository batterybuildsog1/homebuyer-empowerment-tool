
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

const PerplexityApiForm: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Info className="h-5 w-5" />
            Test Mode Active
          </CardTitle>
          <CardDescription>
            The application is currently running in offline test mode with hardcoded values for mortgage rates and property data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Live API data will be restored when API credits are refilled. Your application will continue to function with test data in the meantime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerplexityApiForm;
