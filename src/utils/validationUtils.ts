
import { UserData } from "@/context/MortgageContext";
import { compensatingFactors } from "./mortgageCalculations";

/**
 * Validates if mortgage calculation can be performed
 * @param userData User data from context
 * @returns An error message if validation fails, null if validation passes
 */
export const validateMortgageData = (userData: UserData): string | null => {
  console.log("Validating mortgage data:", userData);
  const { financials, loanDetails, location } = userData;
  
  if (!location.city || !location.state || !location.zipCode) {
    console.log("Location validation failed");
    return "Please complete your location information in Step 1.";
  }
  
  if (!financials.annualIncome || financials.annualIncome <= 0) {
    console.log("Income validation failed");
    return "Please enter your annual income in Step 2.";
  }
  
  if (!loanDetails.interestRate || loanDetails.interestRate <= 0) {
    console.log("Interest rate validation failed");
    return "Required loan details are missing. Please complete Step 3.";
  }
  
  if (!loanDetails.propertyTax || loanDetails.propertyTax <= 0) {
    console.log("Property tax validation failed");
    return "Property tax information is missing. Please complete Step 3.";
  }
  
  // Validate selectedFactors if present, but don't block calculations
  if (financials.selectedFactors) {
    const selectedFactors = financials.selectedFactors;
    const requiredFactors = Object.keys(compensatingFactors);
    
    for (const factor of requiredFactors) {
      if (!(factor in selectedFactors)) {
        console.log(`Missing compensating factor: ${factor}, defaulting to "none"`);
        // We'll let the calculator handle this with defaults
      } else if (selectedFactors[factor] && 
                 !compensatingFactors[factor][selectedFactors[factor]]) {
        console.log(`Invalid option for factor ${factor}: ${selectedFactors[factor]}`);
        // Log the issue but don't block calculation - it will use defaults
      }
    }
  }
  
  console.log("Mortgage data validation passed");
  return null;
}
