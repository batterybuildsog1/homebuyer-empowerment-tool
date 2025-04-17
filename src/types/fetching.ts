/**
 * State for tracking data fetching progress
 */
export interface FetchProgressState {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  hasAttemptedFetch: boolean;
  progress: number;
  message: string;
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

/**
 * Props for DataSummary component
 */
export interface DataSummaryProps {
  loanType: 'conventional' | 'fha';
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  hasAttemptedFetch: boolean;
  isError: boolean;
  errorMessage: string | null;
  isLoading: boolean;
  onFetchData: (silent?: boolean) => Promise<boolean>;
}
