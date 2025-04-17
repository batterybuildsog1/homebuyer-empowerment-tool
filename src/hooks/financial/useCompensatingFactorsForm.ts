
import { useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { SelectedFactors } from "@/context/mortgage/types";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { 
  getCreditHistoryOption, 
  getNonHousingDTIOption,
  createEnhancedFactors
} from "@/utils/mortgageCalculations";

// Define types for the form data
export interface CompensatingFactorsFormData {
  selectedFactors: SelectedFactors;
  currentHousingPayment: number;
}

// Create a function to ensure we always have a complete SelectedFactors object
const createDefaultSelectedFactors = (): SelectedFactors => ({
  cashReserves: "none",
  residualIncome: "does not meet",
  housingPaymentIncrease: ">20%",
  employmentHistory: "<2 years",
  creditUtilization: ">30%",
  downPayment: "<5%"
});

export const useCompensatingFactorsForm = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
  const { trackEvent } = useAnalytics();
  
  // Form state with proper typing
  const [formData, setFormData] = useState<CompensatingFactorsFormData>({
    selectedFactors: userData.financials.selectedFactors || createDefaultSelectedFactors(),
    currentHousingPayment: userData.financials.currentHousingPayment || 0
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure we have the latest data from context
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      selectedFactors: userData.financials.selectedFactors || createDefaultSelectedFactors(),
      currentHousingPayment: userData.financials.currentHousingPayment || 0
    }));
  }, [userData.financials.selectedFactors, userData.financials.currentHousingPayment]);

  // Handler for factor option changes
  const handleFactorOptionChange = (id: string, value: string) => {
    console.log(`Changing factor ${id} to ${value}`);
    setFormData(prev => {
      // Create a copy of the previous selectedFactors
      const updatedFactors: SelectedFactors = { 
        ...prev.selectedFactors, 
        [id]: value 
      };
      
      // Track the factor option selection event
      trackEvent(AnalyticsEvents.FACTOR_SELECTED, {
        factorId: id,
        optionValue: value
      });
      
      // Apply the update immediately to context for real-time DTI adjustment
      const monthlyIncome = userData.financials.annualIncome / 12;
      const monthlyDebts = userData.financials.monthlyDebts;
      
      // Create enhanced factors with calculated values
      const enhancedFactors = createEnhancedFactors(
        updatedFactors,
        userData.financials.ficoScore,
        monthlyDebts,
        monthlyIncome
      );
      
      console.log("Updating context with new factors:", enhancedFactors);
      
      // Update the context with the new factors
      updateFinancials({
        selectedFactors: enhancedFactors,
        currentHousingPayment: prev.currentHousingPayment
      });
      
      return {
        ...prev,
        selectedFactors: updatedFactors
      };
    });
  };
  
  // Handler for current housing payment change
  const handleCurrentHousingPaymentChange = (value: number) => {
    setFormData(prev => {
      const updatedValue = {
        ...prev,
        currentHousingPayment: value
      };
      
      // Update context immediately for real-time adjustments
      updateFinancials({
        currentHousingPayment: value
      });
      
      return updatedValue;
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate monthly income and debts
    const monthlyIncome = userData.financials.annualIncome / 12;
    const monthlyDebts = userData.financials.monthlyDebts;
    
    // Create enhanced factors with calculated values
    const enhancedFactors = createEnhancedFactors(
      formData.selectedFactors,
      userData.financials.ficoScore,
      monthlyDebts,
      monthlyIncome
    );
    
    console.log("Submitting with enhanced factors:", enhancedFactors);
    
    // Update financials in context
    updateFinancials({
      selectedFactors: enhancedFactors,
      currentHousingPayment: formData.currentHousingPayment
    });
    
    setIsSubmitting(true);
    
    try {
      trackEvent(AnalyticsEvents.FINANCIAL_STEP_SUBMITTED, {
        selectedFactorsCount: Object.keys(enhancedFactors).filter(key => 
          enhancedFactors[key] !== 'none' &&
          enhancedFactors[key] !== 'does not meet' &&
          enhancedFactors[key] !== '>20%' &&
          enhancedFactors[key] !== '<2 years' &&
          enhancedFactors[key] !== '>30%' &&
          enhancedFactors[key] !== '<5%'
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
