
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { DollarSign, ArrowLeft } from "lucide-react";
import { useLoanData } from "@/hooks/useLoanData";
import BuyingPowerChart from "./financial/BuyingPowerChart";
import AnnualIncomeInput from "./financial/AnnualIncomeInput";
import DebtItemsSection from "./financial/DebtItemsSection";
import FicoScoreSlider from "./financial/FicoScoreSlider";
import MitigatingFactorsSection from "./financial/MitigatingFactorsSection";

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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetchingRates, setIsFetchingRates] = useState(false);

  const handleIncomeChange = (value: number) => {
    setFormData(prev => ({ ...prev, annualIncome: value }));
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

  const handleFicoScoreChange = (value: number) => {
    setFormData(prev => ({ ...prev, ficoScore: value }));
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
          <AnnualIncomeInput 
            annualIncome={formData.annualIncome} 
            onIncomeChange={handleIncomeChange}
            error={errors.annualIncome}
          />
          
          <DebtItemsSection 
            debtItems={formData.debtItems}
            onDebtItemChange={handleDebtItemChange}
          />
          
          <FicoScoreSlider
            ficoScore={formData.ficoScore}
            onScoreChange={handleFicoScoreChange}
            error={errors.ficoScore}
          />
          
          <MitigatingFactorsSection
            selectedFactors={formData.mitigatingFactors}
            onFactorChange={handleMitigatingFactorChange}
          />
          
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
