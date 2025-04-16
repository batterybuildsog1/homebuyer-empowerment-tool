
import { DTI_LIMITS } from "../../constants/mortgageConstants";
import { createEnhancedFactors, countStrongFactors } from "./compensatingFactorsCalculator";

/**
 * Calculate maximum DTI based on loan parameters and compensating factors
 */
export function calculateMaxDTI(
  ficoScore: number,
  ltv: number,
  loanType: 'conventional' | 'fha',
  selectedFactors: Record<string, string> | string[] = {},
  monthlyDebts: number = 0,
  monthlyIncome: number = 0
): number {
  // Handle legacy array format
  if (Array.isArray(selectedFactors)) {
    const dtiLimits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS];
    let maxDTI = dtiLimits.BACK_END.DEFAULT;

    if (loanType === 'conventional') {
      if (ficoScore >= 720) maxDTI = dtiLimits.BACK_END.WARNING;
      if (selectedFactors.includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
      if (ltv <= 75) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
    } else {
      if (ficoScore >= 680) maxDTI = dtiLimits.BACK_END.WARNING;
      if (selectedFactors.includes('reserves')) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
      if (selectedFactors.length >= 2) {
        maxDTI = Math.max(maxDTI, dtiLimits.BACK_END.WARNING);
      }
    }
    
    return maxDTI;
  }

  // For conventional loans, use existing method
  if (loanType === 'conventional') {
    return calculateConventionalDTI(ficoScore, ltv, selectedFactors);
  }
  
  // Use centralized service for FHA loans
  const enhancedFactors = createEnhancedFactors(
    selectedFactors,
    ficoScore,
    monthlyDebts,
    monthlyIncome
  );
  
  const strongFactorCount = countStrongFactors(enhancedFactors);
  const dtiCap = strongFactorCount >= 2 ? 57 : 50;
  
  // Base DTI for FHA
  const baseDTI = DTI_LIMITS.FHA.BACK_END.DEFAULT;
  
  return Math.min(baseDTI + 5, dtiCap);
}

function calculateConventionalDTI(
  ficoScore: number,
  ltv: number,
  selectedFactors: Record<string, string> = {}
): number {
  // Start with base DTI
  let baseDTI = DTI_LIMITS.CONVENTIONAL.BACK_END.DEFAULT;
  
  // Add FICO-based adjustment
  if (ficoScore >= 720) baseDTI += 3;
  else if (ficoScore >= 680) baseDTI += 2;
  
  // LTV-based adjustment
  if (ltv <= 75) baseDTI += 3;
  else if (ltv <= 80) baseDTI += 2;
  
  return Math.min(baseDTI, DTI_LIMITS.CONVENTIONAL.BACK_END.HARD_CAP || 50);
}
