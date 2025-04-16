
import { getCreditHistoryOption } from "../utils/creditUtils";

/**
 * Options for non-housing DTI
 */
export const NonHousingDTIOption = {
  HIGH: ">10%",
  MODERATE: "5-10%",
  LOW: "<5%"
} as const;

/**
 * Get non-housing DTI option based on debts and income
 */
export function getNonHousingDTIOption(monthlyDebts: number, monthlyIncome: number): string {
  if (monthlyIncome <= 0) return NonHousingDTIOption.HIGH;
  
  const nonHousingDTIPercentage = (monthlyDebts / monthlyIncome) * 100;
  if (nonHousingDTIPercentage < 5) return NonHousingDTIOption.LOW;
  if (nonHousingDTIPercentage <= 10) return NonHousingDTIOption.MODERATE;
  return NonHousingDTIOption.HIGH;
}

/**
 * Check if a factor is considered "strong"
 */
export function isStrongFactor(factor: string, value: string): boolean {
  const strongFactorMap: Record<string, string[]> = {
    creditHistory: ["760+"],
    cashReserves: ["6+ months"],
    nonHousingDTI: ["<5%"],
    residualIncome: ["meets VA guidelines"]
  };
  
  return strongFactorMap[factor]?.includes(value) || false;
}

/**
 * Count strong compensating factors
 */
export function countStrongFactors(selectedFactors: Record<string, string>): number {
  return Object.entries(selectedFactors)
    .reduce((count, [factor, value]) => 
      count + (isStrongFactor(factor, value) ? 1 : 0), 0);
}

/**
 * Create enhanced factors with calculated values
 */
export function createEnhancedFactors(
  selectedFactors: Record<string, string>,
  ficoScore: number,
  monthlyDebts: number,
  monthlyIncome: number
): Record<string, string> {
  const creditHistoryOption = getCreditHistoryOption(ficoScore);
  const nonHousingDTIOption = getNonHousingDTIOption(monthlyDebts, monthlyIncome);
  
  return {
    ...selectedFactors,
    creditHistory: creditHistoryOption,
    nonHousingDTI: nonHousingDTIOption
  };
}
