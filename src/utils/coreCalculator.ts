
import { UserData } from "@/context/MortgageContext";
import { MortgageResults } from "./mortgageResultsCalculator";
import { 
  calculateMaxDTI, 
  compensatingFactors 
} from "./mortgage/dtiCalculations";
import {
  calculateMaxPurchasePrice,
  calculateMonthlyPayment
} from "./mortgage/loanCalculations";
import { calculateAdjustedRate } from "./mortgage/rateAdjustments";
import { calculateAlternativeScenarios } from "./scenarioCalculator";

/**
 * Calculates mortgage results based on user data
 * @param userData User data from context
 * @returns Calculated mortgage results
 */
export const calculateMortgageResults = (userData: UserData): MortgageResults | null => {
  console.log("Calculating mortgage results with data:", userData);
  
  const { financials, loanDetails } = userData;
  
  // Create safe selectedFactors with defaults to prevent errors
  // First check if we have new selectedFactors, otherwise use empty object
  const userSelectedFactors = financials.selectedFactors || {};
  
  // Create a safe version with defaults for any missing factors
  const safeSelectedFactors = Object.keys(compensatingFactors).reduce((acc, factor) => {
    acc[factor] = userSelectedFactors[factor] || "none";
    return acc;
  }, {} as Record<string, string>);
  
  // Calculate the max DTI based on FICO score, LTV, and selected factors
  // Support both new selectedFactors and legacy mitigatingFactors
  const maxDTI = calculateMaxDTI(
    financials.ficoScore,
    loanDetails.ltv,
    loanDetails.loanType,
    // If we have new-style selectedFactors, use those, otherwise use legacy mitigatingFactors
    Object.keys(userSelectedFactors).length > 0 ? safeSelectedFactors : financials.mitigatingFactors
  );
  console.log("Calculated maxDTI:", maxDTI);
  
  // Calculate monthly income and available debt service
  const monthlyIncome = financials.annualIncome / 12;
  const maxMonthlyDebtPayment = monthlyIncome * (maxDTI / 100);
  const availableForMortgage = maxMonthlyDebtPayment - financials.monthlyDebts;
  console.log("Monthly income:", monthlyIncome, "Max monthly debt:", maxMonthlyDebtPayment, "Available for mortgage:", availableForMortgage);
  
  // Calculate the adjusted interest rate based on FICO and LTV
  const adjustedRate = calculateAdjustedRate(
    loanDetails.interestRate,
    financials.ficoScore,
    loanDetails.ltv,
    loanDetails.loanType
  );
  console.log("Adjusted interest rate:", adjustedRate);
  
  // Get MIP/PMI rate
  let pmiRate = 0;
  if (loanDetails.loanType === 'fha' && loanDetails.ongoingMIP) {
    pmiRate = loanDetails.ongoingMIP;
  } else if (loanDetails.ltv > 80) {
    // Simple PMI estimate based on LTV for conventional loans
    pmiRate = loanDetails.ltv > 95 ? 1.1 : 
              loanDetails.ltv > 90 ? 0.8 : 
              loanDetails.ltv > 85 ? 0.5 : 0.3;
  }
  console.log("PMI/MIP rate:", pmiRate);
  
  // Calculate max purchase price - this should align with the borrowing power amount
  const maxPurchasePrice = calculateMaxPurchasePrice(
    financials.annualIncome,
    financials.monthlyDebts,
    maxDTI,
    adjustedRate,
    loanDetails.propertyTax,
    loanDetails.propertyInsurance || 1200, // Default to $1200 if not available
    100 - loanDetails.ltv, // Convert LTV to down payment %
    pmiRate
  );
  console.log("Calculated max purchase price:", maxPurchasePrice);
  
  // Calculate loan amount
  const loanAmount = maxPurchasePrice * (loanDetails.ltv / 100);
  
  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    adjustedRate,
    30, // 30-year term
    (loanDetails.propertyTax / 100) * maxPurchasePrice, // Annual property tax
    loanDetails.propertyInsurance || 1200, // Annual insurance
    pmiRate // PMI/MIP rate
  );
  console.log("Calculated monthly payment:", monthlyPayment);
  
  // Store the new financial details
  const financialDetails = {
    maxDTI,
    monthlyIncome,
    maxMonthlyDebtPayment,
    availableForMortgage,
    adjustedRate
  };
  
  // Generate alternative scenarios
  const scenarios = calculateAlternativeScenarios(
    userData,
    maxDTI,
    maxPurchasePrice
  );
  
  return {
    maxHomePrice: maxPurchasePrice,
    monthlyPayment: monthlyPayment,
    scenarios: scenarios,
    financialDetails: financialDetails,
  };
};
