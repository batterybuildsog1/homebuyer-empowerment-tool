
import { DTI_LIMITS } from "../constants/mortgageConstants";
import { DTIStatus } from "../types/dtiTypes";

/**
 * Evaluates the front-end DTI status
 */
export function evaluateFrontEndDTI(
  dtiValue: number,
  loanType: 'conventional' | 'fha',
  hasStrongFactors: boolean = false
): DTIStatus {
  const limits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS].FRONT_END;
  const defaultLimit = limits.DEFAULT;
  const warningThreshold = limits.WARNING;
  
  if (dtiValue <= defaultLimit) {
    return {
      value: dtiValue,
      status: 'normal',
      message: 'Housing expense ratio is within standard guidelines',
      helpText: `Your housing expenses are ${dtiValue.toFixed(1)}% of your monthly income, which is within the standard ${defaultLimit}% guideline for ${loanType.toUpperCase()} loans.`
    };
  } else if (dtiValue <= warningThreshold) {
    return {
      value: dtiValue,
      status: 'caution',
      message: `Housing ratio of ${dtiValue.toFixed(1)}% exceeds standard ${defaultLimit}%`,
      helpText: `While higher than the standard ${defaultLimit}% guideline, housing ratios up to ${warningThreshold}% are often acceptable with strong compensating factors like good credit or cash reserves.`
    };
  } else {
    return {
      value: dtiValue,
      status: 'warning',
      message: `Housing ratio of ${dtiValue.toFixed(1)}% exceeds ${warningThreshold}%`,
      helpText: `Housing ratios above ${warningThreshold}% may be difficult to qualify for. ${hasStrongFactors ? 'Your strong compensating factors may help, but' : 'Consider'} reducing your target home price or increasing your down payment.`
    };
  }
}

/**
 * Evaluates the back-end DTI status
 */
export function evaluateBackEndDTI(
  dtiValue: number,
  loanType: 'conventional' | 'fha',
  hasStrongFactors: boolean = false
): DTIStatus {
  const limits = DTI_LIMITS[loanType.toUpperCase() as keyof typeof DTI_LIMITS].BACK_END;
  const defaultLimit = limits.DEFAULT;
  const warningThreshold = limits.WARNING;
  const hardCap = limits.HARD_CAP || 59;
  
  if (dtiValue <= defaultLimit) {
    return {
      value: dtiValue,
      status: 'normal',
      message: 'Total debt ratio is within standard guidelines',
      helpText: `Your total debt obligations are ${dtiValue.toFixed(1)}% of your monthly income, which is within the standard ${defaultLimit}% guideline for ${loanType.toUpperCase()} loans.`
    };
  } else if (dtiValue <= warningThreshold) {
    return {
      value: dtiValue,
      status: 'caution',
      message: `Debt ratio of ${dtiValue.toFixed(1)}% exceeds standard ${defaultLimit}%`,
      helpText: `While higher than the standard ${defaultLimit}% guideline, debt ratios up to ${warningThreshold}% may be acceptable ${hasStrongFactors ? 'with your strong compensating factors' : 'if you have compensating factors like good credit or cash reserves'}.`
    };
  } else if (dtiValue <= hardCap) {
    return {
      value: dtiValue,
      status: 'warning',
      message: `Debt ratio of ${dtiValue.toFixed(1)}% approaching maximum ${hardCap}%`,
      helpText: `Debt ratios above ${warningThreshold}% require significant compensating factors. ${hasStrongFactors ? 'Even with your strong profile, this' : 'This'} may limit your loan options or require additional down payment.`
    };
  } else {
    return {
      value: dtiValue,
      status: 'exceeded',
      message: `Debt ratio of ${dtiValue.toFixed(1)}% exceeds maximum ${hardCap}%`,
      helpText: `Debt ratios above ${hardCap}% exceed lending guidelines. Consider reducing your target home price, increasing down payment, or reducing existing debt.`
    };
  }
}
