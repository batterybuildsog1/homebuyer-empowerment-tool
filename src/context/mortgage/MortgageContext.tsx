
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserData, MortgageContextType } from './types';
import { defaultUserData } from './defaultData';
import { saveToLocalStorage, loadFromLocalStorage } from './storage';

// Interface for the data we're actually saving to localStorage (UserData + workflow state)
interface StoredMortgageData extends UserData {
  workflowCompleted?: boolean;
}

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
  const [workflowCompleted, setWorkflowCompleted] = useState<boolean>(() => {
    // Check if workflow has been completed before
    const savedData = loadFromLocalStorage() as StoredMortgageData | null;
    return savedData?.workflowCompleted || false;
  });

  // Save data whenever it changes
  useEffect(() => {
    const dataToSave: StoredMortgageData = {
      ...userData,
      workflowCompleted
    };
    saveToLocalStorage(dataToSave);
  }, [userData, workflowCompleted]);

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

  /** @deprecated This function is no longer used in the UI and will be removed in a future version */
  const resetCalculator = () => {
    if (window.confirm('Are you sure you want to reset all your data?')) {
      setUserData(defaultUserData);
      setCurrentStep(0);
      setWorkflowCompleted(false);
      localStorage.removeItem('mortgage_calculator_data');
    }
  };

  const completeWorkflow = () => {
    setWorkflowCompleted(true);
  };

  const isMortgageWorkflowCompleted = () => {
    // Check if essential mortgage data has been filled out
    return (
      workflowCompleted || 
      (userData.location.city && 
      userData.location.state && 
      userData.financials.annualIncome > 0 &&
      userData.results.maxHomePrice !== null && 
      userData.results.maxHomePrice > 0)
    );
  };

  return (
    <MortgageContext.Provider
      value={{
        userData,
        currentStep,
        isLoadingData,
        workflowCompleted,
        setUserData,
        setCurrentStep,
        setIsLoadingData,
        setWorkflowCompleted,
        updateLocation,
        updateFinancials,
        updateLoanDetails,
        updateResults,
        updateGoals,
        resetCalculator,
        completeWorkflow,
        isMortgageWorkflowCompleted
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
