
// Re-export types
export type { DTIStatus, DTILimits } from './types/dtiTypes';

// Re-export DTI evaluators
export { 
  evaluateFrontEndDTI,
  evaluateBackEndDTI 
} from './evaluators/dtiStatusEvaluator';

// Re-export calculators
export { calculateMaxDTI } from './calculators/dtiCalculator';
export { 
  getNonHousingDTIOption,
  isStrongFactor,
  countStrongFactors,
  createEnhancedFactors,
  NonHousingDTIOption
} from './calculators/compensatingFactorsCalculator';

// Re-export credit utils
export { getCreditHistoryOption } from './utils/creditUtils';
