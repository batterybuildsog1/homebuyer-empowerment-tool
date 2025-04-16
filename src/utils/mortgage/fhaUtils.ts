
import { INSURANCE_STANDARDS } from "../constants/mortgageConstants";
import { calculateFhaMipRates } from "./insuranceCalculator";

/**
 * Gets the FHA MIP rates based on loan amount, LTV, and term
 * This function is maintained for backward compatibility
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
  return calculateFhaMipRates(loanAmount, ltv, termYears);
};
