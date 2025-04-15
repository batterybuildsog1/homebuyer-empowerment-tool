/**
 * Mortgage calculation utilities
 * This file re-exports mortgage calculation functions from more focused modules
 */

// Re-export from DTI calculations
export { 
  calculateMaxDTI,
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
