
/**
 * Types for the mortgage calculator context
 */
export interface UserData {
  location: {
    city: string;
    state: string;
    zipCode: string;
    county: string;
  };
  financials: {
    annualIncome: number;
    monthlyDebts: number;
    ficoScore: number;
    downPayment: number;
    downPaymentPercent: number;
    mitigatingFactors: string[]; // Legacy field for backward compatibility
    selectedFactors: Record<string, string>; // New field for detailed compensating factors
    currentHousingPayment: number; // Current housing payment for payment shock calculation
    debtItems: {
      carLoan: number;
      studentLoan: number;
      creditCard: number;
      personalLoan: number;
      otherDebt: number;
    };
  };
  loanDetails: {
    loanType: 'conventional' | 'fha';
    ltv: number;
    calculatedDTI: number | null;
    propertyTax: number | null;
    propertyInsurance: number | null;
    interestRate: number | null;
    conventionalInterestRate: number | null;
    fhaInterestRate: number | null;
    upfrontMIP: number | null;
    ongoingMIP: number | null;
  };
  results: {
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
    };
  };
  goals: {
    targetFICO: number | null;
    targetDownPayment: number | null;
    monthlyExpenses: Record<string, number>;
    savingRate: number | null;
  };
  workflowCompleted?: boolean; // Add this property to fix the TypeScript error
}

export interface MortgageContextType {
  userData: UserData;
  currentStep: number;
  isLoadingData: boolean;
  workflowCompleted: boolean;
  setUserData: (data: UserData) => void;
  setCurrentStep: (step: number) => void;
  setIsLoadingData: (loading: boolean) => void;
  setWorkflowCompleted: (completed: boolean) => void;
  updateLocation: (location: Partial<UserData['location']>) => void;
  updateFinancials: (financials: Partial<UserData['financials']>) => void;
  updateLoanDetails: (loanDetails: Partial<UserData['loanDetails']>) => void;
  updateResults: (results: Partial<UserData['results']>) => void;
  updateGoals: (goals: Partial<UserData['goals']>) => void;
  resetCalculator: () => void;
  completeWorkflow: () => void;
  isMortgageWorkflowCompleted: () => boolean;
}
