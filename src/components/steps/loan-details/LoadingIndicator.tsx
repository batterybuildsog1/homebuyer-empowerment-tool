
import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  message: string;
  progress: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#8b76e0] border-t-transparent" />
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-1.5" />
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
