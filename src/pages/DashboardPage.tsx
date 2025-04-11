
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCwIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import useFinancialStore from "@/store/financialStore";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import FinancialSummary from "@/components/dashboard/FinancialSummary";

const DashboardPage = () => {
  const { 
    expenses, 
    income, 
    savings, 
    debt, 
    goals, 
    refreshData 
  } = useFinancialStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !expenses.categorizedExpenses) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold mb-6">Financial Dashboard</h1>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border shadow-md p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">Unable to load your financial data</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  // Format the lastUpdated date if it exists and is a valid Date
  const formattedLastUpdated = () => {
    if (!expenses.lastUpdated) return 'Not updated yet';
    
    // Check if lastUpdated is a Date object or can be converted to one
    try {
      const date = expenses.lastUpdated instanceof Date 
        ? expenses.lastUpdated 
        : new Date(expenses.lastUpdated);
        
      // Verify it's a valid date before using toLocaleTimeString
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleTimeString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date format error';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            Last updated: {formattedLastUpdated()}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1 hover:bg-accent/30 active:scale-95 transition-all duration-200"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline-block">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </header>
      
      <main className="grid gap-6 md:gap-8">
        <FinancialSummary 
          income={income} 
          expenses={expenses} 
          savings={savings} 
          debt={debt} 
        />
        
        <ExpenseChart categorizedExpenses={expenses.categorizedExpenses} />

        <Collapsible 
          open={isDetailsOpen} 
          onOpenChange={setIsDetailsOpen}
          className="shadow-md rounded-lg border bg-card"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex justify-between items-center p-4 rounded-t-lg transition-colors duration-300" 
            >
              <span className="text-lg font-medium">Financial Goals</span>
              {isDetailsOpen ? 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 space-y-4">
            <div className="grid gap-4">
              {goals.goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-3 transition-all duration-300 hover:shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <span className="font-semibold">${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Progress: {goal.progress}%</span>
                      <span>Target Date: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center mt-2">
                <Link to="/financial-goals">
                  <Button variant="outline" className="transition-colors duration-300 hover:bg-primary/10">View All Goals</Button>
                </Link>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </main>

      <footer className="mt-8 py-4 sticky bottom-0 left-0 right-0 z-10">
        <nav className="grid grid-cols-4 gap-2 shadow-md rounded-md border-t bg-card">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Dashboard</Button>
          </Link>
          <Link to="/mortgage-planning">
            <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Mortgage</Button>
          </Link>
          <Link to="/financial-goals">
            <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Goals</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Home</Button>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default DashboardPage;
