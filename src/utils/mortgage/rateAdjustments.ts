
// Base rates adjustment based on FICO score
const FICO_RATE_ADJUSTMENTS = {
  "conventional": {
    "740+": 0,
    "720-739": 0.125,
    "700-719": 0.25, 
    "680-699": 0.375,
    "660-679": 0.5,
    "640-659": 0.75,
    "620-639": 1.0
  },
  "fha": {
    "740+": 0,
    "720-739": 0,
    "700-719": 0.125,
    "680-699": 0.25,
    "660-679": 0.25,
    "640-659": 0.25,
    "620-639": 0.25,
    "580-619": 0.5,
    "500-579": 0.75
  }
};

// LTV adjustments
const LTV_RATE_ADJUSTMENTS: Record<string, number> = {
  "below60": -0.25,
  "60-70": -0.125,
  "70-75": 0,
  "75-80": 0,
  "80-85": 0.125,
  "85-90": 0.25, 
  "90-95": 0.375,
  "95-97": 0.5,
  "above97": 0.75
};

/**
 * Gets the rate adjustment based on FICO score and loan type
 * @param ficoScore FICO credit score
 * @param loanType Loan type (conventional or FHA)
 * @returns Rate adjustment amount
 */
export const getFicoRateAdjustment = (
  ficoScore: number, 
  loanType: 'conventional' | 'fha'
): number => {
  const adjustments = FICO_RATE_ADJUSTMENTS[loanType];
  
  if (ficoScore >= 740) return adjustments["740+"];
  if (ficoScore >= 720) return adjustments["720-739"];
  if (ficoScore >= 700) return adjustments["700-719"];
  if (ficoScore >= 680) return adjustments["680-699"];
  if (ficoScore >= 660) return adjustments["660-679"];
  if (ficoScore >= 640) return adjustments["640-659"];
  if (ficoScore >= 620) return adjustments["620-639"];
  
  // Only applicable for FHA
  if (loanType === "fha") {
    if (ficoScore >= 580) return adjustments["580-619"];
    if (ficoScore >= 500) return adjustments["500-579"];
  }
  
  return loanType === 'conventional' ? 999 : adjustments["500-579"]; // Conventional loans typically not available below 620
};

/**
 * Gets the rate adjustment based on LTV ratio
 * @param ltv Loan-to-value ratio
 * @returns Rate adjustment amount
 */
export const getLtvRateAdjustment = (ltv: number): number => {
  if (ltv < 60) return LTV_RATE_ADJUSTMENTS["below60"];
  if (ltv < 70) return LTV_RATE_ADJUSTMENTS["60-70"];
  if (ltv < 75) return LTV_RATE_ADJUSTMENTS["70-75"];
  if (ltv < 80) return LTV_RATE_ADJUSTMENTS["75-80"];
  if (ltv < 85) return LTV_RATE_ADJUSTMENTS["80-85"];
  if (ltv < 90) return LTV_RATE_ADJUSTMENTS["85-90"];
  if (ltv < 95) return LTV_RATE_ADJUSTMENTS["90-95"];
  if (ltv <= 97) return LTV_RATE_ADJUSTMENTS["95-97"];
  return LTV_RATE_ADJUSTMENTS["above97"];
};

/**
 * Calculates the adjusted interest rate based on FICO score and LTV
 * @param baseRate Base interest rate
 * @param ficoScore FICO credit score
 * @param ltv Loan-to-value ratio
 * @param loanType Loan type
 * @returns Adjusted interest rate
 */
export const calculateAdjustedRate = (
  baseRate: number,
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha'
): number => {
  const ficoAdjustment = getFicoRateAdjustment(ficoScore, loanType);
  const ltvAdjustment = getLtvRateAdjustment(ltv);
  
  return baseRate + ficoAdjustment + ltvAdjustment;
};
