
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingResultsProps {
  isCalculating: boolean;
  onRecalculate: () => void;
}

const LoadingResults: React.FC<LoadingResultsProps> = ({
  isCalculating,
  onRecalculate
}) => {
  return (
    <div className="py-8 text-center">
      {isCalculating ? (
        <div className="space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Calculating your results...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground mb-4">
            Ready to update your mortgage results
          </p>
          <Button onClick={onRecalculate} disabled={isCalculating}>
            Recalculate Results
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadingResults;
