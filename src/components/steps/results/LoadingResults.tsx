
import React from "react";
import { Button } from "@/components/ui/button";

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
      <p className="text-lg text-muted-foreground mb-4">Calculating your results...</p>
      <Button onClick={onRecalculate} disabled={isCalculating}>
        {isCalculating ? "Calculating..." : "Recalculate"}
      </Button>
    </div>
  );
};

export default LoadingResults;
