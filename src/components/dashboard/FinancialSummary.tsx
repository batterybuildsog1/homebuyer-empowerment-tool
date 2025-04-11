
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  PiggyBankIcon, 
  HomeIcon, 
  CreditCardIcon,
  DollarSignIcon,
  BarChart3Icon
} from "lucide-react";

interface FinancialSummaryProps {
  income: {
    totalIncome: number;
  };
  expenses: {
    totalExpenses: number;
  };
  savings: {
    totalSavings: number;
    rate: number;
    emergencyMonths: number;
  };
  debt: {
    total: number;
    dti: number;
  };
}

const FinancialSummary = ({ income, expenses, savings, debt }: FinancialSummaryProps) => {
  // Calculate savings to income percentage
  const savingsToIncomePercent = Math.round((savings.totalSavings / income.totalIncome) * 100);
  
  // Calculate emergency fund target (usually 6 months)
  const emergencyFundTarget = 6;
  const emergencyFundProgress = Math.min((savings.emergencyMonths / emergencyFundTarget) * 100, 100);
  
  // Calculate debt progress (lower is better)
  const maxHealthyDTI = 36; // Standard healthy DTI ratio
  const dtiProgress = Math.min((debt.dti / maxHealthyDTI) * 100, 100);
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {/* Financial Snapshot */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3Icon className="h-5 w-5 text-finance-purple" />
            <span className="bg-gradient-to-r from-primary-500 to-finance-purple bg-clip-text text-transparent">
              Financial Snapshot
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Income</span>
                  <DollarSignIcon className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xl font-semibold">${(income.totalIncome/12).toLocaleString()}<span className="text-xs text-muted-foreground">/mo</span></p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Expenses</span>
                  <CreditCardIcon className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xl font-semibold">${(expenses.totalExpenses/12).toLocaleString()}<span className="text-xs text-muted-foreground">/mo</span></p>
              </div>
            </div>
            
            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Savings</span>
                  <PiggyBankIcon className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-xl font-semibold">${savings.totalSavings.toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Total Debt</span>
                  <TrendingDownIcon className="h-4 w-4 text-red-500" />
                </div>
                <p className="text-xl font-semibold">${debt.total.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm">Monthly Cash Flow</span>
                <span className="text-sm font-medium">
                  ${((income.totalIncome - expenses.totalExpenses)/12).toLocaleString()}
                </span>
              </div>
              <Progress value={Math.min(((income.totalIncome - expenses.totalExpenses)/income.totalIncome) * 100, 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-finance-purple" />
            <span className="bg-gradient-to-r from-primary-500 to-finance-purple bg-clip-text text-transparent">
              Financial Health
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Debt-to-Income</span>
                <span className={`text-sm font-medium ${debt.dti > 40 ? "text-red-500" : debt.dti > 30 ? "text-amber-500" : "text-green-500"}`}>
                  {debt.dti}%
                </span>
              </div>
              <div className="relative">
                <Progress value={dtiProgress} className="h-2" />
                <div className="absolute flex justify-between w-full text-[10px] text-muted-foreground mt-1">
                  <span>Good</span>
                  <span>Caution</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Savings Rate</span>
                <span className={`text-sm font-medium ${savings.rate < 10 ? "text-red-500" : savings.rate < 15 ? "text-amber-500" : "text-green-500"}`}>
                  {savings.rate}%
                </span>
              </div>
              <Progress value={savings.rate} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Emergency Fund</span>
                <span className={`text-sm font-medium ${savings.emergencyMonths < 3 ? "text-red-500" : savings.emergencyMonths < 5 ? "text-amber-500" : "text-green-500"}`}>
                  {savings.emergencyMonths} months
                </span>
              </div>
              <Progress value={emergencyFundProgress} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 mo</span>
                <span>3 mo</span>
                <span>6 mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mortgage Readiness */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden lg:col-span-1 md:col-span-2 lg:col-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-finance-purple" />
            <span className="bg-gradient-to-r from-primary-500 to-finance-purple bg-clip-text text-transparent">
              Mortgage Readiness
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex justify-between items-center pt-1">
              <div>
                <h4 className="text-sm font-medium">Down Payment</h4>
                <p className="text-xl font-semibold mt-1">${savings.totalSavings.toLocaleString()}</p>
              </div>
              <div className="bg-finance-purple/10 rounded-full p-3">
                <PiggyBankIcon className="h-6 w-6 text-finance-purple" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">DTI Ratio</span>
                <span className={`text-sm font-medium ${debt.dti > 36 ? "text-red-500" : "text-green-500"}`}>
                  {debt.dti}% {debt.dti > 36 ? "(Too High)" : "(Good)"}
                </span>
              </div>
              <Progress value={dtiProgress} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0%</span>
                <span>36%</span>
                <span>43%</span>
              </div>
            </div>
            
            <div className="mt-5 bg-finance-blue/5 border border-finance-blue/10 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">Estimated Home Price</h4>
                  <p className="text-xl font-semibold text-finance-blue">
                    ${Math.round(savings.totalSavings * 5).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on 20% down payment
                  </p>
                </div>
                <button className="text-xs bg-finance-blue/10 text-finance-blue px-3 py-1 rounded-full hover:bg-finance-blue/20 transition-colors">
                  Plan
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
