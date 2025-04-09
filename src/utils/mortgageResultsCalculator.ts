
import { UserData } from "@/context/MortgageContext";
import { 
  calculateAdjustedRate, 
  calculateMaxDTI, 
  calculateMaxPurchasePrice,
  calculateMonthlyPayment,
  getNextFicoBand,
  getLowerLtvOption,
  getFhaMipRates
} from "./mortgageCalculations";

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
  };
}

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
  
  console.log("Mortgage data validation passed");
  return null;
}

/**
 * Calculates mortgage results based on user data
 * @param userData User data from context
 * @returns Calculated mortgage results or null if validation fails
 */
export const calculateMortgageResults = (userData: UserData): MortgageResults | null => {
  console.log("Calculating mortgage results with data:", userData);
  
  const { financials, loanDetails } = userData;
  
  // Calculate the max DTI based on FICO score, LTV, and mitigating factors
  const maxDTI = calculateMaxDTI(
    financials.ficoScore,
    loanDetails.ltv,
    loanDetails.loanType,
    financials.mitigatingFactors
  );
  console.log("Calculated maxDTI:", maxDTI);
  
  // Calculate monthly income and available debt service
  const monthlyIncome = financials.annualIncome / 12;
  const maxMonthlyDebtPayment = monthlyIncome * (maxDTI / 100);
  const availableForMortgage = maxMonthlyDebtPayment - financials.monthlyDebts;
  console.log("Monthly income:", monthlyIncome, "Max monthly debt:", maxMonthlyDebtPayment, "Available for mortgage:", availableForMortgage);
  
  // Calculate the adjusted interest rate based on FICO and LTV
  const adjustedRate = calculateAdjustedRate(
    loanDetails.interestRate,
    financials.ficoScore,
    loanDetails.ltv,
    loanDetails.loanType
  );
  console.log("Adjusted interest rate:", adjustedRate);
  
  // Get MIP/PMI rate
  let pmiRate = 0;
  if (loanDetails.loanType === 'fha' && loanDetails.ongoingMIP) {
    pmiRate = loanDetails.ongoingMIP;
  } else if (loanDetails.ltv > 80) {
    // Simple PMI estimate based on LTV for conventional loans
    pmiRate = loanDetails.ltv > 95 ? 1.1 : 
              loanDetails.ltv > 90 ? 0.8 : 
              loanDetails.ltv > 85 ? 0.5 : 0.3;
  }
  console.log("PMI/MIP rate:", pmiRate);
  
  // Calculate max purchase price
  const maxPurchasePrice = calculateMaxPurchasePrice(
    financials.annualIncome,
    financials.monthlyDebts,
    maxDTI,
    adjustedRate,
    loanDetails.propertyTax,
    loanDetails.propertyInsurance || 1200, // Default to $1200 if not available
    100 - loanDetails.ltv, // Convert LTV to down payment %
    pmiRate
  );
  console.log("Calculated max purchase price:", maxPurchasePrice);
  
  // Calculate loan amount
  const loanAmount = maxPurchasePrice * (loanDetails.ltv / 100);
  
  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    adjustedRate,
    30, // 30-year term
    (loanDetails.propertyTax / 100) * maxPurchasePrice, // Annual property tax
    loanDetails.propertyInsurance || 1200, // Annual insurance
    pmiRate // PMI/MIP rate
  );
  console.log("Calculated monthly payment:", monthlyPayment);
  
  // Store the new financial details
  const financialDetails = {
    maxDTI,
    monthlyIncome,
    maxMonthlyDebtPayment,
    availableForMortgage,
    adjustedRate
  };
  
  // Generate alternative scenarios
  const scenarios = calculateAlternativeScenarios(
    userData,
    maxDTI,
    maxPurchasePrice
  );
  
  return {
    maxHomePrice: maxPurchasePrice,
    monthlyPayment: monthlyPayment,
    scenarios: scenarios,
    financialDetails: financialDetails,
  };
};

/**
 * Calculates alternative scenarios for mortgage
 * @param userData User data from context
 * @param maxDTI Maximum DTI calculated
 * @param baseMaxPrice Base maximum purchase price
 * @returns Array of alternative scenarios
 */
function calculateAlternativeScenarios(
  userData: UserData,
  maxDTI: number,
  baseMaxPrice: number
): MortgageResults['scenarios'] {
  const { financials, loanDetails } = userData;
  const scenarios = [];
  
  // Scenario 1: Switch loan type
  const alternativeLoanType = loanDetails.loanType === 'conventional' ? 'fha' : 'conventional';
  
  // Calculate for alternative loan type
  const altDTI = calculateMaxDTI(
    financials.ficoScore,
    loanDetails.ltv,
    alternativeLoanType,
    financials.mitigatingFactors
  );
  
  const altRate = calculateAdjustedRate(
    loanDetails.interestRate,
    financials.ficoScore,
    loanDetails.ltv,
    alternativeLoanType
  );
  
  // Get alternative MIP/PMI rate
  let altPmiRate = 0;
  if (alternativeLoanType === 'fha') {
    const mipRates = getFhaMipRates(baseMaxPrice * (loanDetails.ltv / 100), loanDetails.ltv);
    altPmiRate = mipRates.annualMipPercent;
  } else if (loanDetails.ltv > 80) {
    // Simple PMI estimate for conventional
    altPmiRate = loanDetails.ltv > 95 ? 1.1 : 
                loanDetails.ltv > 90 ? 0.8 : 
                loanDetails.ltv > 85 ? 0.5 : 0.3;
  }
  
  const altMaxPrice = calculateMaxPurchasePrice(
    financials.annualIncome,
    financials.monthlyDebts,
    altDTI,
    altRate,
    loanDetails.propertyTax,
    loanDetails.propertyInsurance || 1200,
    100 - loanDetails.ltv,
    altPmiRate
  );
  
  const altLoanAmount = altMaxPrice * (loanDetails.ltv / 100);
  
  const altMonthlyPayment = calculateMonthlyPayment(
    altLoanAmount,
    altRate,
    30,
    (loanDetails.propertyTax / 100) * altMaxPrice,
    loanDetails.propertyInsurance || 1200,
    altPmiRate
  );
  
  scenarios.push({
    loanType: alternativeLoanType,
    ficoChange: 0,
    ltvChange: 0,
    maxHomePrice: altMaxPrice,
    monthlyPayment: altMonthlyPayment,
  });
  
  // Scenario 2: Higher FICO score
  const nextFicoBand = getNextFicoBand(financials.ficoScore, loanDetails.loanType);
  
  if (nextFicoBand) {
    const betterFicoRate = calculateAdjustedRate(
      loanDetails.interestRate,
      nextFicoBand,
      loanDetails.ltv,
      loanDetails.loanType
    );
    
    let pmiRate = 0;
    if (loanDetails.loanType === 'fha' && loanDetails.ongoingMIP) {
      pmiRate = loanDetails.ongoingMIP;
    } else if (loanDetails.ltv > 80) {
      pmiRate = loanDetails.ltv > 95 ? 1.1 : 
                loanDetails.ltv > 90 ? 0.8 : 
                loanDetails.ltv > 85 ? 0.5 : 0.3;
    }
    
    const betterFicoPrice = calculateMaxPurchasePrice(
      financials.annualIncome,
      financials.monthlyDebts,
      maxDTI,
      betterFicoRate,
      loanDetails.propertyTax,
      loanDetails.propertyInsurance || 1200,
      100 - loanDetails.ltv,
      pmiRate
    );
    
    const betterFicoLoan = betterFicoPrice * (loanDetails.ltv / 100);
    
    const betterFicoPayment = calculateMonthlyPayment(
      betterFicoLoan,
      betterFicoRate,
      30,
      (loanDetails.propertyTax / 100) * betterFicoPrice,
      loanDetails.propertyInsurance || 1200,
      pmiRate
    );
    
    scenarios.push({
      loanType: loanDetails.loanType,
      ficoChange: nextFicoBand - financials.ficoScore,
      ltvChange: 0,
      maxHomePrice: betterFicoPrice,
      monthlyPayment: betterFicoPayment,
    });
  }
  
  // Scenario 3: Lower LTV (higher down payment)
  const lowerLtv = getLowerLtvOption(loanDetails.ltv);
  
  if (lowerLtv) {
    // Recalculate PMI based on lower LTV
    let lowerLtvPmiRate = 0;
    if (loanDetails.loanType === 'fha') {
      const mipRates = getFhaMipRates(baseMaxPrice * (loanDetails.ltv / 100), lowerLtv);
      lowerLtvPmiRate = mipRates.annualMipPercent;
    } else if (lowerLtv > 80) {
      lowerLtvPmiRate = lowerLtv > 95 ? 1.1 : 
                  lowerLtv > 90 ? 0.8 : 
                  lowerLtv > 85 ? 0.5 : 0.3;
    }
    
    const lowerLtvRate = calculateAdjustedRate(
      loanDetails.interestRate,
      financials.ficoScore,
      lowerLtv,
      loanDetails.loanType
    );
    
    const lowerLtvPrice = calculateMaxPurchasePrice(
      financials.annualIncome,
      financials.monthlyDebts,
      maxDTI,
      lowerLtvRate,
      loanDetails.propertyTax,
      loanDetails.propertyInsurance || 1200,
      100 - lowerLtv,
      lowerLtvPmiRate
    );
    
    const lowerLtvLoan = lowerLtvPrice * (lowerLtv / 100);
    
    const lowerLtvPayment = calculateMonthlyPayment(
      lowerLtvLoan,
      lowerLtvRate,
      30,
      (loanDetails.propertyTax / 100) * lowerLtvPrice,
      loanDetails.propertyInsurance || 1200,
      lowerLtvPmiRate
    );
    
    scenarios.push({
      loanType: loanDetails.loanType,
      ficoChange: 0,
      ltvChange: lowerLtv - loanDetails.ltv,
      maxHomePrice: lowerLtvPrice,
      monthlyPayment: lowerLtvPayment,
    });
  }
  
  return scenarios;
}
