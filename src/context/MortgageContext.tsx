
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Storage key for localStorage
const STORAGE_KEY = 'mortgage_calculator_data';

// Save data to localStorage
const saveToLocalStorage = (data: UserData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Load data from localStorage
const loadFromLocalStorage = (): UserData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

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
    mitigatingFactors: string[];
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
    conventionalInterestRate: number | null; // Conventional interest rate
    fhaInterestRate: number | null; // FHA interest rate
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
  };
  goals: {
    targetFICO: number | null;
    targetDownPayment: number | null;
    monthlyExpenses: Record<string, number>;
    savingRate: number | null;
  };
}

interface MortgageContextType {
  userData: UserData;
  currentStep: number;
  isLoadingData: boolean;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  updateLocation: (location: Partial<UserData['location']>) => void;
  updateFinancials: (financials: Partial<UserData['financials']>) => void;
  updateLoanDetails: (loanDetails: Partial<UserData['loanDetails']>) => void;
  updateResults: (results: Partial<UserData['results']>) => void;
  updateGoals: (goals: Partial<UserData['goals']>) => void;
  resetCalculator: () => void;
}

const defaultUserData: UserData = {
  location: {
    city: '',
    state: '',
    zipCode: '',
    county: '',
  },
  financials: {
    annualIncome: 0,
    monthlyDebts: 0,
    ficoScore: 680,
    downPayment: 0,
    downPaymentPercent: 20,
    mitigatingFactors: [],
    debtItems: {
      carLoan: 0,
      studentLoan: 0,
      creditCard: 0,
      personalLoan: 0,
      otherDebt: 0
    },
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
  },
  goals: {
    targetFICO: null,
    targetDownPayment: null,
    monthlyExpenses: {},
    savingRate: null,
  },
};

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export const MortgageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load stored data on initialization or use default
  const [userData, setUserData] = useState<UserData>(() => {
    const savedData = loadFromLocalStorage();
    return savedData || defaultUserData;
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Save data whenever it changes
  useEffect(() => {
    saveToLocalStorage(userData);
  }, [userData]);

  const updateLocation = (location: Partial<UserData['location']>) => {
    setUserData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        ...location,
      },
    }));
  };

  const updateFinancials = (financials: Partial<UserData['financials']>) => {
    setUserData((prev) => ({
      ...prev,
      financials: {
        ...prev.financials,
        ...financials,
      },
    }));
  };

  const updateLoanDetails = (loanDetails: Partial<UserData['loanDetails']>) => {
    setUserData((prev) => ({
      ...prev,
      loanDetails: {
        ...prev.loanDetails,
        ...loanDetails,
      },
    }));
  };

  const updateResults = (results: Partial<UserData['results']>) => {
    setUserData((prev) => ({
      ...prev,
      results: {
        ...prev.results,
        ...results,
      },
    }));
  };

  const updateGoals = (goals: Partial<UserData['goals']>) => {
    setUserData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        ...goals,
      },
    }));
  };

  const resetCalculator = () => {
    if (window.confirm('Are you sure you want to reset all your data?')) {
      setUserData(defaultUserData);
      setCurrentStep(0);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <MortgageContext.Provider
      value={{
        userData,
        currentStep,
        isLoadingData,
        setUserData,
        setCurrentStep,
        setIsLoadingData,
        updateLocation,
        updateFinancials,
        updateLoanDetails,
        updateResults,
        updateGoals,
        resetCalculator,
      }}
    >
      {children}
    </MortgageContext.Provider>
  );
};

export const useMortgage = () => {
  const context = useContext(MortgageContext);
  if (context === undefined) {
    throw new Error('useMortgage must be used within a MortgageProvider');
  }
  return context;
};
