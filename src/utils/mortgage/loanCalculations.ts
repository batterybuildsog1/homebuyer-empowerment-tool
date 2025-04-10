
import { calculateMaxDTI } from './dtiCalculations';

/**
 * Calculates the monthly mortgage payment
 * @param loanAmount Principal loan amount
 * @param interestRate Annual interest rate (percentage)
 * @param termYears Loan term in years
 * @param propertyTax Annual property tax
 * @param propertyInsurance Annual property insurance
 * @param pmi Private mortgage insurance rate (percentage)
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (
  loanAmount: number,
  interestRate: number,
  termYears: number = 30,
  propertyTax: number = 0,
  propertyInsurance: number = 0,
  pmi: number = 0
): number => {
  // Convert annual interest rate to monthly and decimal
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  // Calculate principal and interest payment
  let monthlyPrincipalAndInterest = 0;
  if (monthlyRate === 0) {
    // Edge case: 0% interest rate
    monthlyPrincipalAndInterest = loanAmount / totalPayments;
  } else {
    // Standard formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
    monthlyPrincipalAndInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }
  
  // Monthly components
  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = propertyInsurance / 12;
  const monthlyPMI = (pmi / 100) * loanAmount / 12;
  
  // Total monthly payment
  const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI;
  
  return Math.round(totalMonthlyPayment);
};

/**
 * Calculates the maximum purchase price based on income and debt
 * @param annualIncome Annual income
 * @param monthlyDebts Total monthly debt payments
 * @param dti Debt-to-income ratio (percentage)
 * @param interestRate Annual interest rate (percentage)
 * @param propertyTaxRate Annual property tax rate (percentage)
 * @param annualInsurance Annual insurance amount
 * @param downPaymentPercent Down payment percentage
 * @param pmiRate PMI rate (percentage)
 * @param termYears Loan term in years
 * @returns Maximum home purchase price
 */
export const calculateMaxPurchasePrice = (
  annualIncome: number,
  monthlyDebts: number,
  dti: number,
  interestRate: number,
  propertyTaxRate: number,
  annualInsurance: number,
  downPaymentPercent: number,
  pmiRate: number = 0,
  termYears: number = 30
): number => {
  // Maximum monthly housing payment
  const maxMonthlyPayment = (annualIncome / 12) * (dti / 100) - monthlyDebts;
  
  // Monthly fixed costs (taxes and insurance) as percentage of home price
  const monthlyPropertyTaxRate = (propertyTaxRate / 100) / 12;
  const monthlyInsuranceRate = annualInsurance / 12;
  
  // Monthly PMI as percentage of loan amount (which is a percentage of home price)
  const loanToValueRatio = 1 - (downPaymentPercent / 100);
  const effectivePmiRate = (pmiRate / 100) * loanToValueRatio / 12;
  
  // Convert annual interest rate to monthly and decimal
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  // Home price multiplier for PI payment
  let piMultiplier;
  if (monthlyRate === 0) {
    piMultiplier = 1 / (totalPayments * loanToValueRatio);
  } else {
    piMultiplier = (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                 ((Math.pow(1 + monthlyRate, totalPayments) - 1) * loanToValueRatio);
  }
  
  // Total home price to payment ratio
  const totalMultiplier = piMultiplier + monthlyPropertyTaxRate + effectivePmiRate;
  
  // Maximum home price
  const maxHomePrice = (maxMonthlyPayment - monthlyInsuranceRate) / totalMultiplier;
  
  return Math.floor(maxHomePrice);
};

/**
 * Calculates the maximum loan amount based on income and debt
 * @param annualIncome Annual income
 * @param monthlyDebts Total monthly debt payments
 * @param dti Debt-to-income ratio (percentage)
 * @param interestRate Annual interest rate (percentage)
 * @param loanType Type of loan
 * @param termYears Loan term in years
 * @returns Maximum loan amount
 */
export const calculateMaxLoanAmount = (
  annualIncome: number,
  monthlyDebts: number,
  dti: number,
  interestRate: number,
  loanType: 'conventional' | 'fha' = 'conventional',
  termYears: number = 30
): number => {
  // Monthly income
  const monthlyIncome = annualIncome / 12;
  
  // Maximum monthly payment based on DTI
  const maxMonthlyPayment = (monthlyIncome * (dti / 100)) - monthlyDebts;
  
  if (maxMonthlyPayment <= 0) return 0;
  
  // Convert annual interest rate to monthly and decimal
  const monthlyRate = interestRate / 100 / 12;
  const termMonths = termYears * 12;
  
  // Use the formula: P = PMT * [(1 - (1 + r)^-n) / r]
  // Where P is principal (loan amount), PMT is monthly payment, r is monthly rate, n is term in months
  let loanAmount;
  if (monthlyRate === 0) {
    loanAmount = maxMonthlyPayment * termMonths;
  } else {
    loanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate);
  }
  
  return Math.floor(loanAmount);
};
