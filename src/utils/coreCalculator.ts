
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
  
  // Validate critical data
  if (!financials.annualIncome || !loanDetails.interestRate) {
    console.error("Missing critical data for calculation");
    return null;
  }
  
  // Create safe selectedFactors with defaults to prevent errors
  const userSelectedFactors = financials.selectedFactors || {};
  
  // Create a safe version with defaults for any missing factors
  const safeSelectedFactors = Object.keys(compensatingFactors).reduce((acc, factor) => {
    acc[factor] = userSelectedFactors[factor] || "none";
    return acc;
  }, {} as Record<string, string>);
  
  // Calculate monthly income once and reuse it throughout the function
  const monthlyIncome = financials.annualIncome / 12;
  
  // Calculate non-housing DTI for enhanced DTI calculation
  const nonHousingDTI = financials.monthlyDebts > 0 && monthlyIncome > 0 
    ? (financials.monthlyDebts / monthlyIncome) * 100 
    : 0;
  
  // Add calculated values to factors
  const enhancedFactors = {
    ...safeSelectedFactors,
    nonHousingDTI: nonHousingDTI < 5 ? "<5%" : nonHousingDTI <= 10 ? "5-10%" : ">10%"
  };
  
  // Calculate the max DTI based on FICO score, LTV, and compensating factors
  const maxDTI = calculateMaxDTI(
    financials.ficoScore,
    loanDetails.ltv,
    loanDetails.loanType,
    enhancedFactors,
    financials.monthlyDebts,
    monthlyIncome
  );
  console.log("Calculated maxDTI:", maxDTI);
  
  // Calculate available debt service using the already defined monthlyIncome variable
  const maxMonthlyDebtPayment = monthlyIncome * (maxDTI / 100);
  const availableForMortgage = maxMonthlyDebtPayment - financials.monthlyDebts;
  
  if (availableForMortgage <= 0) {
    console.error("Available for mortgage is negative or zero");
    return {
      maxHomePrice: 0,
      monthlyPayment: 0,
      scenarios: [],
      financialDetails: {
        maxDTI,
        monthlyIncome,
        maxMonthlyDebtPayment,
        availableForMortgage: 0,
        adjustedRate: 0
      }
    };
  }
  
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
  
  // Ensure we have property tax and insurance values
  const propertyTax = loanDetails.propertyTax || 1.2; // Default to 1.2% if not available
  const propertyInsurance = loanDetails.propertyInsurance || 1200; // Default to $1200/year if not available
  
  // Calculate max purchase price - this should align with the borrowing power amount
  const maxPurchasePrice = calculateMaxPurchasePrice(
    financials.annualIncome,
    financials.monthlyDebts,
    maxDTI,
    adjustedRate,
    propertyTax,
    propertyInsurance,
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
    (propertyTax / 100) * maxPurchasePrice, // Annual property tax
    propertyInsurance, // Annual insurance
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
