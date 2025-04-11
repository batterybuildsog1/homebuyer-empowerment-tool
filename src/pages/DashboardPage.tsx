
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  RefreshCwIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  HomeIcon, 
  PieChartIcon, 
  TargetIcon,
  BarChart4Icon
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Heading } from "@/components/ui/Heading";
import useFinancialStore from "@/store/financialStore";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import { Progress } from "@/components/ui/progress";

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
      <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-background animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full mt-8 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-red-500 mb-4 text-center">
          <p className="text-lg font-semibold mb-2">Unable to load your financial data</p>
          <p className="text-sm text-muted-foreground mb-4">Please try again or check your connection</p>
        </div>
        <Button onClick={handleRefresh} variant="default" className="gap-2">
          <RefreshCwIcon className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Format the lastUpdated date if it exists and is a valid Date
  const formattedLastUpdated = () => {
    if (!expenses.lastUpdated) return 'Not updated yet';
    
    try {
      const date = expenses.lastUpdated instanceof Date 
        ? expenses.lastUpdated 
        : new Date(expenses.lastUpdated);
        
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        day: 'numeric',
        month: 'short'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date format error';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 pb-20">
      <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Heading as="h1" size="xl" className="font-bold">
            <span className="bg-gradient-to-r from-primary-500 to-finance-purple bg-clip-text text-transparent">
              Financial Dashboard
            </span>
          </Heading>
          <p className="text-muted-foreground mt-1">
            Track your finances and plan for the future
          </p>
        </div>
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
      
      <main className="grid gap-8">
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
          className="shadow-md rounded-lg border bg-card animate-fade-in overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex justify-between items-center p-4 rounded-t-lg transition-colors duration-300" 
            >
              <div className="flex items-center gap-2">
                <TargetIcon className="h-5 w-5 text-finance-purple" />
                <span className="text-lg font-medium">Financial Goals</span>
              </div>
              {isDetailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {goals.goals.map((goal) => (
                <div 
                  key={goal.id} 
                  className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{goal.title}</h3>
                    <span className="font-semibold">${goal.target.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2.5">
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Progress: ${Math.round(goal.target * goal.progress / 100).toLocaleString()}</span>
                      <span className={`${
                        new Date(goal.deadline) < new Date() ? 'text-red-500' : 
                        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) < 30 ? 'text-amber-500' : 
                        'text-muted-foreground'
                      }`}>
                        Target: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-3 transition-all duration-300 ease-in-out">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Monthly contribution needed:</span>
                        <span className="font-medium">
                          ${Math.round(((goal.target * (100 - goal.progress) / 100) / 
                          Math.max(1, Math.round((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))))).toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span>Time remaining:</span>
                        <span className="font-medium">
                          {Math.max(0, Math.round((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))} months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center md:col-span-2 mt-4">
                <Link to="/financial-goals">
                  <Button variant="outline" className="transition-all duration-300 hover:bg-primary/10 gap-2">
                    <TargetIcon className="h-4 w-4" />
                    View All Goals
                  </Button>
                </Link>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 py-3 border-t bg-background/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            <Link to="/dashboard" className="group">
              <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2 rounded-lg text-finance-purple">
                <BarChart4Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-normal">Dashboard</span>
              </Button>
            </Link>
            <Link to="/mortgage-planning" className="group">
              <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2 rounded-lg">
                <HomeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-normal">Mortgage</span>
              </Button>
            </Link>
            <Link to="/financial-goals" className="group">
              <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2 rounded-lg">
                <TargetIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-normal">Goals</span>
              </Button>
            </Link>
            <Link to="/" className="group">
              <Button variant="ghost" size="sm" className="w-full flex flex-col items-center gap-1 h-auto py-2 rounded-lg">
                <PieChartIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-normal">Home</span>
              </Button>
            </Link>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default DashboardPage;
