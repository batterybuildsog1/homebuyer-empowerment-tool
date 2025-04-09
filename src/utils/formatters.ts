
/**
 * Formats a number as currency
 * @param value The number to format as currency
 * @param fractionDigits The number of fraction digits to include
 * @returns A formatted currency string
 */
export const formatCurrency = (value: number, fractionDigits = 0): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

/**
 * Formats a number as a percentage
 * @param value The decimal value to format as percentage
 * @param fractionDigits The number of fraction digits to include
 * @returns A formatted percentage string
 */
export const formatPercentage = (value: number, fractionDigits = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};
