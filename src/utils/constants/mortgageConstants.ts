
/**
 * Standardized mortgage calculation constants
 */

// DTI limits with warning thresholds
export const DTI_LIMITS = {
  CONVENTIONAL: {
    FRONT_END: {
      DEFAULT: 36,
      WARNING: 45, // Higher front-end warning for conventional
      HARD_CAP: null // No hard cap in DU
    },
    BACK_END: {
      DEFAULT: 45,
      WARNING: 50,
      HARD_CAP: 55 // Maximum allowed in DU with compensating factors
    }
  },
  FHA: {
    FRONT_END: {
      DEFAULT: 31,
      WARNING: 46.99, // Warning threshold as per research
      HARD_CAP: null // No hard cap per research
    },
    BACK_END: {
      DEFAULT: 43,
      WARNING: 50, 
      HARD_CAP: 59 // Maximum limit as per instruction
    }
  }
};

// Standardized property terms
export const PROPERTY_EXPENSES = {
  // Default property tax percentage if not specified (annual)
  DEFAULT_PROPERTY_TAX_PERCENT: 1.2,
  
  // Default annual property insurance amount
  DEFAULT_PROPERTY_INSURANCE: 1200,
  
  // Convert percentage to decimal divisor
  PERCENT_DIVISOR: 100
};

// PMI/MIP standards
export const INSURANCE_STANDARDS = {
  // FHA MIP rates - upfront and annual
  FHA: {
    UPFRONT_MIP_PERCENT: 1.75,
    ANNUAL_MIP: {
      BELOW_15_YEARS_BELOW_90_LTV: 0.45,
      BELOW_15_YEARS_ABOVE_90_LTV: 0.70,
      ABOVE_15_YEARS_BELOW_90_LTV: 0.50,
      ABOVE_15_YEARS_ABOVE_90_LTV: 0.55
    }
  },
  
  // Conventional PMI thresholds
  CONVENTIONAL: {
    PMI_REMOVAL_LTV: 80,
    PMI_AUTO_REMOVAL_LTV: 78
  }
};
