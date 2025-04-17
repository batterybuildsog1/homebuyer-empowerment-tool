
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
  console.log("calculateMaxDTI called with factors:", selectedFactors, "loan type:", loanType);
  
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

  // Ensure we have proper factors
  const enhancedFactors = typeof selectedFactors === 'object' && !Array.isArray(selectedFactors)
    ? selectedFactors
    : {};
    
  console.log("Enhanced factors for DTI calculation:", enhancedFactors);
  
  // Count strong factors
  const strongFactorCount = countStrongFactors(enhancedFactors);
  console.log("Strong factor count:", strongFactorCount);
  
  // Set base DTI from limits based on loan type
  const dtiLimits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS].BACK_END;
  let baseDTI = dtiLimits.DEFAULT;
  
  if (loanType === 'conventional') {
    return calculateConventionalDTI(ficoScore, ltv, enhancedFactors);
  }
  
  // For FHA loans
  // Apply FICO adjustments
  if (ficoScore >= 720) baseDTI += 5;
  else if (ficoScore >= 680) baseDTI += 3;
  
  // Apply strong factor adjustments
  if (strongFactorCount >= 2) {
    baseDTI = Math.min(57, baseDTI + 7); // Cap at 57% with strong factors
  } else if (strongFactorCount === 1) {
    baseDTI = Math.min(50, baseDTI + 3); // Smaller increase with 1 strong factor
  }
  
  console.log("Calculated DTI:", baseDTI, "for loan type:", loanType);
  return baseDTI;
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
  
  // Count strong factors for compensating factors boost
  const strongFactorCount = countStrongFactors(selectedFactors);
  
  // Apply compensating factors adjustment
  if (strongFactorCount >= 2) {
    baseDTI = Math.min(50, baseDTI + 5); // Cap at 50% with 2+ strong factors
  } else if (strongFactorCount === 1) {
    baseDTI = Math.min(50, baseDTI + 2); // Smaller boost with 1 strong factor
  }
  
  console.log("Calculated conventional DTI:", baseDTI, "with strong factors:", strongFactorCount);
  return Math.min(baseDTI, DTI_LIMITS.CONVENTIONAL.BACK_END.HARD_CAP || 50);
}
