
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const PerplexityApiForm: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            API Service Unavailable
          </CardTitle>
          <CardDescription>
            The Perplexity API service is currently unavailable. Please contact the system administrator to ensure the API key is properly configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This application requires the Perplexity API to fetch real-time mortgage data. The API key must be configured on the server.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerplexityApiForm;
