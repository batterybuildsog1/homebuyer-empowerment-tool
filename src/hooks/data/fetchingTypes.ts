
export interface FetchProgressState {
  isLoading: boolean;
  progress: number;
  message: string;
  hasAttemptedFetch: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export interface CachedLoanData {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

export interface MortgageDataResponse {
  conventionalInterestRate: number;
  fhaInterestRate: number;
  propertyTax: number;
  propertyInsurance: number;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

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
