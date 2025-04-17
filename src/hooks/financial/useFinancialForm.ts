
import { useCallback } from 'react';
import { DebtItem, DebtItems, SelectedFactors } from '@/context/mortgage/types';
import { useMortgage } from '@/context/MortgageContext';
import { useFinancialFormState } from './useFinancialFormState';

export type { FinancialFormData, FinancialFormErrors } from './useFinancialFormState';

export const useFinancialForm = () => {
  const { userData } = useMortgage();
  const formState = useFinancialFormState();
  
  const convertDebtItemsToLegacy = (items: DebtItem[]): DebtItems => {
    // Ensure items is an array before processing
    const validItems = Array.isArray(items) ? items : [];
    
    const legacy: DebtItems = {
      carLoan: 0,
      studentLoan: 0,
      creditCard: 0,
      personalLoan: 0,
      otherDebt: 0
    };
    
    validItems.forEach(item => {
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

  const handleDebtItemChange = useCallback((id: string, value: number) => {
    // Ensure formState.formData.debtItems is an array before using it
    const safeDebtItems = Array.isArray(formState.formData.debtItems) 
      ? formState.formData.debtItems 
      : [];
    
    const currentLegacyItems = convertDebtItemsToLegacy(safeDebtItems);
    currentLegacyItems[id] = value;
    
    const updatedDebtItems = convertLegacyToDebtItems(currentLegacyItems);
    formState.handleDebtItemsChange(updatedDebtItems);
  }, [formState]);

  // Computed values for backward compatibility with proper type checking
  const annualIncome = formState.formData.annualIncome;
  
  // Ensure debtItems is an array before calling reduce
  const safeDebtItems = Array.isArray(formState.formData.debtItems) 
    ? formState.formData.debtItems 
    : [];
  
  const monthlyDebts = safeDebtItems.reduce(
    (sum, item) => sum + (item.monthlyPayment || 0), 
    0
  );
  
  const ficoScore = formState.formData.ficoScore;
  const downPayment = userData.financials.downPayment || 0;
  const downPaymentPercent = userData.financials.downPaymentPercent || 20;
  const debtItems = safeDebtItems;
  const selectedFactors = userData.financials.selectedFactors || {
    cashReserves: "none",
    residualIncome: "does not meet",
    housingPaymentIncrease: ">20%",
    employmentHistory: "<2 years",
    creditUtilization: ">30%",
    downPayment: "<5%",
  };
  const currentHousingPayment = userData.financials.currentHousingPayment || 0;

  // Legacy handlers (with console.log for unimplemented ones)
  const handleAnnualIncomeChange = formState.handleIncomeChange;
  const handleMonthlyDebtsChange = (value: number) => console.log("monthlyDebts change not implemented");
  const handleDownPaymentChange = (value: number) => console.log("downPayment change not implemented");
  const handleDownPaymentPercentChange = (value: number) => console.log("downPaymentPercent change not implemented");
  const handleSelectedFactorsChange = (factors: SelectedFactors) => console.log("selectedFactors change not implemented");
  const handleCurrentHousingPaymentChange = (value: number) => console.log("currentHousingPayment change not implemented");

  return {
    // Legacy interface
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
    handleFicoScoreChange: formState.handleFicoScoreChange,
    handleDownPaymentChange,
    handleDownPaymentPercentChange,
    handleDebtItemsChange: formState.handleDebtItemsChange,
    handleSelectedFactorsChange,
    handleCurrentHousingPaymentChange,

    // Modern form interface
    formData: formState.formData,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    handleIncomeChange: formState.handleIncomeChange,
    handleDebtItemChange,
    handleSubmit: formState.handleSubmit,
    
    // Utility functions
    convertDebtItemsToLegacy,
    convertLegacyToDebtItems
  };
};
