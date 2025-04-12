
import { useState } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import { toast } from "sonner";

// Define types for the form data
export interface CompensatingFactorsFormData {
  selectedFactors: Record<string, string>;
}

export const useCompensatingFactorsForm = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
  const { trackEvent } = useAnalytics();
  
  // Form state
  const [formData, setFormData] = useState<CompensatingFactorsFormData>({
    selectedFactors: userData.financials.selectedFactors || {}
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    updateFinancials({
      selectedFactors: formData.selectedFactors,
    });
    
    setIsSubmitting(true);
    
    try {
      trackEvent(AnalyticsEvents.FINANCIAL_STEP_SUBMITTED, {
        selectedFactorsCount: Object.keys(formData.selectedFactors).filter(key => 
          formData.selectedFactors[key] !== 'none'
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
    handleSubmit,
    userData
  };
};
