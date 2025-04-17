import { useState, useCallback } from 'react';
import { DebtItem, DebtItems, SelectedFactors } from '@/context/mortgage/types';

export const useFinancialForm = () => {
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

  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(0);
  const [ficoScore, setFicoScore] = useState<number>(680);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<SelectedFactors>({
    cashReserves: "none",
    residualIncome: "does not meet",
    housingPaymentIncrease: ">20%",
    employmentHistory: "<2 years",
    creditUtilization: ">30%",
    downPayment: "<5%",
  });
  const [currentHousingPayment, setCurrentHousingPayment] = useState<number>(0);

  const handleAnnualIncomeChange = useCallback((value: number) => {
    setAnnualIncome(value);
  }, []);

  const handleMonthlyDebtsChange = useCallback((value: number) => {
    setMonthlyDebts(value);
  }, []);

  const handleFicoScoreChange = useCallback((value: number) => {
    setFicoScore(value);
  }, []);

  const handleDownPaymentChange = useCallback((value: number) => {
    setDownPayment(value);
  }, []);

  const handleDownPaymentPercentChange = useCallback((value: number) => {
    setDownPaymentPercent(value);
  }, []);

  const handleDebtItemsChange = useCallback((items: DebtItem[]) => {
    setDebtItems(items);
  }, []);

  const handleSelectedFactorsChange = useCallback((factors: SelectedFactors) => {
    setSelectedFactors(factors);
  }, []);

  const handleCurrentHousingPaymentChange = useCallback((value: number) => {
    setCurrentHousingPayment(value);
  }, []);

  return {
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
  };
};
