
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MitigatingFactorsSection from "../financial/MitigatingFactorsSection";
import BorrowingPowerChart from "../financial/BorrowingPowerChart";
import { useCompensatingFactorsForm } from "@/hooks/financial/useCompensatingFactorsForm";
import { useMortgage } from "@/context/MortgageContext";

const CompensatingFactorsForm = () => {
  const { setCurrentStep } = useMortgage();
  const { 
    formData,
    isSubmitting,
    handleFactorOptionChange,
    handleSubmit,
    userData
  } = useCompensatingFactorsForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <MitigatingFactorsSection
            selectedFactors={formData.selectedFactors}
            onFactorChange={handleFactorOptionChange}
          />
        </div>
        
        <div>
          <BorrowingPowerChart 
            annualIncome={userData.financials.annualIncome}
            ficoScore={userData.financials.ficoScore}
            debtItems={userData.financials.debtItems}
            selectedFactors={formData.selectedFactors}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
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

export default CompensatingFactorsForm;
