// FHA MIP rates for different scenarios
const FHA_UPFRONT_MIP = 1.75; // 1.75% of loan amount
const FHA_ANNUAL_MIP: Record<string, number> = {
  "below15Years_below90LTV": 0.45, // 0.45% annual
  "below15Years_above90LTV": 0.70, // 0.70% annual
  "above15Years_below90LTV": 0.50, // 0.50% annual 
  "above15Years_above90LTV": 0.55, // 0.55% annual
};

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

export const calculateMonthlyPayment = (
  loanAmount: number,
  interestRate: number,
  termYears: number = 30,
  propertyTax: number = 0,
  propertyInsurance: number = 0,
  pmi: number = 0
): number => {
  // Convert annual interest rate to monthly and decimal
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  // Calculate principal and interest payment
  let monthlyPrincipalAndInterest = 0;
  if (monthlyRate === 0) {
    // Edge case: 0% interest rate
    monthlyPrincipalAndInterest = loanAmount / totalPayments;
  } else {
    // Standard formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
    monthlyPrincipalAndInterest = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }
  
  // Monthly components
  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = propertyInsurance / 12;
  const monthlyPMI = (pmi / 100) * loanAmount / 12;
  
  // Total monthly payment
  const totalMonthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI;
  
  return Math.round(totalMonthlyPayment);
};

export const calculateMaxPurchasePrice = (
  annualIncome: number,
  monthlyDebts: number,
  dti: number,
  interestRate: number,
  propertyTaxRate: number,
  annualInsurance: number,
  downPaymentPercent: number,
  pmiRate: number = 0,
  termYears: number = 30
): number => {
  // Maximum monthly housing payment
  const maxMonthlyPayment = (annualIncome / 12) * (dti / 100) - monthlyDebts;
  
  // Monthly fixed costs (taxes and insurance) as percentage of home price
  const monthlyPropertyTaxRate = (propertyTaxRate / 100) / 12;
  const monthlyInsuranceRate = annualInsurance / 12;
  
  // Monthly PMI as percentage of loan amount (which is a percentage of home price)
  const loanToValueRatio = 1 - (downPaymentPercent / 100);
  const effectivePmiRate = (pmiRate / 100) * loanToValueRatio / 12;
  
  // Convert annual interest rate to monthly and decimal
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  // Home price multiplier for PI payment
  let piMultiplier;
  if (monthlyRate === 0) {
    piMultiplier = 1 / (totalPayments * loanToValueRatio);
  } else {
    piMultiplier = (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                 ((Math.pow(1 + monthlyRate, totalPayments) - 1) * loanToValueRatio);
  }
  
  // Total home price to payment ratio
  const totalMultiplier = piMultiplier + monthlyPropertyTaxRate + effectivePmiRate;
  
  // Maximum home price
  const maxHomePrice = (maxMonthlyPayment - monthlyInsuranceRate) / totalMultiplier;
  
  return Math.floor(maxHomePrice);
};

export const calculateMaxLoanAmount = (
  annualIncome: number,
  monthlyDebts: number,
  dti: number,
  interestRate: number,
  loanType: 'conventional' | 'fha' = 'conventional',
  termYears: number = 30
): number => {
  // Monthly income
  const monthlyIncome = annualIncome / 12;
  
  // Maximum monthly payment based on DTI
  const maxMonthlyPayment = (monthlyIncome * (dti / 100)) - monthlyDebts;
  
  if (maxMonthlyPayment <= 0) return 0;
  
  // Convert annual interest rate to monthly and decimal
  const monthlyRate = interestRate / 100 / 12;
  const termMonths = termYears * 12; // 30-year mortgage
  
  // Use the formula: P = PMT * [(1 - (1 + r)^-n) / r]
  // Where P is principal (loan amount), PMT is monthly payment, r is monthly rate, n is term in months
  let loanAmount;
  if (monthlyRate === 0) {
    loanAmount = maxMonthlyPayment * termMonths;
  } else {
    loanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate);
  }
  
  return Math.floor(loanAmount);
};

export const getFhaMipRates = (
  loanAmount: number,
  ltv: number,
  termYears: number = 30
): { upfrontMipPercent: number; annualMipPercent: number } => {
  // Upfront MIP is always 1.75% for FHA loans
  const upfrontMipPercent = FHA_UPFRONT_MIP;
  
  // Annual MIP depends on loan term and LTV
  let annualMipPercent;
  if (termYears <= 15) {
    annualMipPercent = ltv <= 90 
      ? FHA_ANNUAL_MIP["below15Years_below90LTV"] 
      : FHA_ANNUAL_MIP["below15Years_above90LTV"];
  } else {
    annualMipPercent = ltv <= 90 
      ? FHA_ANNUAL_MIP["above15Years_below90LTV"] 
      : FHA_ANNUAL_MIP["above15Years_above90LTV"];
  }
  
  return { upfrontMipPercent, annualMipPercent };
};

export const getNextFicoBand = (
  currentFico: number, 
  loanType: 'conventional' | 'fha'
): number | null => {
  if (loanType === 'conventional') {
    if (currentFico < 620) return 620;
    if (currentFico < 640) return 640;
    if (currentFico < 660) return 660;
    if (currentFico < 680) return 680;
    if (currentFico < 700) return 700;
    if (currentFico < 720) return 720;
    if (currentFico < 740) return 740;
    return null; // Already at highest band
  } else { // FHA
    if (currentFico < 500) return null; // Below minimum FHA
    if (currentFico < 580) return 580;
    if (currentFico < 620) return 620;
    if (currentFico < 640) return 640;
    if (currentFico < 660) return 660;
    if (currentFico < 680) return 680;
    if (currentFico < 700) return 700;
    if (currentFico < 720) return 720;
    if (currentFico < 740) return 740;
    return null; // Already at highest band
  }
};

export const getLowerLtvOption = (currentLtv: number): number | null => {
  if (currentLtv > 97) return 97;
  if (currentLtv > 95) return 95;
  if (currentLtv > 90) return 90;
  if (currentLtv > 85) return 85;
  if (currentLtv > 80) return 80;
  if (currentLtv > 75) return 75;
  if (currentLtv > 70) return 70;
  if (currentLtv > 60) return 60;
  return null; // Already at lowest band
};
