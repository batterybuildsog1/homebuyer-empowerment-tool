
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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            {expenses.lastUpdated ? `Last updated: ${expenses.lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline-block">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </header>
      
      <main className="grid gap-6 md:gap-8">
        {/* Financial Overview Cards */}
        <FinancialSummary 
          income={income} 
          expenses={expenses} 
          savings={savings} 
          debt={debt} 
        />
        
        {/* Expense Breakdown Section */}
        <ExpenseChart categorizedExpenses={expenses.categorizedExpenses} />

        {/* Financial Goals Preview */}
        <Collapsible 
          open={isDetailsOpen} 
          onOpenChange={setIsDetailsOpen}
          className="shadow-md rounded-lg border bg-card"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex justify-between items-center p-4 rounded-t-lg" 
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
                <div key={goal.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{goal.title}</h3>
                    <span className="font-semibold">${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
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
                  <Button variant="outline">View All Goals</Button>
                </Link>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </main>

      <footer className="mt-8 py-4">
        <nav className="grid grid-cols-4 gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full">Dashboard</Button>
          </Link>
          <Link to="/mortgage-planning">
            <Button variant="ghost" className="w-full">Mortgage</Button>
          </Link>
          <Link to="/financial-goals">
            <Button variant="ghost" className="w-full">Goals</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full">Home</Button>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default DashboardPage;
