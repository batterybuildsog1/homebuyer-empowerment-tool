
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMortgage } from "@/context/MortgageContext";
import { useDataFetching } from "@/hooks/data/useDataFetching";
import AnnualIncomeInput from "./AnnualIncomeInput";
import DebtItemsSection from "./DebtItemsSection";
import FicoScoreSlider from "./FicoScoreSlider";
import MitigatingFactorsSection from "./MitigatingFactorsSection";
import BuyingPowerChart from "./BuyingPowerChart";

const FinancialStepForm = () => {
  const { userData, updateFinancials, setCurrentStep, updateLoanDetails } = useMortgage();
  const { fetchExternalData, fetchProgress } = useDataFetching();
  
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
    // Initialize with existing selectedFactors or defaults
    selectedFactors: userData.financials.selectedFactors || {
      cashReserves: "none",
      residualIncome: "none",
      housingPaymentIncrease: "none",
      employmentHistory: "none",
      creditUtilization: "none",
      downPayment: "none",
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);

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
      // Update legacy mitigatingFactors array for backward compatibility
      const newFactors = prev.mitigatingFactors.includes(id)
        ? prev.mitigatingFactors.filter(factor => factor !== id)
        : [...prev.mitigatingFactors, id];
      
      // Update the selectedFactors with appropriate values based on the factor
      const updatedSelectedFactors = { ...prev.selectedFactors };
      
      // Map the factor ID to the appropriate selectedFactors key and value
      if (id === 'reserves') {
        updatedSelectedFactors.cashReserves = newFactors.includes(id) ? '3-6 months' : 'none';
      } else if (id === 'residualIncome') {
        updatedSelectedFactors.residualIncome = newFactors.includes(id) ? '20-30%' : 'none'; 
      } else if (id === 'minimalDebt') {
        updatedSelectedFactors.housingPaymentIncrease = newFactors.includes(id) ? '<10%' : 'none';
      }
      
      return {
        ...prev,
        mitigatingFactors: newFactors,
        selectedFactors: updatedSelectedFactors
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
      // Update financials in context with both legacy and new format data
      updateFinancials({
        annualIncome: formData.annualIncome,
        monthlyDebts: formData.monthlyDebts,
        debtItems: formData.debtItems,
        ficoScore: formData.ficoScore,
        downPaymentPercent: 20, // Default value, will be modified in loan details
        downPayment: 0, // This will be calculated based on home price
        mitigatingFactors: formData.mitigatingFactors, // Keep legacy format for compatibility
        selectedFactors: formData.selectedFactors, // Add new format
      });
      
      setIsSubmitting(true);
      
      // Only fetch data if we haven't already tried or if the background fetch didn't succeed
      if (!fetchProgress.hasAttemptedFetch && !hasFetchedData) {
        try {
          const fetchedData = await fetchExternalData(false); // Regular fetch with UI feedback
          if (fetchedData) {
            updateLoanDetails(fetchedData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("There was a problem fetching rate data. Continuing without it.");
        }
      } else {
        // Data has already been fetched or attempted in the background
        toast.success("Financial information saved!");
      }
      
      setIsSubmitting(false);
      setCurrentStep(2);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
      
      <div className="mt-6">
        <BuyingPowerChart 
          annualIncome={formData.annualIncome}
          ficoScore={formData.ficoScore}
          debtItems={formData.debtItems}
          mitigatingFactors={formData.mitigatingFactors}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(0)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Continue"}
        </Button>
      </div>
    </form>
  );
};

export default FinancialStepForm;
