import { useState, useCallback, useEffect } from 'react';
import { useMortgage } from '@/context/MortgageContext';

// Define the type for form data
export interface LoanDetailsFormData {
  loanType: 'conventional' | 'fha';
  downPayment: number;
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP: number | null;
  ongoingMIP: number | null;
  dataSource?: string;
  dataTimestamp?: number;
}

/**
 * Hook to manage loan settings form data and related operations
 */
export const useLoanSettings = () => {
  const { userData, updateLoanDetails } = useMortgage();
  
  // Initialize form data with null values for rates and property data
  const [formData, setFormData] = useState<LoanDetailsFormData>({
    loanType: 'conventional',
    downPayment: 20,
    conventionalInterestRate: null,
    fhaInterestRate: null,
    propertyTax: null,
    propertyInsurance: null,
    upfrontMIP: null,
    ongoingMIP: null,
  });
  
  // Calculate loan-to-value (LTV) ratio
  const ltv = 100 - formData.downPayment;
  
  // Get current interest rate based on selected loan type
  const currentInterestRate = formData.loanType === 'conventional' 
    ? formData.conventionalInterestRate 
    : formData.fhaInterestRate;
  
  // Handle loan type change
  const handleLoanTypeChange = useCallback((loanType: 'conventional' | 'fha') => {
    console.info(`Changing loan type to ${loanType}`);
    
    setFormData(prev => ({
      ...prev,
      loanType,
      // For FHA loans, set minimum down payment of 3.5% if current is less
      downPayment: loanType === 'fha' && prev.downPayment < 3.5 ? 3.5 : prev.downPayment
    }));
    
    // Reset MIP rates when switching to conventional
    if (loanType === 'conventional') {
      console.info('Updated to Conventional, cleared MIP rates');
      updateLoanDetails({ 
        loanType, 
        upfrontMIP: null, 
        ongoingMIP: null 
      });
    } else {
      // Keep existing MIP rates when switching to FHA
      updateLoanDetails({ loanType });
    }
  }, [updateLoanDetails]);
  
  // Handle down payment change
  const handleDownPaymentChange = useCallback((downPayment: number) => {
    setFormData(prev => ({
      ...prev,
      downPayment
    }));
    
    updateLoanDetails({ 
      ltv: 100 - downPayment,
      downPayment
    });
  }, [updateLoanDetails]);
  
  // Sync form data with context when it changes
  useEffect(() => {
    // Only update if we have a loan type from context
    if (userData.loanDetails.loanType) {
      setFormData(prev => ({
        ...prev,
        loanType: userData.loanDetails.loanType as 'conventional' | 'fha',
        conventionalInterestRate: userData.loanDetails.conventionalInterestRate,
        fhaInterestRate: userData.loanDetails.fhaInterestRate,
        propertyTax: userData.loanDetails.propertyTax,
        propertyInsurance: userData.loanDetails.propertyInsurance,
        upfrontMIP: userData.loanDetails.upfrontMIP,
        ongoingMIP: userData.loanDetails.ongoingMIP,
        dataSource: userData.loanDetails.dataSource,
        dataTimestamp: userData.loanDetails.dataTimestamp
      }));
    }
  }, [
    userData.loanDetails.loanType,
    userData.loanDetails.conventionalInterestRate,
    userData.loanDetails.fhaInterestRate,
    userData.loanDetails.propertyTax,
    userData.loanDetails.propertyInsurance,
    userData.loanDetails.upfrontMIP,
    userData.loanDetails.ongoingMIP,
    userData.loanDetails.dataSource,
    userData.loanDetails.dataTimestamp
  ]);
  
  return {
    formData,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange
  };
};
