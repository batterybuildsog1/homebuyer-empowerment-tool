/**
 * Compensating Factors Service
 * 
 * This service provides centralized logic for handling compensating factors
 * in the DTI (Debt-to-Income) calculation.
 */

import { compensatingFactors, getCreditHistoryOption } from "./dtiCalculations";

/**
 * Options for non-housing DTI ratios
 */
export enum NonHousingDTIOption {
  HIGH = ">10%",
  MODERATE = "5-10%",
  LOW = "<5%"
}

/**
 * Options for cash reserves
 */
export enum CashReservesOption {
  NONE = "none",
  LOW = "1-2 months",
  MODERATE = "3-5 months",
  HIGH = "6+ months"
}

/**
 * Options for residual income
 */
export enum ResidualIncomeOption {
  DOES_NOT_MEET = "does not meet",
  MEETS = "meets VA guidelines"
}

/**
 * Interface for compensating factors data
 */
export interface CompensatingFactorsData {
  cashReserves: string;
  residualIncome: string;
  housingPaymentIncrease: string;
  employmentHistory: string;
  creditUtilization: string;
  downPayment: string;
  creditHistory?: string; // Added automatically based on FICO
  nonHousingDTI?: string; // Calculated based on debts and income
}

/**
 * Determines the non-housing DTI option based on the monthly debts and income
 * 
 * @param monthlyDebts - User's total monthly debt payments
 * @param monthlyIncome - User's monthly income
 * @returns The appropriate non-housing DTI option
 */
export const getNonHousingDTIOption = (monthlyDebts: number, monthlyIncome: number): string => {
  if (monthlyIncome <= 0) return NonHousingDTIOption.HIGH;
  
  const nonHousingDTIPercentage = (monthlyDebts / monthlyIncome) * 100;
  if (nonHousingDTIPercentage < 5) return NonHousingDTIOption.LOW;
  if (nonHousingDTIPercentage <= 10) return NonHousingDTIOption.MODERATE;
  return NonHousingDTIOption.HIGH;
};

/**
 * Checks if a specific factor value is considered a "strong" factor for DTI enhancement
 * 
 * @param factor - The compensating factor key
 * @param value - The selected value for the factor
 * @returns Boolean indicating if this is a strong factor
 */
export const isStrongFactor = (factor: string, value: string): boolean => {
  const strongFactorMap: Record<string, string[]> = {
    creditHistory: ["760+"],
    cashReserves: [CashReservesOption.HIGH],
    nonHousingDTI: [NonHousingDTIOption.LOW],
    residualIncome: [ResidualIncomeOption.MEETS]
  };
  
  return strongFactorMap[factor]?.includes(value) || false;
};

/**
 * Counts the number of strong compensating factors in the selected options
 * 
 * @param selectedFactors - User's selected compensating factors
 * @returns Number of strong factors present
 */
export const countStrongFactors = (selectedFactors: Record<string, string>): number => {
  let count = 0;
  
  for (const [factor, option] of Object.entries(selectedFactors)) {
    if (isStrongFactor(factor, option)) {
      count++;
    }
  }
  
  return count;
};

/**
 * Creates enhanced compensating factors with calculated and derived values
 * 
 * @param selectedFactors - User-selected compensating factors
 * @param ficoScore - User's FICO credit score
 * @param monthlyDebts - User's total monthly debt payments
 * @param monthlyIncome - User's monthly income
 * @returns Enhanced compensating factors with all required values
 */
export const createEnhancedFactors = (
  selectedFactors: Record<string, string>,
  ficoScore: number,
  monthlyDebts: number,
  monthlyIncome: number
): Record<string, string> => {
  // Create safe selected factors with defaults
  const safeSelectedFactors = Object.keys(compensatingFactors).reduce((acc, factor) => {
    acc[factor] = selectedFactors[factor] || "none";
    return acc;
  }, {} as Record<string, string>);
  
  // Add calculated credit history based on FICO
  const creditHistoryOption = getCreditHistoryOption(ficoScore);
  
  // Calculate non-housing DTI
  const nonHousingDTIOption = getNonHousingDTIOption(monthlyDebts, monthlyIncome);
  
  // Return enhanced factors
  return {
    ...safeSelectedFactors,
    creditHistory: creditHistoryOption,
    nonHousingDTI: nonHousingDTIOption
  };
};

/**
 * Gets the maximum DTI cap based on the number of strong factors
 * 
 * @param strongFactorCount - Number of strong compensating factors
 * @param loanType - Type of loan ('conventional' or 'fha')
 * @returns Maximum DTI cap percentage
 */
export const getMaxDTICap = (
  strongFactorCount: number,
  loanType: 'conventional' | 'fha'
): number => {
  if (loanType === 'conventional') {
    return 50; // Conventional loans cap at 50% regardless of strong factors
  }
  
  // FHA loans can go up to 57% with at least 2 strong factors
  return strongFactorCount >= 2 ? 57 : 50;
};

/**
 * Prepares all necessary data for DTI calculation
 * 
 * @param ficoScore - User's FICO credit score
 * @param ltv - Loan-to-value ratio
 * @param loanType - Type of loan ('conventional' or 'fha')
 * @param selectedFactors - User-selected compensating factors
 * @param monthlyDebts - User's total monthly debt payments
 * @param monthlyIncome - User's monthly income
 * @returns Object with all data needed for DTI calculation
 */
export const prepareDTICalculationData = (
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string> = {},
  monthlyDebts: number = 0,
  monthlyIncome: number = 0
) => {
  // Create enhanced factors with calculated values
  const enhancedFactors = createEnhancedFactors(
    selectedFactors,
    ficoScore,
    monthlyDebts,
    monthlyIncome
  );
  
  // Count strong factors
  const strongFactorCount = countStrongFactors(enhancedFactors);
  
  // Get max DTI cap based on strong factors
  const dtiCap = getMaxDTICap(strongFactorCount, loanType);
  
  return {
    enhancedFactors,
    strongFactorCount,
    dtiCap
  };
};
