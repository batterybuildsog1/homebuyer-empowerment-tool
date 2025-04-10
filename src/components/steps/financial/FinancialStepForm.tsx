
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AnnualIncomeInput from "./AnnualIncomeInput";
import DebtItemsSection from "./DebtItemsSection";
import FicoScoreSlider from "./FicoScoreSlider";
import MitigatingFactorsSection from "./MitigatingFactorsSection";
import BuyingPowerChart from "./BuyingPowerChart";
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
    handleMitigatingFactorChange,
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
