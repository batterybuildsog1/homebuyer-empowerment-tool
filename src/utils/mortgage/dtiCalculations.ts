
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

// Detailed compensating factors mapping with DTI adjustment weights
export const compensatingFactors: Record<string, Record<string, number>> = {
  cashReserves: {
    "none": 0,                  // No adjustment
    "3-6 months": 2,           // Moderate cushion: +2% DTI
    "6+ months": 4,            // Strong cushion: +4% DTI
  },
  residualIncome: {
    "none": 0,                  // No adjustment
    "20-30%": 2,               // Decent buffer: +2% DTI
    "30%+": 4,                 // Significant buffer: +4% DTI
  },
  creditHistory: {
    "none": 0,                  // Default for FICO < 720 (no adjustment)
    "720-759": 2,              // Good credit: +2% DTI
    "760+": 3,                 // Elite credit: +3% DTI
  },
  housingPaymentIncrease: {
    "none": 0,                  // No adjustment
    "<10%": 3,                 // Minimal increase: +3% DTI
    "10-20%": 2,               // Moderate increase: +2% DTI
  },
  employmentHistory: {
    "none": 0,                  // No adjustment
    "3-5 years": 1,            // Stable: +1% DTI
    "5+ years": 2,             // Very stable: +2% DTI
  },
  creditUtilization: {
    "none": 0,                  // No adjustment
    "<30%": 1,                 // Low utilization: +1% DTI
    "<10%": 2,                 // Very low utilization: +2% DTI
  },
  downPayment: {
    "none": 0,                  // No adjustment
    "10-15%": 1,               // Moderate down payment: +1% DTI
    "15%+": 2,                 // Large down payment: +2% DTI
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
  return "none";
};

/**
 * Calculates the maximum allowable DTI based on loan type and compensating factors
 * @param ficoScore User's FICO score
 * @param ltv Loan-to-value ratio
 * @param loanType Type of loan (e.g., 'fha', 'conventional')
 * @param selectedFactors User's selected compensating factors
 * @returns Adjusted maximum DTI percentage
 */
export const calculateMaxDTI = (
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string> | string[] = {}
): number => {
  let baseDTI = loanType === 'fha' ? 43 : 36; // Base DTI: 43% for FHA, 36% for conventional

  // Check for legacy mitigatingFactors array (for backward compatibility)
  // If selectedFactors is actually an array of strings, we're using the old format
  if (Array.isArray(selectedFactors)) {
    // Legacy handling for backward compatibility
    const dtiLimits = DTI_LIMITS[loanType];
    let maxDTI = dtiLimits.default;

    // Check for strong mitigating factors (old logic)
    if (loanType === 'conventional') {
      if (ficoScore >= 720) maxDTI = dtiLimits.strongFactors.highFICO;
      if ((selectedFactors as string[]).includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.strongFactors.reserves);
      }
      if (ltv <= 75) {
        // For conventional loans, we need to cast to access the lowLTV property
        const conventionalFactors = dtiLimits.strongFactors as typeof DTI_LIMITS.conventional.strongFactors;
        maxDTI = Math.max(maxDTI, conventionalFactors.lowLTV);
      }
    } else { // FHA
      if (ficoScore >= 680) maxDTI = dtiLimits.strongFactors.highFICO;
      if ((selectedFactors as string[]).includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.strongFactors.reserves);
      }
      if ((selectedFactors as string[]).length >= 2) {
        // For FHA loans, we need to cast to access the compensatingFactors property
        const fhaFactors = dtiLimits.strongFactors as typeof DTI_LIMITS.fha.strongFactors;
        maxDTI = Math.max(maxDTI, fhaFactors.compensatingFactors);
      }
    }
    
    return maxDTI;
  }

  // New logic using detailed compensating factors
  if (loanType === 'fha') {
    let dtiIncrease = 0;

    // Automatically set creditHistory based on FICO score
    const creditHistoryOption = getCreditHistoryOption(ficoScore);
    const factorsToEvaluate = { ...selectedFactors, creditHistory: creditHistoryOption };

    // Calculate total DTI increase from selected factors
    for (const [factor, option] of Object.entries(factorsToEvaluate)) {
      if (compensatingFactors[factor] && compensatingFactors[factor][option] !== undefined) {
        dtiIncrease += compensatingFactors[factor][option];
      } else {
        console.warn(`Invalid option "${option}" for factor "${factor}"`);
      }
    }

    // Return DTI, capped at 57%
    return Math.min(baseDTI + dtiIncrease, 57);
  }

  // For conventional loans, apply the new compensating factors logic
  let dtiIncrease = 0;
  
  // Automatically set creditHistory based on FICO score
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
