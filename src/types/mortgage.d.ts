
export interface MortgageDataResponse {
  conventionalInterestRate: number;
  fhaInterestRate: number;
  propertyTax: number;
  propertyInsurance: number;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
  fromCache?: boolean;
}
