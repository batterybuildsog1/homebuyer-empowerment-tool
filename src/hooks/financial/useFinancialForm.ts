import { useState, useCallback, FormEvent } from 'react';
import { DebtItem, DebtItems, SelectedFactors } from '@/context/mortgage/types';
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

export const useFinancialForm = () => {
  const { userData, updateFinancials, setCurrentStep } = useMortgage();
  
  // Convert debt items between formats
  const convertDebtItemsToLegacy = (items: DebtItem[]): DebtItems => {
    const legacy: DebtItems = {
      carLoan: 0,
      studentLoan: 0,
      creditCard: 0,
      personalLoan: 0,
      otherDebt: 0
    };
    
    items.forEach(item => {
      if (item.description.toLowerCase().includes('car')) {
        legacy.carLoan += item.monthlyPayment;
      } else if (item.description.toLowerCase().includes('student')) {
        legacy.studentLoan += item.monthlyPayment;
      } else if (item.description.toLowerCase().includes('credit')) {
        legacy.creditCard += item.monthlyPayment;
      } else if (item.description.toLowerCase().includes('personal')) {
        legacy.personalLoan += item.monthlyPayment;
      } else {
        legacy.otherDebt += item.monthlyPayment;
      }
    });
    
    return legacy;
  };

  const convertLegacyToDebtItems = (legacy: DebtItems): DebtItem[] => {
    const items: DebtItem[] = [];
    
    if (legacy.carLoan > 0) {
      items.push({ description: 'Car Loan', monthlyPayment: legacy.carLoan });
    }
    if (legacy.studentLoan > 0) {
      items.push({ description: 'Student Loan', monthlyPayment: legacy.studentLoan });
    }
    if (legacy.creditCard > 0) {
      items.push({ description: 'Credit Card', monthlyPayment: legacy.creditCard });
    }
    if (legacy.personalLoan > 0) {
      items.push({ description: 'Personal Loan', monthlyPayment: legacy.personalLoan });
    }
    if (legacy.otherDebt > 0) {
      items.push({ description: 'Other Debt', monthlyPayment: legacy.otherDebt });
    }
    
    return items;
  };

  // Form state
  const [formData, setFormData] = useState<FinancialFormData>({
    annualIncome: userData.financials.annualIncome || 0,
    debtItems: userData.financials.debtItems || [],
    ficoScore: userData.financials.ficoScore || 680
  });
  
  const [errors, setErrors] = useState<FinancialFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleIncomeChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, annualIncome: value }));
  }, []);

  const handleDebtItemChange = useCallback((id: string, value: number) => {
    // Here we assume we're getting updates for the DebtItems format
    // We'll convert it to DebtItem[] format for internal state
    const currentLegacyItems = convertDebtItemsToLegacy(formData.debtItems);
    currentLegacyItems[id] = value;
    
    const updatedDebtItems = convertLegacyToDebtItems(currentLegacyItems);
    
    setFormData(prev => ({ 
      ...prev, 
      debtItems: updatedDebtItems 
    }));
  }, [formData.debtItems]);

  const originalHandleFicoScoreChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      ficoScore: value
    }));
  };

  const handleFicoScoreChange = (value: number) => {
    originalHandleFicoScoreChange(value);
    
    // Add your additional logic here if needed
    // For example:
    console.log("FICO score changed:", value);
  };

  // Form validation
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

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate total monthly debts
      const totalMonthlyDebts = formData.debtItems.reduce(
        (sum, item) => sum + item.monthlyPayment, 
        0
      );
      
      // Update financial data in context
      updateFinancials({
        annualIncome: formData.annualIncome,
        ficoScore: formData.ficoScore,
        debtItems: formData.debtItems,
        monthlyDebts: totalMonthlyDebts
      });
      
      // Navigate to next step
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving financial data:", error);
      toast.error("There was a problem saving your information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // For backward compatibility with existing code
  const annualIncome = formData.annualIncome;
  const monthlyDebts = formData.debtItems.reduce((sum, item) => sum + item.monthlyPayment, 0);
  const ficoScore = formData.ficoScore;
  const downPayment = userData.financials.downPayment || 0;
  const downPaymentPercent = userData.financials.downPaymentPercent || 20;
  const debtItems = formData.debtItems;
  const selectedFactors = userData.financials.selectedFactors || {
    cashReserves: "none",
    residualIncome: "does not meet",
    housingPaymentIncrease: ">20%",
    employmentHistory: "<2 years",
    creditUtilization: ">30%",
    downPayment: "<5%",
  };
  const currentHousingPayment = userData.financials.currentHousingPayment || 0;
  
  const handleAnnualIncomeChange = handleIncomeChange;
  const handleMonthlyDebtsChange = (value: number) => console.log("monthlyDebts change not implemented");
  const handleDownPaymentChange = (value: number) => console.log("downPayment change not implemented");
  const handleDownPaymentPercentChange = (value: number) => console.log("downPaymentPercent change not implemented");
  const handleDebtItemsChange = (items: DebtItem[]) => setFormData(prev => ({ ...prev, debtItems: items }));
  const handleSelectedFactorsChange = (factors: SelectedFactors) => console.log("selectedFactors change not implemented");
  const handleCurrentHousingPaymentChange = (value: number) => console.log("currentHousingPayment change not implemented");

  return {
    // For backward compatibility with existing code
    annualIncome,
    monthlyDebts,
    ficoScore,
    downPayment,
    downPaymentPercent,
    debtItems,
    selectedFactors,
    currentHousingPayment,
    handleAnnualIncomeChange,
    handleMonthlyDebtsChange,
    handleFicoScoreChange,
    handleDownPaymentChange,
    handleDownPaymentPercentChange,
    handleDebtItemsChange,
    handleSelectedFactorsChange,
    handleCurrentHousingPaymentChange,
    
    // New interface for FinancialStepForm
    formData,
    errors,
    isSubmitting,
    handleIncomeChange,
    handleDebtItemChange,
    handleFicoScoreChange,
    handleSubmit,
    
    // Utility functions for conversions
    convertDebtItemsToLegacy,
    convertLegacyToDebtItems
  };
};
