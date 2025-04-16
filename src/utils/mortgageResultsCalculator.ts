
import { UserData } from "@/context/MortgageContext";
import { validateMortgageData } from "./validationUtils";
import { calculateMortgageResults as calculateResults } from "./coreCalculator";
import { DTIStatus } from "./mortgage/types/dtiTypes";

export interface MortgageResults {
  maxHomePrice: number | null;
  monthlyPayment: number | null;
  scenarios: {
    loanType: 'conventional' | 'fha';
    ficoChange: number;
    ltvChange: number;
    maxHomePrice: number;
    monthlyPayment: number;
  }[];
  financialDetails?: {
    maxDTI: number;
    monthlyIncome: number;
    maxMonthlyDebtPayment: number;
    availableForMortgage: number;
    adjustedRate: number;
    strongFactorCount?: number;
    frontEndDTI?: number;
    backEndDTI?: number;
    frontEndDTIStatus?: DTIStatus;
    backEndDTIStatus?: DTIStatus;
  };
}

// Re-export the functions from the separate files
export { validateMortgageData } from "./validationUtils";
export const calculateMortgageResults = calculateResults;
