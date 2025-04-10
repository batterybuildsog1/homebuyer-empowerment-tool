
/**
 * Utility functions for formatting values in the application
 */

/**
 * Formats a number as USD currency
 * @param value Number to format as currency
 * @param minimumFractionDigits Minimum number of decimal places (default: 0)
 * @param maximumFractionDigits Maximum number of decimal places (default: 0)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 0
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

/**
 * Formats a number as a percentage
 * @param value Number to format as percentage
 * @param minimumFractionDigits Minimum number of decimal places (default: 0)
 * @param maximumFractionDigits Maximum number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercent = (
  value: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
};
