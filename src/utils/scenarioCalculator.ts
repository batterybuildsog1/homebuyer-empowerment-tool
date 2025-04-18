
import { UserData } from "@/context/MortgageContext";
import { ImprovementScenario } from "@/context/mortgage/types";
import { 
  calculateAdjustedRate, 
  calculateMaxDTI, 
  calculateMaxPurchasePrice,
  calculateMonthlyPayment,
  getNextFicoBand,
  getLowerLtvOption,
  getFhaMipRates,
  compensatingFactors
} from "./mortgageCalculations";

/**
 * Calculates alternative scenarios for mortgage
 * @param userData User data from context
 * @param maxDTI Maximum DTI calculated
 * @param baseMaxPrice Base maximum purchase price
 * @returns Array of alternative scenarios
 */
export function calculateAlternativeScenarios(
  userData: UserData,
  maxDTI: number,
  baseMaxPrice: number
): ImprovementScenario[] {
  const { financials, loanDetails } = userData;
  const scenarios: ImprovementScenario[] = [];
  
  // Create safe selectedFactors with defaults
  const userSelectedFactors = financials.selectedFactors || {};
  const safeSelectedFactors = Object.keys(compensatingFactors).reduce((acc, factor) => {
    acc[factor] = userSelectedFactors[factor] || "none";
    return acc;
  }, {} as Record<string, string>);
  
  // Prepare enhanced factors with calculated DTI
  const monthlyIncome = financials.annualIncome / 12;
  const nonHousingDTI = financials.monthlyDebts > 0 && monthlyIncome > 0 
    ? (financials.monthlyDebts / monthlyIncome) * 100 
    : 0;
  
  // Add calculated values to factors
  const enhancedFactors = {
    ...safeSelectedFactors,
    nonHousingDTI: nonHousingDTI < 5 ? "<5%" : nonHousingDTI <= 10 ? "5-10%" : ">10%"
  };
  
  // Scenario 1: Switch loan type
  const alternativeLoanType = loanDetails.loanType === 'conventional' ? 'fha' : 'conventional';
  
  // Calculate for alternative loan type
  const altDTI = calculateMaxDTI(
    financials.ficoScore,
    loanDetails.ltv,
    alternativeLoanType,
    enhancedFactors,
    financials.monthlyDebts,
    monthlyIncome
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
  
  const altLoanTypeIncrease = altMaxPrice - baseMaxPrice;
  
  scenarios.push({
    name: `Switch to ${alternativeLoanType.toUpperCase()} loan`,
    description: `Using a ${alternativeLoanType.toUpperCase()} loan could ${altLoanTypeIncrease > 0 ? 'increase' : 'decrease'} your buying power`,
    increase: altLoanTypeIncrease,
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
    
    const ficoIncrease = betterFicoPrice - baseMaxPrice;
    const ficoChange = nextFicoBand - financials.ficoScore;
    
    scenarios.push({
      name: `Improve your FICO score by ${ficoChange} points`,
      description: `Increasing your FICO score to ${nextFicoBand} could ${ficoIncrease > 0 ? 'increase' : 'decrease'} your buying power`,
      increase: ficoIncrease,
      loanType: loanDetails.loanType,
      ficoChange: ficoChange,
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
    
    const ltvIncrease = lowerLtvPrice - baseMaxPrice;
    const downPaymentChange = loanDetails.ltv - lowerLtv;
    
    scenarios.push({
      name: `Increase down payment by ${downPaymentChange}%`,
      description: `A ${100 - lowerLtv}% down payment could ${ltvIncrease > 0 ? 'increase' : 'decrease'} your buying power`,
      increase: ltvIncrease,
      loanType: loanDetails.loanType,
      ficoChange: 0,
      ltvChange: lowerLtv - loanDetails.ltv,
      maxHomePrice: lowerLtvPrice,
      monthlyPayment: lowerLtvPayment,
    });
  }
  
  return scenarios;
}
