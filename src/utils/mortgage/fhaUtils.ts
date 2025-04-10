
// FHA MIP rates for different scenarios
const FHA_UPFRONT_MIP = 1.75; // 1.75% of loan amount
const FHA_ANNUAL_MIP: Record<string, number> = {
  "below15Years_below90LTV": 0.45, // 0.45% annual
  "below15Years_above90LTV": 0.70, // 0.70% annual
  "above15Years_below90LTV": 0.50, // 0.50% annual 
  "above15Years_above90LTV": 0.55, // 0.55% annual
};

/**
 * Gets the FHA MIP rates based on loan amount, LTV, and term
 * @param loanAmount Loan amount
 * @param ltv Loan-to-value ratio
 * @param termYears Loan term in years
 * @returns Object containing upfront and annual MIP rates
 */
export const getFhaMipRates = (
  loanAmount: number,
  ltv: number,
  termYears: number = 30
): { upfrontMipPercent: number; annualMipPercent: number } => {
  // Upfront MIP is always 1.75% for FHA loans
  const upfrontMipPercent = FHA_UPFRONT_MIP;
  
  // Annual MIP depends on loan term and LTV
  let annualMipPercent;
  if (termYears <= 15) {
    annualMipPercent = ltv <= 90 
      ? FHA_ANNUAL_MIP["below15Years_below90LTV"] 
      : FHA_ANNUAL_MIP["below15Years_above90LTV"];
  } else {
    annualMipPercent = ltv <= 90 
      ? FHA_ANNUAL_MIP["above15Years_below90LTV"] 
      : FHA_ANNUAL_MIP["above15Years_above90LTV"];
  }
  
  return { upfrontMipPercent, annualMipPercent };
};
