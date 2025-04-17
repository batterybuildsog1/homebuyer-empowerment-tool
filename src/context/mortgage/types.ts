
import { ReactNode } from 'react';
import { DTIStatus } from '@/utils/mortgage/types/dtiTypes';

export interface DebtItem {
  description: string;
  monthlyPayment: number;
}

export interface DebtItems {
  carLoan: number;
  studentLoan: number;
  creditCard: number;
  personalLoan: number;
  otherDebt: number;
  [key: string]: number;
}

export interface SelectedFactors {
  cashReserves: string;
  residualIncome: string;
  housingPaymentIncrease: string;
  employmentHistory: string;
  creditUtilization: string;
  downPayment: string;
  [key: string]: string;
}

export interface ImprovementScenario {
  name: string;
  description: string;
  increase: number;
  maxHomePrice: number;
  monthlyPayment: number;
  loanType: 'conventional' | 'fha';
  ficoChange: number;
  ltvChange: number;
}

export interface FinancialDetails {
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
    currentHousingPayment?: number;
    downPayment?: number;
    downPaymentPercent?: number;
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
    dataSource?: string;
    dataTimestamp?: number;
  };
  goals: {
    renovations: number;
    additionalCash: number;
    targetFICO?: number | null;
    targetDownPayment?: number | null;
    monthlyExpenses?: Record<string, number>;
    savingRate?: number | null;
  };
  results: {
    maxHomePrice: number | null;
    monthlyPayment: number | null;
    financialDetails?: FinancialDetails;
    scenarios?: ImprovementScenario[];
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
