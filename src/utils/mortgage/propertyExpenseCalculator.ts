
import { PROPERTY_EXPENSES } from "../constants/mortgageConstants";

/**
 * Calculate monthly property tax from percentage
 * @param propertyValue Property value
 * @param taxRatePercent Annual property tax percentage
 * @returns Monthly property tax amount
 */
export function calculateMonthlyPropertyTax(
  propertyValue: number,
  taxRatePercent: number = PROPERTY_EXPENSES.DEFAULT_PROPERTY_TAX_PERCENT
): number {
  const annualTax = (propertyValue * taxRatePercent) / PROPERTY_EXPENSES.PERCENT_DIVISOR;
  return annualTax / 12;
}

/**
 * Calculate monthly insurance from annual amount
 * @param annualInsurance Annual insurance amount
 * @returns Monthly insurance amount
 */
export function calculateMonthlyInsurance(
  annualInsurance: number = PROPERTY_EXPENSES.DEFAULT_PROPERTY_INSURANCE
): number {
  return annualInsurance / 12;
}

/**
 * Convert property tax percentage to annual amount
 * @param propertyValue Property value
 * @param taxRatePercent Annual property tax percentage
 * @returns Annual property tax amount
 */
export function calculateAnnualPropertyTax(
  propertyValue: number,
  taxRatePercent: number = PROPERTY_EXPENSES.DEFAULT_PROPERTY_TAX_PERCENT
): number {
  return (propertyValue * taxRatePercent) / PROPERTY_EXPENSES.PERCENT_DIVISOR;
}
