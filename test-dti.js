// DTI Implementation Test Script
console.log("Testing DTI Implementation...");

// Import using direct path with extension (for browser/node ES module)
import {
  calculateMaxDTI,
  compensatingFactors,
  countStrongFactors,
  getNonHousingDTIOption,
  createEnhancedFactors,
  prepareDTICalculationData
} from './src/utils/mortgageCalculations.ts';

// Test data
const testData = {
  ficoScore: 720,
  ltv: 85,
  loanType: 'fha',
  monthlyDebts: 500,
  monthlyIncome: 6000,
  selectedFactors: {
    cashReserves: "3-5 months",
    residualIncome: "does not meet",
    housingPaymentIncrease: "<10%",
    employmentHistory: "2-5 years",
    creditUtilization: "<10%",
    downPayment: "5-10%"
  }
};

// Test 1: Check non-housing DTI calculation
console.log("\n== Testing Non-Housing DTI Calculation ==");
const nonHousingDTI = getNonHousingDTIOption(testData.monthlyDebts, testData.monthlyIncome);
console.log(`Non-housing DTI for $${testData.monthlyDebts} debts and $${testData.monthlyIncome} income: ${nonHousingDTI}`);
console.log(`Expected: "<5%" (${(testData.monthlyDebts / testData.monthlyIncome) * 100}%)`);

// Test 2: Create enhanced factors
console.log("\n== Testing Enhanced Factors Creation ==");
const enhancedFactors = createEnhancedFactors(
  testData.selectedFactors,
  testData.ficoScore,
  testData.monthlyDebts,
  testData.monthlyIncome
);
console.log("Enhanced Factors:", JSON.stringify(enhancedFactors, null, 2));
console.log("Credit History should be automatically set based on FICO score");
console.log("Non-housing DTI should be calculated based on debts and income");

// Test 3: Count strong factors
console.log("\n== Testing Strong Factors Counting ==");
const strongFactorCount = countStrongFactors(enhancedFactors);
console.log(`Strong factor count: ${strongFactorCount}`);
console.log("Expected strong factors (if any):");
Object.entries(enhancedFactors).forEach(([factor, value]) => {
  if (['cashReserves', 'residualIncome', 'creditHistory', 'nonHousingDTI'].includes(factor)) {
    console.log(`  ${factor}: ${value} (Strong if: cashReserves="6+ months", residualIncome="meets VA guidelines", creditHistory="760+", nonHousingDTI="<5%")`);
  }
});

// Test 4: DTI calculation with strong factors
console.log("\n== Testing DTI Calculation ==");
// Case 1: Regular case (no strong factors)
const regularDTI = calculateMaxDTI(
  testData.ficoScore,
  testData.ltv,
  testData.loanType,
  testData.selectedFactors,
  testData.monthlyDebts,
  testData.monthlyIncome
);
console.log(`Regular DTI calculation: ${regularDTI}%`);

// Case 2: With 2+ strong factors (modify test data)
const strongFactorsTest = {
  ...testData,
  ficoScore: 780, // Strong factor: 760+
  selectedFactors: {
    ...testData.selectedFactors,
    cashReserves: "6+ months", // Strong factor
    residualIncome: "meets VA guidelines" // Strong factor
  }
};

const strongFactorsDTI = calculateMaxDTI(
  strongFactorsTest.ficoScore,
  strongFactorsTest.ltv,
  strongFactorsTest.loanType,
  strongFactorsTest.selectedFactors,
  strongFactorsTest.monthlyDebts,
  strongFactorsTest.monthlyIncome
);
console.log(`Strong factors DTI calculation: ${strongFactorsDTI}%`);
console.log("With 3 strong factors, we expect the cap to be 57% for FHA loans");

// Test 5: Prepare DTI calculation data
console.log("\n== Testing DTI Calculation Preparation ==");
const preparedData = prepareDTICalculationData(
  testData.ficoScore,
  testData.ltv,
  testData.loanType,
  testData.selectedFactors,
  testData.monthlyDebts,
  testData.monthlyIncome
);
console.log("Prepared DTI data:", JSON.stringify(preparedData, null, 2));
console.log(`DTI cap: ${preparedData.dtiCap}%`);
console.log(`Strong factor count from preparation: ${preparedData.strongFactorCount}`);

console.log("\nDTI Implementation Testing Complete!");
