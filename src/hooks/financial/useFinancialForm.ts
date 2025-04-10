
import { useState } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { useDataFetching } from "@/hooks/data/useDataFetching";
import { useAnalytics, AnalyticsEvents } from "@/hooks/useAnalytics";
import { toast } from "sonner";

// Define types for the form data
export interface FinancialFormData {
  annualIncome: number;
  monthlyDebts: number;
  debtItems: {
    carLoan: number;
    studentLoan: number;
    creditCard: number;
    personalLoan: number;
    otherDebt: number;
  };
  ficoScore: number;
  mitigatingFactors: string[];
  selectedFactors: Record<string, string>;
}

export const useFinancialForm = () => {
  const { userData, updateFinancials, setCurrentStep, updateLoanDetails } = useMortgage();
  const { fetchExternalData, fetchProgress } = useDataFetching();
  const { trackEvent } = useAnalytics();
  
  // Form state
  const [formData, setFormData] = useState<FinancialFormData>({
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
    selectedFactors: userData.financials.selectedFactors || {}
  });
  
  // Form validation and submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Handlers for form field changes
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
      
      // Track the factor selection/deselection event
      trackEvent(
        newFactors.includes(id) ? AnalyticsEvents.FACTOR_SELECTED : AnalyticsEvents.FACTOR_DESELECTED,
        { 
          factorId: id,
          factorValue: newFactors.includes(id) ? 'enabled' : 'disabled',
        }
      );
      
      return {
        ...prev,
        mitigatingFactors: newFactors
      };
    });
  };

  // New handler for dropdown-based factor selection
  const handleFactorOptionChange = (id: string, value: string) => {
    setFormData(prev => {
      const updatedFactors = { ...prev.selectedFactors, [id]: value };
      
      // Track the factor option selection event
      trackEvent(AnalyticsEvents.FACTOR_OPTION_SELECTED, {
        factorId: id,
        optionValue: value
      });
      
      return {
        ...prev,
        selectedFactors: updatedFactors
      };
    });
  };

  // Form validation
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateFinancials({
        annualIncome: formData.annualIncome,
        monthlyDebts: formData.monthlyDebts,
        debtItems: formData.debtItems,
        ficoScore: formData.ficoScore,
        downPaymentPercent: 20,
        downPayment: 0,
        mitigatingFactors: formData.mitigatingFactors,
        selectedFactors: formData.selectedFactors,
      });
      
      setIsSubmitting(true);
      
      if (!fetchProgress.hasAttemptedFetch && !hasFetchedData) {
        try {
          const fetchedData = await fetchExternalData(false);
          if (fetchedData) {
            updateLoanDetails(fetchedData);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("There was a problem fetching rate data. Continuing without it.");
          
          trackEvent(AnalyticsEvents.FORM_ERROR, {
            step: 'financial',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      } else {
        toast.success("Financial information saved!");
      }
      
      trackEvent(AnalyticsEvents.FINANCIAL_STEP_SUBMITTED, {
        annualIncome: formData.annualIncome,
        monthlyDebts: formData.monthlyDebts,
        ficoScore: formData.ficoScore,
        selectedFactors: formData.selectedFactors,
        mitigatingFactorsCount: formData.mitigatingFactors.length,
      });
      
      setIsSubmitting(false);
      setCurrentStep(2);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleIncomeChange,
    handleDebtItemChange,
    handleFicoScoreChange,
    handleMitigatingFactorChange,
    handleFactorOptionChange,
    handleSubmit,
    validateForm
  };
};
