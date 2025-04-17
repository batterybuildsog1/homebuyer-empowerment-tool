
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnnualIncomeInput from "./AnnualIncomeInput";
import DebtItemsSection from "./DebtItemsSection";
import FicoScoreSlider from "./FicoScoreSlider";
import BorrowingPowerChart from "./BorrowingPowerChart";
import { useFinancialForm } from "@/hooks/financial/useFinancialForm";
import { useMortgage } from "@/context/MortgageContext";

const FinancialStepForm = () => {
  const { userData } = useMortgage();
  const { 
    formData,
    errors,
    isSubmitting,
    handleIncomeChange,
    handleDebtItemChange,
    handleFicoScoreChange,
    handleSubmit,
    convertDebtItemsToLegacy
  } = useFinancialForm();

  // Calculate monthly income for DTI calculations
  const monthlyIncome = formData.annualIncome > 0 ? formData.annualIncome / 12 : 0;
  
  // Convert DebtItem[] to DebtItems format for the DebtItemsSection component
  const debtItemsLegacy = convertDebtItemsToLegacy(formData.debtItems);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AnnualIncomeInput 
            annualIncome={formData.annualIncome} 
            onIncomeChange={handleIncomeChange}
            error={errors.annualIncome}
          />
          
          <DebtItemsSection 
            debtItems={debtItemsLegacy}
            onDebtItemChange={handleDebtItemChange}
            monthlyIncome={monthlyIncome} // Pass monthly income for DTI calculation
          />
          
          <FicoScoreSlider
            ficoScore={formData.ficoScore}
            onScoreChange={handleFicoScoreChange}
            error={errors.ficoScore}
          />
        </div>
        
        <div className="space-y-6">
          <BorrowingPowerChart 
            annualIncome={formData.annualIncome}
            ficoScore={formData.ficoScore}
            debtItems={formData.debtItems}
            selectedFactors={userData.financials.selectedFactors || {}}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {}/* Will be handled by setCurrentStep(0) */}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-1">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default FinancialStepForm;
