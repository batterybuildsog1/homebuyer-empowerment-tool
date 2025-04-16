
import { INSURANCE_STANDARDS } from "../constants/mortgageConstants";

/**
 * Calculate FHA MIP rates
 * @param loanAmount Loan amount
 * @param ltv Loan-to-value ratio
 * @param termYears Loan term in years
 * @returns Object with upfront and annual MIP rates
 */
export function calculateFhaMipRates(
  loanAmount: number,
  ltv: number,
  termYears: number = 30
): { upfrontMipPercent: number; annualMipPercent: number } {
  const { FHA } = INSURANCE_STANDARDS;
  const upfrontMipPercent = FHA.UPFRONT_MIP_PERCENT;
  
  // Determine annual MIP based on loan term and LTV
  let annualMipPercent;
  if (termYears <= 15) {
    annualMipPercent = ltv <= 90 
      ? FHA.ANNUAL_MIP.BELOW_15_YEARS_BELOW_90_LTV 
      : FHA.ANNUAL_MIP.BELOW_15_YEARS_ABOVE_90_LTV;
  } else {
    annualMipPercent = ltv <= 90 
      ? FHA.ANNUAL_MIP.ABOVE_15_YEARS_BELOW_90_LTV 
      : FHA.ANNUAL_MIP.ABOVE_15_YEARS_ABOVE_90_LTV;
  }
  
  return { upfrontMipPercent, annualMipPercent };
}

/**
 * Calculate monthly MIP/PMI amount
 * @param loanAmount Loan amount
 * @param ltv Loan-to-value ratio
 * @param loanType Loan type ('conventional' or 'fha')
 * @param ongoingMip Annual MIP percentage (for FHA loans)
 * @returns Monthly MIP/PMI amount
 */
export function calculateMonthlyMortgageInsurance(
  loanAmount: number,
  ltv: number, 
  loanType: 'conventional' | 'fha',
  ongoingMip?: number
): number {
  // No mortgage insurance needed if LTV is 80% or below for conventional loans
  if (loanType === 'conventional' && ltv <= INSURANCE_STANDARDS.CONVENTIONAL.PMI_REMOVAL_LTV) {
    return 0;
  }
  
  // For FHA loans, use the provided ongoing MIP rate
  if (loanType === 'fha' && ongoingMip) {
    return (ongoingMip / 100) * loanAmount / 12;
  }
  
  // For conventional loans with LTV > 80%, calculate PMI
  if (loanType === 'conventional' && ltv > INSURANCE_STANDARDS.CONVENTIONAL.PMI_REMOVAL_LTV) {
    // Simple PMI estimate based on LTV for conventional loans
    let pmiRate = ltv > 95 ? 1.1 : 
                  ltv > 90 ? 0.8 : 
                  ltv > 85 ? 0.5 : 0.3;
    return (pmiRate / 100) * loanAmount / 12;
  }
  
  return 0;
}
