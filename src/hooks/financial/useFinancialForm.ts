
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
  selectedFactors: Record<string, string>;
}

export const useFinancialForm = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
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
    selectedFactors: userData.financials.selectedFactors || {}
  });
  
  // Form validation and submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      });
      
      setIsSubmitting(true);
      
      try {
        trackEvent(AnalyticsEvents.FINANCIAL_STEP_SUBMITTED, {
          annualIncome: formData.annualIncome,
          monthlyDebts: formData.monthlyDebts,
          ficoScore: formData.ficoScore,
        });
        
        toast.success("Financial information saved!");
        setCurrentStep(2); // Move to compensating factors step
      } catch (error) {
        console.error("Error saving financial details:", error);
        toast.error("There was a problem saving your information.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleIncomeChange,
    handleDebtItemChange,
    handleFicoScoreChange,
    handleSubmit,
    validateForm
  };
};
