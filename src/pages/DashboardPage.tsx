
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDownIcon, ChevronUpIcon, RefreshCwIcon } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid 
} from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFinancialData } from "@/hooks/useFinancialData";

// Color palette for charts
const COLORS = ["#4A90E2", "#50C878", "#F5A623", "#E74C3C", "#9B59B6", "#34495E"];

const DashboardPage = () => {
  const { data, loading, error, fetchData } = useFinancialData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
    setLastUpdated(new Date());
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
    setLastUpdated(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold mb-6">Financial Dashboard</h1>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-md">
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

  // Prepare chart data for expenses by category
  const expenseChartData = expenses.categories.map((category, index) => ({
    name: category.name,
    value: category.amount,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare subcategory data if a category is selected
  const getSubcategoryData = () => {
    if (!selectedCategory) return [];
    
    const category = expenses.categories.find(c => c.name === selectedCategory);
    if (!category || !category.subcategories) return [];
    
    return category.subcategories.map((subcat, index) => ({
      name: subcat.name,
      value: subcat.amount,
      color: COLORS[(index + 3) % COLORS.length] // Offset colors for visual distinction
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCwIcon className="h-4 w-4" />
            <span className="hidden sm:inline-block">Refresh</span>
          </Button>
        </div>
      </header>
      
      <main className="grid gap-6 md:gap-8">
        {/* Financial Overview Row - Always visible */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Financial Snapshot */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                Financial Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 lg:col-span-1 md:col-span-2 lg:col-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                Mortgage Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
                      Mortgage Calculator
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Main Category Pie Chart */}
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      onClick={(data) => setSelectedCategory(data.name)}
                      className="cursor-pointer"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Subcategory Chart (shows when category is selected) */}
              <div className={`h-[350px] w-full ${!selectedCategory ? 'hidden md:block' : ''}`}>
                {selectedCategory ? (
                  <>
                    <h3 className="text-lg font-medium mb-2 text-center">{selectedCategory} Breakdown</h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={getSubcategoryData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                        <Bar dataKey="value" fill="#4A90E2">
                          {getSubcategoryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a category to see detailed breakdown
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible Additional Details Section */}
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
              <span className="text-lg font-medium">Additional Financial Details</span>
              {isDetailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Goals Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Goals</CardTitle>
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
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4">
                    <Link to="/financial-goals">
                      <Button variant="outline" className="w-full">
                        Manage Goals
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Debt Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Debt Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debt.accounts.map((account, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Savings Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Savings Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savings.accounts.map((account, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{account.name}</span>
                        <span className="font-medium">${account.balance.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
