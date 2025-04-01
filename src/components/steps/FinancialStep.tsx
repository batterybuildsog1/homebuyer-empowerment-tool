
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { DollarSign, ArrowLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const mitigatingFactorsOptions = [
  { id: "reserves", label: "Cash reserves (at least 3 months of payments)" },
  { id: "residualIncome", label: "High residual income" },
  { id: "housingHistory", label: "Excellent housing payment history" },
  { id: "minimalDebt", label: "Minimal increase in housing payment" },
];

const FinancialStep: React.FC = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
  
  const [formData, setFormData] = useState({
    annualIncome: userData.financials.annualIncome || 0,
    monthlyDebts: userData.financials.monthlyDebts || 0,
    ficoScore: userData.financials.ficoScore || 680,
    downPayment: userData.financials.downPayment || 0,
    mitigatingFactors: userData.financials.mitigatingFactors || [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.annualIncome <= 0) {
      newErrors.annualIncome = "Annual income must be greater than 0";
    }
    
    if (formData.downPayment < 0) {
      newErrors.downPayment = "Down payment cannot be negative";
    }
    
    if (formData.ficoScore < 300 || formData.ficoScore > 850) {
      newErrors.ficoScore = "FICO score must be between 300 and 850";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateFinancials(formData);
      toast.success("Financial information saved!");
      setCurrentStep(2);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleMitigatingFactorChange = (id: string) => {
    setFormData(prev => {
      const newFactors = prev.mitigatingFactors.includes(id)
        ? prev.mitigatingFactors.filter(factor => factor !== id)
        : [...prev.mitigatingFactors, id];
      
      return {
        ...prev,
        mitigatingFactors: newFactors,
      };
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Financial Details
        </CardTitle>
        <CardDescription>
          Tell us about your financial situation to calculate your mortgage affordability.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Annual Income</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="annualIncome"
                type="number"
                className="pl-10"
                value={formData.annualIncome}
                onChange={(e) => setFormData({ ...formData, annualIncome: parseFloat(e.target.value) || 0 })}
                placeholder="75000"
              />
            </div>
            {errors.annualIncome && <p className="text-sm text-destructive">{errors.annualIncome}</p>}
            <p className="text-sm text-muted-foreground">Enter your gross annual income before taxes.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyDebts">Monthly Debt Payments</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="monthlyDebts"
                type="number"
                className="pl-10"
                value={formData.monthlyDebts}
                onChange={(e) => setFormData({ ...formData, monthlyDebts: parseFloat(e.target.value) || 0 })}
                placeholder="500"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Include car loans, student loans, credit cards, personal loans, etc.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="downPayment">Down Payment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="downPayment"
                type="number"
                className="pl-10"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: parseFloat(e.target.value) || 0 })}
                placeholder="50000"
              />
            </div>
            {errors.downPayment && <p className="text-sm text-destructive">{errors.downPayment}</p>}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor="ficoScore">FICO Credit Score: {formData.ficoScore}</Label>
                <span className="text-sm font-medium">{formData.ficoScore}</span>
              </div>
              <Slider
                id="ficoScore"
                min={300}
                max={850}
                step={1}
                value={[formData.ficoScore]}
                onValueChange={(value) => setFormData({ ...formData, ficoScore: value[0] })}
                className="py-4"
              />
              {errors.ficoScore && <p className="text-sm text-destructive">{errors.ficoScore}</p>}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Mitigating Factors (if any)</Label>
            <div className="space-y-2">
              {mitigatingFactorsOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={formData.mitigatingFactors.includes(option.id)}
                    onCheckedChange={() => handleMitigatingFactorChange(option.id)}
                  />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These factors may help you qualify for a higher loan amount.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button type="submit">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FinancialStep;
