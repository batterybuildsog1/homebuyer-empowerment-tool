
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface FicoScoreSliderProps {
  ficoScore: number;
  onScoreChange: (value: number) => void;
  error?: string;
}

const FicoScoreSlider = ({ 
  ficoScore, 
  onScoreChange, 
  error 
}: FicoScoreSliderProps) => {
  // Function to determine credit score category
  const getCreditCategory = (score: number): string => {
    if (score < 580) return "Poor";
    if (score < 670) return "Fair";
    if (score < 740) return "Good";
    if (score < 800) return "Very Good";
    return "Excellent";
  };

  const getColorClass = (score: number): string => {
    if (score < 580) return "text-destructive";
    if (score < 670) return "text-yellow-500";
    if (score < 740) return "text-amber-500";
    if (score < 800) return "text-green-500";
    return "text-finance-green";
  };

  const category = getCreditCategory(ficoScore);
  const colorClass = getColorClass(ficoScore);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="ficoScore" className="text-base font-medium">FICO Credit Score</Label>
          <span className={cn("text-lg font-semibold", colorClass)}>{ficoScore}</span>
        </div>
        
        <div className="pb-2 pt-1">
          <Slider
            id="ficoScore"
            min={300}
            max={850}
            step={1}
            value={[ficoScore]}
            onValueChange={(value) => onScoreChange(value[0])}
            className="py-4"
          />
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
        
        <div className="flex justify-between items-center">
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className={cn(
                "h-2.5 rounded-full",
                ficoScore < 580 ? "bg-red-500" : 
                ficoScore < 670 ? "bg-yellow-500" : 
                ficoScore < 740 ? "bg-amber-500" : 
                ficoScore < 800 ? "bg-green-500" : "bg-finance-green"
              )}
              style={{ width: `${((ficoScore - 300) / 550) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>300</span>
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Excellent</span>
          <span>850</span>
        </div>
        
        <div className="mt-2 flex justify-center">
          <span className={cn("px-4 py-1 rounded-full text-sm font-medium", 
            ficoScore < 580 ? "bg-red-100 text-red-800" : 
            ficoScore < 670 ? "bg-yellow-100 text-yellow-800" : 
            ficoScore < 740 ? "bg-amber-100 text-amber-800" : 
            ficoScore < 800 ? "bg-green-100 text-green-800" : 
            "bg-emerald-100 text-emerald-800"
          )}>
            {category}
          </span>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border border-border">
        <p>Your credit score significantly impacts your mortgage rate and approval odds. Higher scores typically lead to better rates and loan terms.</p>
      </div>
    </div>
  );
};

export default FicoScoreSlider;
