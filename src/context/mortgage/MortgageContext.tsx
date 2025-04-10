
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserData, MortgageContextType } from './types';
import { defaultUserData } from './defaultData';
import { saveToLocalStorage, loadFromLocalStorage } from './storage';

/**
 * Helper function to get appropriate credit history option based on FICO score
 */
const getCreditHistoryOption = (ficoScore: number): string => {
  if (ficoScore >= 760) return "760+";
  if (ficoScore >= 720) return "720-759";
  return "none";
};

/**
 * Migration function to handle legacy data format
 */
const migrateUserData = (data: any): UserData => {
  // If no financials data or it's not properly structured, return with defaults
  if (!data.financials) return { ...defaultUserData, ...data };
  
  // Check if we need to migrate from legacy mitigatingFactors
  const hasLegacyFactors = Array.isArray(data.financials.mitigatingFactors);
  const hasMigratedFactors = data.financials.selectedFactors && 
                            typeof data.financials.selectedFactors === 'object';
  
  // If already migrated, just return the data
  if (hasMigratedFactors) return data as UserData;
  
  // Create default selectedFactors
  const selectedFactors = {
    cashReserves: "none",
    residualIncome: "none",
    housingPaymentIncrease: "none",
    employmentHistory: "none",
    creditUtilization: "none",
    downPayment: "none",
  };
  
  // If we have legacy factors, map them to the new structure
  if (hasLegacyFactors) {
    const legacyFactors = data.financials.mitigatingFactors as string[];
    
    // Map legacy factors to new structure
    if (legacyFactors.includes('reserves')) selectedFactors.cashReserves = '3-6 months';
    if (legacyFactors.includes('residualIncome')) selectedFactors.residualIncome = '20-30%';
    if (legacyFactors.includes('minimalDebt')) selectedFactors.housingPaymentIncrease = '<10%';
    
    // Set credit history based on FICO score
    const ficoScore = data.financials.ficoScore || 680;
    selectedFactors.creditUtilization = getCreditHistoryOption(ficoScore);
  }
  
  // Return migrated data
  return {
    ...data,
    financials: {
      ...data.financials,
      selectedFactors,
    },
  } as UserData;
};

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export const MortgageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load stored data on initialization or use default
  const [userData, setUserData] = useState<UserData>(() => {
    const savedData = loadFromLocalStorage();
    return savedData ? migrateUserData(savedData) : defaultUserData;
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
      localStorage.removeItem('mortgage_calculator_data');
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
