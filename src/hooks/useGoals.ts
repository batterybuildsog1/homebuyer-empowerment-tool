
import { useState, useCallback, useEffect } from 'react';

// Define types for goals
interface Goal {
  id: string;
  title: string;
  target: number;
  deadline: string;
  progress: number;
}

// Initial mock goals
const mockGoals: Goal[] = [
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
  },
  {
    id: '3',
    title: 'Pay Off Student Loans',
    target: 30000,
    deadline: '2027-01-31',
    progress: 25
  }
];

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch goals (would be an API call in a real app)
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API request with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For now, use mock data
      setGoals(mockGoals);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Properly use useEffect for initial loading
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Add a new goal
  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(), // Simple ID generation
    };
    
    setGoals(currentGoals => [...currentGoals, newGoal]);
  }, []);

  // Update goal progress
  const updateProgress = useCallback((goalId: string, newProgress: number) => {
    // Ensure progress is between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    
    setGoals(currentGoals => 
      currentGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, progress: clampedProgress } 
          : goal
      )
    );
  }, []);

  return { 
    goals, 
    loading, 
    error, 
    addGoal, 
    updateProgress,
    fetchGoals 
  };
}
