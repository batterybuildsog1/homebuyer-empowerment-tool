// DTI limits based on FICO score and loan type
const DTI_LIMITS = {
  conventional: {
    default: 36,
    strongFactors: {
      highFICO: 45,
      reserves: 45,
      lowLTV: 45
    }
  },
  fha: {
    default: 43,
    strongFactors: {
      highFICO: 50,
      reserves: 50,
      compensatingFactors: 50
    }
  }
};

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

// Import and re-export functions from compensatingFactorService
import {
  getNonHousingDTIOption,
  isStrongFactor,
  countStrongFactors,
  prepareDTICalculationData,
} from './compensatingFactorService';

export { getNonHousingDTIOption, isStrongFactor, countStrongFactors };

/**
 * Calculates the maximum allowable DTI based on loan type and compensating factors
 * @param ficoScore User's FICO score
 * @param ltv Loan-to-value ratio
 * @param loanType Type of loan (e.g., 'fha', 'conventional')
 * @param selectedFactors User's selected compensating factors
 * @param monthlyDebts User's monthly debt payments (optional)
 * @param monthlyIncome User's monthly income (optional)
 * @returns Adjusted maximum DTI percentage
 */
export const calculateMaxDTI = (
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string> | string[] = {},
  monthlyDebts: number = 0,
  monthlyIncome: number = 0
): number => {
  // Handle legacy array format for backward compatibility
  if (Array.isArray(selectedFactors)) {
    // Legacy handling for backward compatibility
    const dtiLimits = DTI_LIMITS[loanType];
    let maxDTI = dtiLimits.default;

    if (loanType === 'conventional') {
      if (ficoScore >= 720) maxDTI = dtiLimits.strongFactors.highFICO;
      if ((selectedFactors as string[]).includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.strongFactors.reserves);
      }
      if (ltv <= 75) {
        const conventionalFactors = dtiLimits.strongFactors as typeof DTI_LIMITS.conventional.strongFactors;
        maxDTI = Math.max(maxDTI, conventionalFactors.lowLTV);
      }
    } else { // FHA
      if (ficoScore >= 680) maxDTI = dtiLimits.strongFactors.highFICO;
      if ((selectedFactors as string[]).includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.strongFactors.reserves);
      }
      if ((selectedFactors as string[]).length >= 2) {
        const fhaFactors = dtiLimits.strongFactors as typeof DTI_LIMITS.fha.strongFactors;
        maxDTI = Math.max(maxDTI, fhaFactors.compensatingFactors);
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
  const baseDTI = 43;
  
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
  let baseDTI = 36;
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
  
  // Return DTI, capped at 50% for conventional loans
  return Math.min(baseDTI + dtiIncrease + ltvAdjustment, 50);
};
