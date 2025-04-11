
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultUserData } from "@/context/mortgage/defaultData";

// Define TypeScript interfaces for our store
interface Transaction {
  amount: number;
  category: string[];
  date: string;
  name: string;
  id: string;
}

interface CategoryData {
  total: number;
  subcategories: Record<string, number>;
}

interface ExpensesState {
  transactions: Transaction[];
  categorizedExpenses: Record<string, CategoryData>;
  totalExpenses: number;
  lastUpdated: Date | null;
}

interface IncomeState {
  sources: Array<{ name: string; amount: number; frequency: string }>;
  totalIncome: number;
}

interface SavingsState {
  accounts: Array<{ name: string; balance: number; type: string }>;
  totalSavings: number;
  rate: number;
  emergencyMonths: number;
}

interface DebtState {
  accounts: Array<{ name: string; balance: number; rate: number }>;
  total: number;
  dti: number;
}

interface GoalsState {
  goals: Array<{
    id: string;
    title: string;
    target: number;
    deadline: string;
    progress: number;
  }>;
}

interface FinancialState {
  mortgage: {
    userData: typeof defaultUserData;
    currentStep: number;
    isLoadingData: boolean;
  };
  expenses: ExpensesState;
  income: IncomeState;
  savings: SavingsState;
  debt: DebtState;
  goals: GoalsState;
  
  // Actions
  updateMortgage: (updates: Partial<FinancialState['mortgage']>) => void;
  updateExpenses: (updates: Partial<ExpensesState>) => void;
  updateIncome: (updates: Partial<IncomeState>) => void;
  updateSavings: (updates: Partial<SavingsState>) => void;
  updateDebt: (updates: Partial<DebtState>) => void;
  updateGoals: (updates: Partial<GoalsState>) => void;
  processPlaidTransactions: (transactions: Transaction[]) => void;
  refreshData: () => Promise<void>;
}

// Mock data for initial state
const mockCategories: Record<string, CategoryData> = {
  'Housing': { 
    total: 1800, 
    subcategories: { 'Rent': 1500, 'Utilities': 300 } 
  },
  'Food': { 
    total: 600, 
    subcategories: { 'Groceries': 400, 'Dining Out': 200 } 
  },
  'Transportation': { 
    total: 400, 
    subcategories: { 'Gas': 200, 'Maintenance': 100, 'Public Transit': 100 } 
  },
  'Personal': { 
    total: 300, 
    subcategories: { 'Shopping': 150, 'Entertainment': 150 } 
  },
  'Healthcare': { 
    total: 200, 
    subcategories: { 'Insurance': 150, 'Medications': 50 } 
  }
};

// Create the store with persistence
const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      mortgage: {
        userData: defaultUserData,
        currentStep: 0,
        isLoadingData: false,
      },
      expenses: {
        transactions: [],
        categorizedExpenses: mockCategories,
        totalExpenses: Object.values(mockCategories).reduce((sum, cat) => sum + cat.total, 0),
        lastUpdated: new Date(),
      },
      income: {
        sources: [
          { name: 'Primary Job', amount: 5000, frequency: 'monthly' },
          { name: 'Side Gig', amount: 1000, frequency: 'monthly' }
        ],
        totalIncome: 72000, // Annual income
      },
      savings: {
        accounts: [
          { name: 'Emergency Fund', balance: 10000, type: 'savings' },
          { name: 'Down Payment', balance: 25000, type: 'savings' },
        ],
        totalSavings: 35000,
        rate: 15, // Savings rate as percentage of income
        emergencyMonths: 3,
      },
      debt: {
        accounts: [
          { name: 'Student Loans', balance: 25000, rate: 4.5 },
          { name: 'Car Loan', balance: 15000, rate: 3.2 },
        ],
        total: 40000,
        dti: 28, // Debt-to-income ratio
      },
      goals: {
        goals: [
          {
            id: '1',
            title: 'Save for Down Payment',
            target: 50000,
            deadline: '2025-12-31',
            progress: 50,
          },
          {
            id: '2',
            title: 'Pay off Student Loans',
            target: 25000,
            deadline: '2026-06-30',
            progress: 20,
          }
        ],
      },
      
      // Actions
      updateMortgage: (updates) => set((state) => ({ 
        mortgage: { ...state.mortgage, ...updates } 
      })),
      
      updateExpenses: (updates) => set((state) => ({ 
        expenses: { ...state.expenses, ...updates } 
      })),
      
      updateIncome: (updates) => set((state) => ({ 
        income: { ...state.income, ...updates } 
      })),
      
      updateSavings: (updates) => set((state) => ({ 
        savings: { ...state.savings, ...updates } 
      })),
      
      updateDebt: (updates) => set((state) => ({ 
        debt: { ...state.debt, ...updates } 
      })),
      
      updateGoals: (updates) => set((state) => ({ 
        goals: { ...state.goals, ...updates } 
      })),
      
      processPlaidTransactions: (transactions) => {
        const categorized = categorizeTransactions(transactions);
        const total = Object.values(categorized).reduce(
          (sum, cat) => sum + cat.total, 0
        );
        
        set((state) => ({
          expenses: {
            ...state.expenses,
            transactions,
            categorizedExpenses: categorized,
            totalExpenses: total,
            lastUpdated: new Date(),
          },
        }));
      },
      
      refreshData: async () => {
        // This would normally call an API to get fresh data
        const state = get();
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get mock transactions
          const transactions = await fetchTransactionsFromPlaid();
          
          // Update the store with new transactions
          state.processPlaidTransactions(transactions);
          
          return Promise.resolve();
        } catch (error) {
          console.error("Error refreshing data:", error);
          return Promise.reject(error);
        }
      },
    }),
    {
      name: 'financial-store',
      partialize: (state) => ({
        // Don't persist these properties
        expenses: {
          categorizedExpenses: state.expenses.categorizedExpenses,
          totalExpenses: state.expenses.totalExpenses,
          lastUpdated: state.expenses.lastUpdated,
        },
        income: state.income,
        savings: state.savings,
        debt: state.debt,
        goals: state.goals,
        // Don't store transactions in localStorage for privacy
      }),
    }
  )
);

// Helper function to categorize transactions
const categorizeTransactions = (transactions: Transaction[]): Record<string, CategoryData> => {
  const categories: Record<string, CategoryData> = {
    'Housing': { total: 0, subcategories: {} },
    'Food': { total: 0, subcategories: {} },
    'Transportation': { total: 0, subcategories: {} },
    'Personal': { total: 0, subcategories: {} },
    'Healthcare': { total: 0, subcategories: {} },
    'Other': { total: 0, subcategories: {} },
  };

  transactions.forEach((tx) => {
    const amount = tx.amount;
    const category = tx.category?.[0] || "Other";
    const subcategory = tx.category?.[1] || "Miscellaneous";

    // Initialize category if it doesn't exist
    if (!categories[category]) {
      categories[category] = { total: 0, subcategories: {} };
    }

    // Add to category total
    categories[category].total += amount;

    // Initialize subcategory if it doesn't exist
    if (!categories[category].subcategories[subcategory]) {
      categories[category].subcategories[subcategory] = 0;
    }

    // Add to subcategory total
    categories[category].subcategories[subcategory] += amount;
  });

  return categories;
};

// Mock Plaid fetch function (replace with real implementation later)
const fetchTransactionsFromPlaid = async (): Promise<Transaction[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { id: '1', amount: 1500, category: ["Housing", "Rent"], date: "2023-04-01", name: "Rent Payment" },
    { id: '2', amount: 100, category: ["Housing", "Utilities", "Gas"], date: "2023-04-05", name: "Gas Bill" },
    { id: '3', amount: 200, category: ["Transportation", "Gas"], date: "2023-04-10", name: "Shell" },
    { id: '4', amount: 500, category: ["Personal", "Entertainment"], date: "2023-04-15", name: "Concert Tickets" },
    { id: '5', amount: 300, category: ["Food", "Groceries"], date: "2023-04-20", name: "Whole Foods" },
  ];
};

export default useFinancialStore;
