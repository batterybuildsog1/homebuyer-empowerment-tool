import { useState } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { getCreditHistoryOption, getNonHousingDTIOption } from "@/utils/mortgageCalculations";

// Define types for the form data
export interface CompensatingFactorsFormData {
  selectedFactors: Record<string, string>;
  currentHousingPayment: number;
}

export const useCompensatingFactorsForm = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
  const { trackEvent } = useAnalytics();
  
  // Form state
  const [formData, setFormData] = useState<CompensatingFactorsFormData>({
    selectedFactors: userData.financials.selectedFactors || {},
    currentHousingPayment: userData.financials.currentHousingPayment || 0
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for factor option changes
  const handleFactorOptionChange = (id: string, value: string) => {
    setFormData(prev => {
      const updatedFactors = { ...prev.selectedFactors, [id]: value };
      
      // Track the factor option selection event
      trackEvent(AnalyticsEvents.FACTOR_SELECTED, {
        factorId: id,
        optionValue: value
      });
      
      return {
        ...prev,
        selectedFactors: updatedFactors
      };
    });
  };
  
  // Handler for current housing payment change
  const handleCurrentHousingPaymentChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      currentHousingPayment: value
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate credit history based on FICO score
    const ficoScore = userData.financials.ficoScore;
    const creditHistoryOption = getCreditHistoryOption(ficoScore);
    
    // Calculate non-housing DTI based on debts and income
    const monthlyDebts = userData.financials.monthlyDebts;
    const monthlyIncome = userData.financials.annualIncome / 12;
    const nonHousingDTIOption = getNonHousingDTIOption(monthlyDebts, monthlyIncome);
    
    // Combine all factors
    const updatedFactors = {
      ...formData.selectedFactors,
      creditHistory: creditHistoryOption,
      nonHousingDTI: nonHousingDTIOption
    };
    
    // Update financials in context
    updateFinancials({
      selectedFactors: updatedFactors,
      currentHousingPayment: formData.currentHousingPayment
    });
    
    setIsSubmitting(true);
    
    try {
      trackEvent(AnalyticsEvents.FINANCIAL_STEP_SUBMITTED, {
        selectedFactorsCount: Object.keys(updatedFactors).filter(key => 
          updatedFactors[key] !== 'none' &&
          updatedFactors[key] !== 'does not meet' &&
          updatedFactors[key] !== '>20%' &&
          updatedFactors[key] !== '<2 years' &&
          updatedFactors[key] !== '>30%' &&
          updatedFactors[key] !== '<5%'
        ).length
      });
      
      toast.success("Compensating factors saved!");
      setCurrentStep(3);
    } catch (error) {
      console.error("Error saving compensating factors:", error);
      toast.error("There was a problem saving your information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleFactorOptionChange,
    handleCurrentHousingPaymentChange,
    handleSubmit,
    userData
  };
};
