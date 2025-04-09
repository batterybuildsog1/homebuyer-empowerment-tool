
import { useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { getFhaMipRates } from "@/utils/mortgageCalculations";

interface LoanSettingsState {
  loanType: 'conventional' | 'fha';
  downPayment: number;
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null; 
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP: number | null;
  ongoingMIP: number | null;
}

export const useLoanSettings = () => {
  const { userData, updateLoanDetails } = useMortgage();
  
  // Set appropriate initial values based on loan type
  const getInitialDownPayment = () => {
    if (userData.loanDetails.ltv) {
      return 100 - userData.loanDetails.ltv;
    }
    
    return userData.loanDetails.loanType === 'conventional' ? 20 : 3.5;
  };

  const [formData, setFormData] = useState<LoanSettingsState>({
    loanType: userData.loanDetails.loanType || 'conventional',
    downPayment: getInitialDownPayment(),
    conventionalInterestRate: userData.loanDetails.conventionalInterestRate || null,
    fhaInterestRate: userData.loanDetails.fhaInterestRate || null,
    propertyTax: userData.loanDetails.propertyTax || null,
    propertyInsurance: userData.loanDetails.propertyInsurance || null,
    upfrontMIP: userData.loanDetails.upfrontMIP || null,
    ongoingMIP: userData.loanDetails.ongoingMIP || null,
  });
  
  // Calculate LTV from down payment
  const ltv = 100 - formData.downPayment;

  // Get the current interest rate based on loan type
  const currentInterestRate = formData.loanType === 'conventional' 
    ? formData.conventionalInterestRate 
    : formData.fhaInterestRate;

  const handleLoanTypeChange = (loanType: 'conventional' | 'fha') => {
    // If switching loan types, set appropriate default down payment
    let newDownPayment = formData.downPayment;
    
    // If current down payment is outside the valid range for the new loan type,
    // set it to a default value for that loan type
    if (loanType === 'conventional' && (formData.downPayment < 3 || formData.downPayment > 20)) {
      newDownPayment = 20;
    } else if (loanType === 'fha' && (formData.downPayment < 3.5 || formData.downPayment > 10)) {
      newDownPayment = 3.5;
    }
    
    // Update MIP rates when loan type changes
    if (loanType === 'fha') {
      const newLtv = 100 - newDownPayment;
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(
        1000, // Placeholder loan amount
        newLtv
      );
      
      setFormData(prev => ({
        ...prev,
        loanType,
        downPayment: newDownPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
      
      // Also update context with new values
      updateLoanDetails({
        loanType,
        ltv: newLtv,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent
      });
    } else {
      // For conventional loans, clear MIP values
      setFormData(prev => ({
        ...prev,
        loanType,
        downPayment: newDownPayment,
        upfrontMIP: null,
        ongoingMIP: null,
      }));
      
      // Update context
      updateLoanDetails({
        loanType,
        ltv: 100 - newDownPayment,
        upfrontMIP: null,
        ongoingMIP: null
      });
    }
  };

  const handleDownPaymentChange = (downPayment: number) => {
    setFormData(prev => ({ ...prev, downPayment }));
    
    // Calculate new LTV
    const newLtv = 100 - downPayment;
    
    // Update context with new LTV
    updateLoanDetails({ ltv: newLtv });
    
    // If FHA loan, recalculate MIP rates based on new LTV
    if (formData.loanType === 'fha') {
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(1000, newLtv);
      
      setFormData(prev => ({
        ...prev,
        downPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
      
      // Update context with new MIP rates
      updateLoanDetails({
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent
      });
    }
  };

  // Update form data when context data changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      conventionalInterestRate: userData.loanDetails.conventionalInterestRate,
      fhaInterestRate: userData.loanDetails.fhaInterestRate,
      propertyTax: userData.loanDetails.propertyTax,
      propertyInsurance: userData.loanDetails.propertyInsurance,
      upfrontMIP: userData.loanDetails.upfrontMIP,
      ongoingMIP: userData.loanDetails.ongoingMIP,
    }));
  }, [
    userData.loanDetails.conventionalInterestRate,
    userData.loanDetails.fhaInterestRate,
    userData.loanDetails.propertyTax,
    userData.loanDetails.propertyInsurance,
    userData.loanDetails.upfrontMIP,
    userData.loanDetails.ongoingMIP
  ]);

  return {
    formData,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange
  };
};
