
/**
 * Formats a number as currency
 * @param value The number to format as currency
 * @param fractionDigits The number of fraction digits to include
 * @returns A formatted currency string
 */
export const formatCurrency = (value: number | null, fractionDigits = 0): string => {
  if (value === null || isNaN(value)) return "N/A";
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "Error";
  }
};

/**
 * Formats a number as a percentage
 * @param value The decimal value to format as percentage
 * @param fractionDigits The number of fraction digits to include
 * @returns A formatted percentage string
 */
export const formatPercentage = (value: number, fractionDigits = 2): string => {
  if (isNaN(value)) return "N/A";
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch (error) {
    console.error("Error formatting percentage:", error);
    return "Error";
  }
};

/**
 * Formats a number with commas
 * @param value The number to format
 * @param fractionDigits The number of fraction digits to include
 * @returns A formatted number string
 */
export const formatNumber = (value: number | null, fractionDigits = 0): string => {
  if (value === null || isNaN(value)) return "N/A";
  
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch (error) {
    console.error("Error formatting number:", error);
    return "Error";
  }
};

/**
 * Parses a currency string to a number
 * @param value The currency string to parse
 * @returns A number or null if parsing fails
 */
export const parseCurrency = (value: string): number | null => {
  if (!value) return null;
  
  try {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const numericString = value.replace(/[^0-9.-]/g, '');
    const numericValue = parseFloat(numericString);
    return isNaN(numericValue) ? null : numericValue;
  } catch (error) {
    console.error("Error parsing currency:", error);
    return null;
  }
};
