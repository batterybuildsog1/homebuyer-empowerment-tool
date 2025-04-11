
import { useState, useCallback } from 'react';

// Define types for financial data
interface FinancialData {
  income: {
    total: number;
    sources: Array<{ name: string; amount: number }>;
  };
  expenses: {
    total: number;
    categories: Array<{ name: string; amount: number }>;
  };
  savings: {
    total: number;
    rate: number;
    emergencyMonths: number;
    accounts: Array<{ name: string; balance: number }>;
  };
  debt: {
    total: number;
    dti: number;
    accounts: Array<{ name: string; balance: number; payment: number }>;
  };
  goals: Array<{
    id: string;
    title: string;
    target: number;
    deadline: string;
    progress: number;
  }>;
}

// Initial mock data
const mockFinancialData: FinancialData = {
  income: {
    total: 75000,
    sources: [
      { name: 'Primary Job', amount: 70000 },
      { name: 'Side Gig', amount: 5000 }
    ]
  },
  expenses: {
    total: 45000,
    categories: [
      { name: 'Housing', amount: 18000 },
      { name: 'Food', amount: 9000 },
      { name: 'Transportation', amount: 7000 },
      { name: 'Utilities', amount: 6000 },
      { name: 'Entertainment', amount: 5000 }
    ]
  },
  savings: {
    total: 25000,
    rate: 15,
    emergencyMonths: 3,
    accounts: [
      { name: 'Emergency Fund', balance: 12000 },
      { name: 'Vacation Fund', balance: 3000 },
      { name: 'Down Payment', balance: 10000 }
    ]
  },
  debt: {
    total: 40000,
    dti: 28,
    accounts: [
      { name: 'Student Loans', balance: 30000, payment: 350 },
      { name: 'Credit Card', balance: 5000, payment: 150 },
      { name: 'Car Loan', balance: 5000, payment: 200 }
    ]
  },
  goals: [
    {
      id: '1',
      title: 'Emergency Fund',
      target: 18000,
      deadline: '2025-12-31',
      progress: 66
    },
    {
      id: '2',
      title: 'Down Payment',
      target: 60000,
      deadline: '2026-06-30',
      progress: 16
    }
  ]
};

export function useFinancialData() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API request with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For now, use mock data
      // In a real implementation, this would be an API call
      setData(mockFinancialData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { data: data || mockFinancialData, loading, error, fetchData };
}
