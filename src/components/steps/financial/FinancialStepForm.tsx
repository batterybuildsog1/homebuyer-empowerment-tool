
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AnnualIncomeInput from "./AnnualIncomeInput";
import DebtItemsSection from "./DebtItemsSection";
import FicoScoreSlider from "./FicoScoreSlider";
import MitigatingFactorsSection from "./MitigatingFactorsSection";
import BorrowingPowerChart from "./BorrowingPowerChart";
import { useFinancialForm } from "@/hooks/financial/useFinancialForm";
import { useMortgage } from "@/context/MortgageContext";

const FinancialStepForm = () => {
  const { setCurrentStep } = useMortgage();
  const { 
    formData,
    errors,
    isSubmitting,
    handleIncomeChange,
    handleDebtItemChange,
    handleFicoScoreChange,
    handleFactorOptionChange,
    handleSubmit
  } = useFinancialForm();

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
        selectedFactors={formData.selectedFactors}
        onFactorChange={handleFactorOptionChange}
      />
      
      <div className="mt-6">
        <BorrowingPowerChart 
          annualIncome={formData.annualIncome}
          ficoScore={formData.ficoScore}
          debtItems={formData.debtItems}
          selectedFactors={formData.selectedFactors}
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
