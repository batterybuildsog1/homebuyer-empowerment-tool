
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between">
          <Label htmlFor="ficoScore">FICO Credit Score: {ficoScore}</Label>
          <span className="text-sm font-medium">{ficoScore}</span>
        </div>
        <Slider
          id="ficoScore"
          min={300}
          max={850}
          step={1}
          value={[ficoScore]}
          onValueChange={(value) => onScoreChange(value[0])}
          className="py-4"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Poor</span>
        <span>Fair</span>
        <span>Good</span>
        <span>Excellent</span>
      </div>
    </div>
  );
};

export default FicoScoreSlider;
