
import { UserData } from "@/context/MortgageContext";
import { validateMortgageData } from "./validationUtils";
import { calculateMortgageResults as calculateResults } from "./coreCalculator";
import { FinancialDetails } from "./mortgage/types/dtiTypes";
import { ImprovementScenario } from "@/context/mortgage/types";

export interface MortgageResults {
  maxHomePrice: number | null;
  monthlyPayment: number | null;
  scenarios: ImprovementScenario[];
  financialDetails?: FinancialDetails;
}

// Re-export the functions from the separate files
export { validateMortgageData } from "./validationUtils";
export const calculateMortgageResults = calculateResults;
