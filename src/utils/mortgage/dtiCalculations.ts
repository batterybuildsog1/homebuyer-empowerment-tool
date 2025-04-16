
// Re-export types
export type { DTIStatus, DTILimits, FinancialDetails } from './types/dtiTypes';

// Re-export DTI evaluators
export { 
  evaluateFrontEndDTI,
  evaluateBackEndDTI 
} from './evaluators/dtiStatusEvaluator';

// Re-export calculators
export { calculateMaxDTI } from './calculators/dtiCalculator';
export { calculateDTILimits } from './calculators/dtiLimitsCalculator';
export { 
  getNonHousingDTIOption,
  isStrongFactor,
  countStrongFactors,
  createEnhancedFactors,
  NonHousingDTIOption
} from './calculators/compensatingFactorsCalculator';

// Re-export credit utils
export { getCreditHistoryOption } from './utils/creditUtils';

// Export compensating factors definitions
export { compensatingFactors } from './constants/compensatingFactorsDefinitions';
