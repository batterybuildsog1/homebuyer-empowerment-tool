
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserData, MortgageContextType } from './types';
import { defaultUserData } from './defaultData';
import { saveToLocalStorage, loadFromLocalStorage } from './storage';

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
