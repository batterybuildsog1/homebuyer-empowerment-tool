import { useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { calculateFhaMipRates } from "@/utils/mortgageCalculations";

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
  
  const ltv = 100 - formData.downPayment;

  const currentInterestRate = formData.loanType === 'conventional' 
    ? formData.conventionalInterestRate 
    : formData.fhaInterestRate;

  const handleLoanTypeChange = (loanType: 'conventional' | 'fha') => {
    let newDownPayment = formData.downPayment;
    
    if (loanType === 'conventional' && (formData.downPayment < 3 || formData.downPayment > 20)) {
      newDownPayment = 20;
    } else if (loanType === 'fha' && (formData.downPayment < 3.5 || formData.downPayment > 10)) {
      newDownPayment = 3.5;
    }
    
    if (loanType === 'fha') {
      const newLtv = 100 - newDownPayment;
      const { upfrontMipPercent, annualMipPercent } = calculateFhaMipRates(
        1000,
        newLtv
      );
      
      setFormData(prev => ({
        ...prev,
        loanType,
        downPayment: newDownPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
      
      updateLoanDetails({
        loanType,
        ltv: newLtv,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent
      });
    } else {
      setFormData(prev => ({
        ...prev,
        loanType,
        downPayment: newDownPayment,
        upfrontMIP: null,
        ongoingMIP: null,
      }));
      
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
    
    const newLtv = 100 - downPayment;
    
    updateLoanDetails({ ltv: newLtv });
    
    if (formData.loanType === 'fha') {
      const { upfrontMipPercent, annualMipPercent } = calculateFhaMipRates(1000, newLtv);
      
      setFormData(prev => ({
        ...prev,
        downPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
      
      updateLoanDetails({
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent
      });
    }
  };

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
