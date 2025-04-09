
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { DollarSign, ArrowLeft, CreditCard, ChevronDown, HelpCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BuyingPowerChart from "./financial/BuyingPowerChart";
import { useLoanData } from "@/hooks/useLoanData";

const mitigatingFactorsOptions = [
  { 
    id: "reserves", 
    label: "Cash reserves (at least 3 months of payments)",
    description: "You have enough cash saved to cover at least three months of mortgage payments, including principal, interest, taxes, and insurance."
  },
  { 
    id: "residualIncome", 
    label: "High residual income",
    description: "After paying all monthly obligations (including the new mortgage), you have a significant amount of income left over (typically at least 20% of your gross monthly income)."
  },
  { 
    id: "housingHistory", 
    label: "Excellent housing payment history",
    description: "You have a perfect 12-24 month history of on-time rent or mortgage payments, ideally with payments similar to your proposed new payment."
  },
  { 
    id: "minimalDebt", 
    label: "Minimal increase in housing payment",
    description: "Your proposed new monthly housing payment is not significantly higher than your current rent or mortgage payment (typically less than 20% increase)."
  },
];

const debtCategories = [
  { id: "carLoan", label: "Car Loans" },
  { id: "studentLoan", label: "Student Loans" },
  { id: "creditCard", label: "Credit Cards" },
  { id: "personalLoan", label: "Personal Loans" },
  { id: "otherDebt", label: "Other Debt" }
];

const FinancialStep: React.FC = () => {
  const { userData, updateFinancials, setCurrentStep, updateLoanDetails } = useMortgage();
  const { fetchExternalData } = useLoanData();
  
  const [formData, setFormData] = useState({
    annualIncome: userData.financials.annualIncome || 0,
    monthlyDebts: userData.financials.monthlyDebts || 0,
    debtItems: userData.financials.debtItems || {
      carLoan: 0,
      studentLoan: 0,
      creditCard: 0,
      personalLoan: 0,
      otherDebt: 0
    },
    ficoScore: userData.financials.ficoScore || 680,
    mitigatingFactors: userData.financials.mitigatingFactors || [],
  });
  
  const [isDebtsOpen, setIsDebtsOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetchingRates, setIsFetchingRates] = useState(false);

  const calculateTotalMonthlyDebt = () => {
    return Object.values(formData.debtItems).reduce((sum, value) => sum + (Number(value) || 0), 0);
  };

  const handleDebtItemChange = (id: string, value: number) => {
    setFormData(prev => {
      const updatedDebtItems = {
        ...prev.debtItems,
        [id]: value
      };
      
      return {
        ...prev,
        debtItems: updatedDebtItems,
        monthlyDebts: Object.values(updatedDebtItems).reduce((sum, val) => sum + (Number(val) || 0), 0)
      };
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.annualIncome <= 0) {
      newErrors.annualIncome = "Annual income must be greater than 0";
    }
    
    if (formData.ficoScore < 300 || formData.ficoScore > 850) {
      newErrors.ficoScore = "FICO score must be between 300 and 850";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Update financials in context
      updateFinancials({
        annualIncome: formData.annualIncome,
        monthlyDebts: formData.monthlyDebts,
        debtItems: formData.debtItems,
        ficoScore: formData.ficoScore,
        downPaymentPercent: 20, // Default value, will be modified in loan details
        downPayment: 0, // This will be calculated based on home price
        mitigatingFactors: formData.mitigatingFactors,
      });
      
      // Fetch interest rate and insurance data before proceeding
      setIsFetchingRates(true);
      toast.info("Fetching current interest rates and insurance data...");
      
      try {
        const fetchedData = await fetchExternalData();
        if (fetchedData) {
          updateLoanDetails(fetchedData);
          toast.success("Financial information saved!");
          setCurrentStep(2);
        } else {
          toast.error("Could not retrieve rate data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("There was a problem fetching rate data. Continuing without it.");
        setCurrentStep(2);
      } finally {
        setIsFetchingRates(false);
      }
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
            <Label>Monthly Debt Payments: {formatCurrency(formData.monthlyDebts)}</Label>
            <Collapsible
              open={isDebtsOpen}
              onOpenChange={setIsDebtsOpen}
              className="border rounded-md"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-secondary">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span>Itemize your monthly debts</span>
                </div>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${isDebtsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 space-y-3">
                {debtCategories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <Label htmlFor={category.id}>{category.label}</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id={category.id}
                        type="number"
                        placeholder="0"
                        className="pl-10"
                        value={(formData.debtItems as any)[category.id] || 0}
                        onChange={(e) => handleDebtItemChange(category.id, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center font-medium pt-2 border-t">
                  <span>Total Monthly Debt:</span>
                  <span>{formatCurrency(calculateTotalMonthlyDebt())}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
            <p className="text-sm text-muted-foreground">
              Include all recurring monthly debt obligations.
            </p>
          </div>
          
          {/* Removed down payment percentage from this step */}
          
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
          
          <TooltipProvider>
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Mitigating Factors (if any)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    These factors can help you qualify for a higher debt-to-income ratio, potentially increasing your borrowing power.
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="space-y-2">
                {mitigatingFactorsOptions.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Checkbox
                      id={option.id}
                      checked={formData.mitigatingFactors.includes(option.id)}
                      onCheckedChange={() => handleMitigatingFactorChange(option.id)}
                    />
                    <div className="flex items-center">
                      <Label
                        htmlFor={option.id}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          {option.description}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                These factors may help you qualify for a higher loan amount.
              </p>
            </div>
          </TooltipProvider>
          
          {/* Add the buying power visualization */}
          <div className="mt-6">
            <BuyingPowerChart 
              annualIncome={formData.annualIncome}
              ficoScore={formData.ficoScore}
              debtItems={formData.debtItems}
              mitigatingFactors={formData.mitigatingFactors}
            />
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
          <Button type="submit" disabled={isFetchingRates}>
            {isFetchingRates ? "Fetching Rates..." : "Continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FinancialStep;
