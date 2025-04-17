import { ReactNode } from 'react';

export interface DebtItem {
  description: string;
  monthlyPayment: number;
}

export interface SelectedFactors {
  cashReserves: string;
  residualIncome: string;
  housingPaymentIncrease: string;
  employmentHistory: string;
  creditUtilization: string;
  downPayment: string;
}

export interface UserData {
  location: {
    city: string;
    state: string;
    county: string;
    zipCode: string;
  };
  financials: {
    ficoScore: number;
    annualIncome: number;
    debtItems: DebtItem[];
    monthlyDebts: number;
    mitigatingFactors?: string[];
    selectedFactors?: SelectedFactors;
  };
  loanDetails: {
    loanType: 'conventional' | 'fha';
    ltv: number;
    calculatedDTI: number;
    propertyTax: number;
    propertyInsurance: number;
    interestRate: number;
    conventionalInterestRate: number;
    fhaInterestRate: number;
    upfrontMIP: number;
    ongoingMIP: number;
    dataSource?: string;
    dataTimestamp?: number;
  };
  goals: {
    renovations: number;
    additionalCash: number;
  };
  results: {
    maxHomePrice: number;
    monthlyPayment: number;
  };
}

export interface MortgageContextType {
  userData: UserData;
  currentStep: number;
  isLoadingData: boolean;
  workflowCompleted: boolean;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  setWorkflowCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  updateLocation: (location: Partial<UserData['location']>) => void;
  updateFinancials: (financials: Partial<UserData['financials']>) => void;
  updateLoanDetails: (loanDetails: Partial<UserData['loanDetails']>) => void;
  updateResults: (results: Partial<UserData['results']>) => void;
  updateGoals: (goals: Partial<UserData['goals']>) => void;
  resetCalculator: () => void;
  completeWorkflow: () => void;
  isMortgageWorkflowCompleted: () => boolean;
}
