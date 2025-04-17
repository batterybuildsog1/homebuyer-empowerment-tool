
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CompensatingFactorsSection from "../financial/CompensatingFactorsSection";
import BorrowingPowerChart from "../financial/BorrowingPowerChart";
import { useCompensatingFactorsForm } from "@/hooks/financial/useCompensatingFactorsForm";
import { useMortgage } from "@/context/MortgageContext";
import { useEffect, useState } from "react";
import { useFinancialForm } from "@/hooks/financial/useFinancialForm";

const CompensatingFactorsForm = () => {
  const { setCurrentStep, userData } = useMortgage();
  const { 
    formData,
    isSubmitting,
    handleFactorOptionChange,
    handleCurrentHousingPaymentChange,
    handleSubmit
  } = useCompensatingFactorsForm();
  
  // Get the conversion utility from useFinancialForm
  const { convertDebtItemsToLegacy } = useFinancialForm();
  
  // Used to force re-render of BorrowingPowerChart when factors change
  const [factorUpdateKey, setFactorUpdateKey] = useState(0);
  
  // Update the key when factors change to force re-render of BorrowingPowerChart
  useEffect(() => {
    console.log("Factors changed, updating chart");
    setFactorUpdateKey(prev => prev + 1);
  }, [formData.selectedFactors]);

  // Convert DebtItem[] to DebtItems format for the BorrowingPowerChart component
  const debtItemsLegacy = convertDebtItemsToLegacy ? convertDebtItemsToLegacy(userData.financials.debtItems) : {};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CompensatingFactorsSection
            selectedFactors={formData.selectedFactors}
            onFactorChange={handleFactorOptionChange}
            currentHousingPayment={formData.currentHousingPayment}
            onCurrentHousingPaymentChange={handleCurrentHousingPaymentChange}
          />
        </div>
        
        <div className="max-h-[600px] overflow-auto">
          <BorrowingPowerChart 
            key={factorUpdateKey}
            annualIncome={userData.financials.annualIncome}
            ficoScore={userData.financials.ficoScore}
            debtItems={debtItemsLegacy}
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
