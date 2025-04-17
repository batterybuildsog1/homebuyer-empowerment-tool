
import { useState, useCallback, FormEvent } from 'react';
import { DebtItem, DebtItems } from '@/context/mortgage/types';
import { useMortgage } from '@/context/MortgageContext';
import { toast } from 'sonner';

export interface FinancialFormData {
  annualIncome: number;
  debtItems: DebtItem[];
  ficoScore: number;
}

export interface FinancialFormErrors {
  annualIncome?: string;
  ficoScore?: string;
}

export const useFinancialFormState = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
  
  const [formData, setFormData] = useState<FinancialFormData>({
    annualIncome: userData.financials.annualIncome || 0,
    debtItems: userData.financials.debtItems || [],
    ficoScore: userData.financials.ficoScore || 680
  });
  
  const [errors, setErrors] = useState<FinancialFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIncomeChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, annualIncome: value }));
  }, []);

  const handleFicoScoreChange = useCallback((value: number) => {
    setFormData(prev => ({
      ...prev,
      ficoScore: value
    }));
    console.log("FICO score changed:", value);
  }, []);

  const handleDebtItemsChange = useCallback((items: DebtItem[]) => {
    setFormData(prev => ({ ...prev, debtItems: items }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FinancialFormErrors = {};
    
    if (!formData.annualIncome || formData.annualIncome <= 0) {
      newErrors.annualIncome = 'Annual income is required';
    }
    
    if (!formData.ficoScore || formData.ficoScore < 300 || formData.ficoScore > 850) {
      newErrors.ficoScore = 'FICO score must be between 300 and 850';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const totalMonthlyDebts = formData.debtItems.reduce(
        (sum, item) => sum + item.monthlyPayment, 
        0
      );
      
      updateFinancials({
        annualIncome: formData.annualIncome,
        ficoScore: formData.ficoScore,
        debtItems: formData.debtItems,
        monthlyDebts: totalMonthlyDebts
      });
      
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving financial data:", error);
      toast.error("There was a problem saving your information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleIncomeChange,
    handleFicoScoreChange,
    handleDebtItemsChange,
    handleSubmit
  };
};
