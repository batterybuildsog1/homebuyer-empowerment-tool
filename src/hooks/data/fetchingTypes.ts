
/**
 * The progress state for data fetching operations
 */
export interface FetchProgressState {
  isLoading: boolean;
  progress: number;
  message: string;
  hasAttemptedFetch: boolean;
}

/**
 * Cached loan data structure
 */
export interface CachedLoanData {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}
