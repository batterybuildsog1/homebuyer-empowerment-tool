/**
 * Mortgage data response from API or cache
 */
export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
  rateDate?: string;
  source?: string;
  fromCache?: boolean;
  ageInDays?: number;
}

/**
 * Cached mortgage data with location context
 */
export interface CachedMortgageData extends MortgageDataResponse {
  state: string;
  county: string;
  zipCode?: string;
  timestamp: number;
}

/**
 * County property data structure
 */
export interface CountyPropertyData {
  state: string;
  county: string;
  primary_tax: number;
  general_tax: number;
  insurance: number;
  last_fetched: string;
}
