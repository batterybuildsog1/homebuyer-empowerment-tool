
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
  totalSteps: number;
}

export const StepIndicator = ({ 
  step, 
  currentStep, 
  label,
  totalSteps 
}: StepIndicatorProps) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all",
          isActive && "bg-finance-purple text-white ring-2 ring-finance-purple/20",
          isCompleted && "bg-finance-purple/20 text-finance-purple",
          !isActive && !isCompleted && "bg-secondary text-muted-foreground"
        )}
      >
        {isCompleted ? (
          <Check className="h-5 w-5" />
        ) : (
          <span>{step + 1}</span>
        )}
      </div>
      
      {step < totalSteps - 1 && (
        <div 
          className={cn(
            "w-full h-[2px] my-4 hidden md:block",
            isCompleted ? "bg-finance-purple" : "bg-border"
          )}
        />
      )}
      
      <span className={cn(
        "text-xs mt-1 font-medium hidden md:block",
        isActive && "text-finance-purple",
        isCompleted && "text-finance-purple",
        !isActive && !isCompleted && "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};

export default StepIndicator;
