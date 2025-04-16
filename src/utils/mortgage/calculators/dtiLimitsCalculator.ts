/**
 * DTI Limits Calculator
 * 
 * This module provides functions for calculating DTI limits based on loan type
 * and the presence of compensating factors.
 */

import { DTI_LIMITS } from "../constants/mortgageConstants";

/**
 * Calculate DTI limits based on loan type and compensating factors
 * 
 * @param loanType - Type of loan ('conventional' or 'fha')
 * @param hasStrongFactors - Whether the borrower has strong compensating factors
 * @returns Object containing front-end and back-end DTI limits
 */
export function calculateDTILimits(
  loanType: 'conventional' | 'fha',
  hasStrongFactors: boolean = false
): {
  frontEnd: number;
  backEnd: number;
} {
  const limits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS];
  
  // Front-end DTI limit
  const frontEndLimit = limits.FRONT_END.DEFAULT;
  
  // Back-end DTI limit with compensating factors adjustments
  let backEndLimit = limits.BACK_END.DEFAULT;
  
  if (hasStrongFactors) {
    // With strong compensating factors, allow higher DTI limits
    backEndLimit = loanType === 'fha' ? 57 : 50;
  } else if (loanType === 'conventional' && limits.BACK_END.WARNING) {
    // For conventional loans without strong factors, use the warning threshold
    backEndLimit = limits.BACK_END.WARNING;
  }
  
  return {
    frontEnd: frontEndLimit,
    backEnd: backEndLimit
  };
}
