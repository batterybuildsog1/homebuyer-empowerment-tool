
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

/**
 * Alias for formatPercent for backward compatibility
 */
export const formatPercentage = formatPercent;

/**
 * Returns a relative time string (e.g., "2 hours ago", "yesterday")
 * @param date The date to format
 * @returns Formatted relative time string
 */
export const getRelativeTimeString = (date: Date): string => {
  try {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    const diffInSeconds = Math.round(diffInMs / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);
    const diffInDays = Math.round(diffInHours / 24);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      // Format the date as MM/DD/YYYY
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'unknown';
  }
};
