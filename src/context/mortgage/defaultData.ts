
import { UserData } from './types';

/**
 * Default user data for the mortgage calculator
 */
export const defaultUserData: UserData = {
  location: {
    city: '',
    state: '',
    zipCode: '',
    county: '',
  },
  financials: {
    annualIncome: 0,
    monthlyDebts: 0,
    debtItems: [], // Ensure this is explicitly initialized as an empty array
    ficoScore: 680,
    downPayment: 0,
    downPaymentPercent: 20,
    mitigatingFactors: [],
    selectedFactors: {
      cashReserves: "none",
      residualIncome: "does not meet",
      housingPaymentIncrease: ">20%",
      employmentHistory: "<2 years",
      creditUtilization: ">30%",
      downPayment: "<5%",
    },
    currentHousingPayment: 0,
  },
  loanDetails: {
    loanType: 'conventional',
    ltv: 80,
    calculatedDTI: null,
    propertyTax: null,
    propertyInsurance: null,
    interestRate: null,
    conventionalInterestRate: null,
    fhaInterestRate: null,
    upfrontMIP: null,
    ongoingMIP: null,
  },
  results: {
    maxHomePrice: null,
    monthlyPayment: null,
    scenarios: [],
    financialDetails: undefined,
  },
  goals: {
    renovations: 0,
    additionalCash: 0,
    targetFICO: null,
    targetDownPayment: null,
    monthlyExpenses: {},
    savingRate: null,
  },
};
