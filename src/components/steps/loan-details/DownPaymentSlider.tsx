
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface DownPaymentSliderProps {
  downPayment: number;
  loanType: 'conventional' | 'fha';
  ltv: number;
  onDownPaymentChange: (value: number) => void;
}

const DownPaymentSlider = ({ 
  downPayment, 
  loanType, 
  ltv, 
  onDownPaymentChange 
}: DownPaymentSliderProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Label htmlFor="downPayment">Down Payment: {downPayment.toFixed(1)}%</Label>
        <span className="text-sm font-medium">
          LTV: {ltv.toFixed(1)}%
        </span>
      </div>
      <Slider
        id="downPayment"
        min={loanType === 'conventional' ? 3 : 3.5}
        max={loanType === 'conventional' ? 20 : 10}
        step={0.5}
        value={[downPayment]}
        onValueChange={(value) => onDownPaymentChange(value[0])}
        className="py-4"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Min: {loanType === 'conventional' ? '3%' : '3.5%'}</span>
        <span>Max: {loanType === 'conventional' ? '20%' : '10%'}</span>
      </div>
    </div>
  );
};

export default DownPaymentSlider;
