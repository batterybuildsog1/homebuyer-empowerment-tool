
/**
 * Mortgage calculation utilities
 * This file re-exports mortgage calculation functions from more focused modules
 */

// Re-export from DTI calculations
export { 
  calculateMaxDTI,
  calculateDTILimits,
  DTILimits,
  compensatingFactors,
  getCreditHistoryOption,
  getNonHousingDTIOption, 
  isStrongFactor,
  countStrongFactors
} from './mortgage/dtiCalculations';

// Re-export from compensating factor service
export {
  prepareDTICalculationData,
  createEnhancedFactors
} from './mortgage/compensatingFactorService';

// Re-export from loan calculations
export { 
  calculateMonthlyPayment,
  calculateMaxPurchasePrice,
  calculateMaxLoanAmount 
} from './mortgage/loanCalculations';

// Re-export from rate adjustments
export { 
  getFicoRateAdjustment,
  getLtvRateAdjustment,
  calculateAdjustedRate 
} from './mortgage/rateAdjustments';

// Re-export from FHA utilities
export { 
  getFhaMipRates 
} from './mortgage/fhaUtils';

// Re-export from improvement utilities
export { 
  getNextFicoBand,
  getLowerLtvOption 
} from './mortgage/improvementUtils';

// Re-export from new standardized modules
export {
  calculateMonthlyPropertyTax,
  calculateMonthlyInsurance,
  calculateAnnualPropertyTax
} from './mortgage/propertyExpenseCalculator';

export {
  calculateFhaMipRates as calculateMipRates,
  calculateMonthlyMortgageInsurance
} from './mortgage/insuranceCalculator';

// Re-export constants
export { 
  DTI_LIMITS, 
  PROPERTY_EXPENSES, 
  INSURANCE_STANDARDS 
} from './constants/mortgageConstants';
