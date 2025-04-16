
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Info, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DTIStatus } from "@/utils/mortgage/dtiCalculations";

interface DTIWarningTooltipProps {
  dtiStatus: DTIStatus;
  showIcon?: boolean;
  className?: string;
  tooltipWidth?: "default" | "wide" | "narrow";
  useHoverCard?: boolean;
}

const DTIWarningTooltip: React.FC<DTIWarningTooltipProps> = ({ 
  dtiStatus, 
  showIcon = true,
  className,
  tooltipWidth = "default",
  useHoverCard = false
}) => {
  // Return null if status is normal or dtiStatus is undefined
  if (!dtiStatus || dtiStatus.status === 'normal') return null;
  
  const getIcon = () => {
    switch (dtiStatus.status) {
      case 'exceeded':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'caution':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const textColorClass = dtiStatus.status === 'exceeded' 
    ? 'text-destructive' 
    : dtiStatus.status === 'warning' 
      ? 'text-yellow-600 dark:text-yellow-500' 
      : 'text-blue-600 dark:text-blue-500';
  
  const widthClass = tooltipWidth === "wide" 
    ? "max-w-md" 
    : tooltipWidth === "narrow" 
      ? "max-w-xs" 
      : "max-w-sm";
  
  const content = (
    <div className={cn("flex items-center gap-1.5", className)}>
      {showIcon && getIcon()}
      <span className={cn("text-sm", textColorClass)}>
        {dtiStatus.message}
      </span>
    </div>
  );
  
  if (useHoverCard) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="cursor-help">{content}</div>
        </HoverCardTrigger>
        <HoverCardContent className={widthClass}>
          <p>{dtiStatus.helpText}</p>
        </HoverCardContent>
      </HoverCard>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent className={widthClass}>
          <p>{dtiStatus.helpText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DTIWarningTooltip;
