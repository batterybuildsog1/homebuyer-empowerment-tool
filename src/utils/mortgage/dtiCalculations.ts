
import { DTI_LIMITS } from "../constants/mortgageConstants";
import {
  getNonHousingDTIOption,
  isStrongFactor,
  countStrongFactors,
  prepareDTICalculationData,
} from './compensatingFactorService';

// Enhanced compensating factors mapping with DTI adjustment weights
export const compensatingFactors: Record<string, Record<string, number>> = {
  cashReserves: {
    "none": 0,
    "1-2 months": 1,
    "3-5 months": 3,
    "6+ months": 5,
  },
  residualIncome: {
    "does not meet": 0,
    "meets VA guidelines": 4,
  },
  creditHistory: {
    "<640": 0,
    "640-679": 1,
    "680-719": 2,
    "720-759": 3,
    "760+": 4,
  },
  housingPaymentIncrease: {
    ">20%": 0,
    "10-20%": 1,
    "<10%": 2,
  },
  employmentHistory: {
    "<2 years": 0,
    "2-5 years": 1,
    ">5 years": 2,
  },
  creditUtilization: {
    ">30%": 0,
    "10-30%": 1,
    "<10%": 2,
  },
  downPayment: {
    "<5%": 0,
    "5-10%": 1,
    ">10%": 2,
  },
  nonHousingDTI: {
    ">10%": 0,
    "5-10%": 2,
    "<5%": 4,
  },
};

// New standardized interface for DTI results
export interface DTILimits {
  frontEnd: {
    default: number;
    maximum: number;
    warning: number;
    hardCap: number | null;
  };
  backEnd: {
    default: number;
    maximum: number;
    warning: number;
    hardCap: number | null;
  };
}

/**
 * Calculate maximum DTI limits based on loan parameters
 * @returns Both front-end and back-end DTI limits
 */
export function calculateDTILimits(
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string>,
  monthlyDebts: number = 0,
  monthlyIncome: number = 0
): DTILimits {
  // Start with default limits from constants
  const limits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS];
  
  // Create base result structure
  const result: DTILimits = {
    frontEnd: {
      default: limits.FRONT_END.DEFAULT,
      maximum: limits.FRONT_END.WARNING, // Initial maximum is warning level
      warning: limits.FRONT_END.WARNING,
      hardCap: limits.FRONT_END.HARD_CAP,
    },
    backEnd: {
      default: limits.BACK_END.DEFAULT,
      maximum: calculateMaxBackEndDTI(ficoScore, ltv, loanType, selectedFactors, monthlyDebts, monthlyIncome),
      warning: limits.BACK_END.WARNING,
      hardCap: limits.BACK_END.HARD_CAP,
    }
  };
  
  return result;
}

/**
 * Determines the credit history option based on FICO score
 * @param ficoScore User's credit score
 * @returns Selected option key
 */
export const getCreditHistoryOption = (ficoScore: number): string => {
  if (ficoScore >= 760) return "760+";
  if (ficoScore >= 720) return "720-759";
  if (ficoScore >= 680) return "680-719";
  if (ficoScore >= 640) return "640-679";
  return "<640";
};

export { getNonHousingDTIOption, isStrongFactor, countStrongFactors };

/**
 * Calculates the maximum allowable DTI based on loan type and compensating factors
 * For backward compatibility, this function calls the new calculateMaxBackEndDTI function
 */
export const calculateMaxDTI = (
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string> | string[] = {},
  monthlyDebts: number = 0,
  monthlyIncome: number = 0
): number => {
  return calculateMaxBackEndDTI(ficoScore, ltv, loanType, selectedFactors, monthlyDebts, monthlyIncome);
};

/**
 * Internal refactored function with consistent naming for calculating back-end DTI
 */
function calculateMaxBackEndDTI(
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string> | string[] = {},
  monthlyDebts: number = 0,
  monthlyIncome: number = 0
): number {
  // Handle legacy array format for backward compatibility
  if (Array.isArray(selectedFactors)) {
    // Legacy handling for backward compatibility
    const dtiLimits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS];
    let maxDTI = dtiLimits.BACK_END.DEFAULT;

    if (loanType === 'conventional') {
      if (ficoScore >= 720) maxDTI = dtiLimits.BACK_END.WARNING;
      if ((selectedFactors as string[]).includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
      if (ltv <= 75) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
    } else { // FHA
      if (ficoScore >= 680) maxDTI = dtiLimits.BACK_END.WARNING;
      if ((selectedFactors as string[]).includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
      if ((selectedFactors as string[]).length >= 2) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
    }
    
    return maxDTI;
  }

  // For conventional loans, use the existing method
  if (loanType === 'conventional') {
    return calculateConventionalDTI(ficoScore, ltv, selectedFactors as Record<string, string>);
  }
  
  // Use the centralized service for FHA loans
  const { enhancedFactors, dtiCap } = prepareDTICalculationData(
    ficoScore,
    ltv,
    loanType,
    selectedFactors as Record<string, string>,
    monthlyDebts,
    monthlyIncome
  );
  
  // Base DTI for FHA
  const baseDTI = DTI_LIMITS.FHA.BACK_END.DEFAULT;
  
  // Calculate total DTI increase from all factors
  let dtiIncrease = 0;
  for (const [factor, option] of Object.entries(enhancedFactors)) {
    if (compensatingFactors[factor] && compensatingFactors[factor][option] !== undefined) {
      dtiIncrease += compensatingFactors[factor][option];
    }
  }
  
  // Return DTI, capped appropriately based on strong factors
  return Math.min(baseDTI + dtiIncrease, dtiCap);
};

/**
 * Calculate maximum DTI for conventional loans
 * @param ficoScore User's FICO score
 * @param ltv Loan-to-value ratio 
 * @param selectedFactors User's selected compensating factors
 * @returns Maximum DTI percentage for conventional loans
 */
const calculateConventionalDTI = (
  ficoScore: number,
  ltv: number,
  selectedFactors: Record<string, string> = {}
): number => {
  // Start with base DTI
  let baseDTI = DTI_LIMITS.CONVENTIONAL.BACK_END.DEFAULT;
  let dtiIncrease = 0;
  
  // Use the standardized credit history determination
  const creditHistoryOption = getCreditHistoryOption(ficoScore);
  const factorsToEvaluate = { ...selectedFactors, creditHistory: creditHistoryOption };
  
  // Calculate total DTI increase from selected factors
  for (const [factor, option] of Object.entries(factorsToEvaluate)) {
    if (compensatingFactors[factor] && compensatingFactors[factor][option] !== undefined) {
      dtiIncrease += compensatingFactors[factor][option];
    }
  }
  
  // LTV-based adjustment for conventional loans
  let ltvAdjustment = 0;
  if (ltv <= 75) {
    ltvAdjustment = 3; // Additional +3% DTI for low LTV
  } else if (ltv <= 80) {
    ltvAdjustment = 2; // Additional +2% DTI for moderate LTV
  }
  
  // Return DTI, capped at the hard cap for conventional loans
  return Math.min(baseDTI + dtiIncrease + ltvAdjustment, DTI_LIMITS.CONVENTIONAL.BACK_END.HARD_CAP || 50);
};
