
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
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Missing Information</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
      <div className="mt-4">
        <Button onClick={onGoBack} variant="outline" className="mt-2">
          Go Back to Previous Step
        </Button>
      </div>
    </Alert>
  );
};

export default ValidationError;
