
export interface DTIStatus {
  value: number;
  status: 'normal' | 'caution' | 'warning' | 'exceeded';
  message: string;
  helpText: string;
}

export interface DTILimits {
  frontEnd: {
    default: number;
    maximum: number;
    warning: number;
    hardCap: number | null;
  };
  backEnd: {
    default: number;
    maximum: number;
    warning: number;
    hardCap: number | null;
  };
}

/**
 * Financial details for mortgage results
 * Contains calculated DTI values and ratios
 */
export interface FinancialDetails {
  maxDTI: number;
  monthlyIncome: number;
  maxMonthlyDebtPayment: number;
  availableForMortgage: number;
  adjustedRate: number;
  strongFactorCount?: number;
  // New DTI specific properties
  frontEndDTI?: number;
  backEndDTI?: number;
  frontEndDTIStatus?: DTIStatus;
  backEndDTIStatus?: DTIStatus;
}
