
export interface MortgageDataResponse {
  conventionalInterestRate: number;
  fhaInterestRate: number;
  propertyTax: number;
  propertyInsurance: number;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  fromCache?: boolean;
  errorCode?: string;
}
