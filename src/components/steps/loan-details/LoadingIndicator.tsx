
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  progress: number;
  message: string;
}

const LoadingIndicator = ({ progress, message }: LoadingIndicatorProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-center font-medium">{message}</p>
      <Progress value={progress} className="w-full" />
    </div>
  );
};

export default LoadingIndicator;
