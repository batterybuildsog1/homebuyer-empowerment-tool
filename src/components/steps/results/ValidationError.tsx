
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ValidationErrorProps {
  errorMessage: string;
  onGoBack: () => void;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ errorMessage, onGoBack }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle className="text-lg mb-2">Missing Information</AlertTitle>
          <AlertDescription className="text-base">{errorMessage}</AlertDescription>
          <div className="mt-4">
            <Button onClick={onGoBack} variant="outline" className="mt-2">
              Go Back to Complete Information
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default ValidationError;
