
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HomeIcon, 
  DollarSignIcon, 
  LineChartIcon, 
  TargetIcon,
  ArrowRightIcon 
} from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData"; 

const DashboardPage = () => {
  const { data, loading, error, fetchData } = useFinancialData();

  useEffect(() => {
    fetchData(); // Fetch data on mount
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">Unable to load your financial data</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  const { income, expenses, savings, debt, goals } = data;

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
      </header>
      
      <main className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Financial Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5" />
              Financial Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Income</span>
                <span className="font-medium">${income.total.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses</span>
                <span className="font-medium">${expenses.total.toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between">
                <span>Savings</span>
                <span className="font-medium">${savings.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Debt</span>
                <span className="font-medium">${debt.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Debt-to-Income</span>
                <span className={debt.dti > 40 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                  {debt.dti}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Savings Rate</span>
                <span className="font-medium">{savings.rate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Fund</span>
                <span className={savings.emergencyMonths < 3 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                  {savings.emergencyMonths} months
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mortgage Readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              Mortgage Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Down Payment</span>
                <span className="font-medium">
                  ${savings.accounts.find(a => a.name === "Down Payment")?.balance.toLocaleString() || "0"} 
                </span>
              </div>
              <div className="flex justify-between">
                <span>DTI Ratio</span>
                <span className={debt.dti > 36 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                  {debt.dti}% {debt.dti > 36 ? "(Too High)" : "(Good)"}
                </span>
              </div>
              <div className="mt-4">
                <Link to="/mortgage-planning">
                  <Button variant="outline" className="w-full">
                    Mortgage Calculator <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Financial Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.slice(0, 2).map((goal) => (
              <div key={goal.id} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>{goal.title}</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-finance-blue h-2.5 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <Link to="/financial-goals">
                <Button variant="outline" className="w-full">
                  Manage Goals <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
