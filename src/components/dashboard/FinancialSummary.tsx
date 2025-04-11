
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Financial Snapshot */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl">Financial Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Income</span>
              <span className="font-medium">${income.totalIncome.toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Expenses</span>
              <span className="font-medium">${expenses.totalExpenses.toLocaleString()}/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Savings</span>
              <span className="font-medium">${savings.totalSavings.toLocaleString()}</span>
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
          <CardTitle className="text-xl">Financial Health</CardTitle>
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
          <CardTitle className="text-xl">Mortgage Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Down Payment</span>
              <span className="font-medium">
                ${savings.totalSavings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>DTI Ratio</span>
              <span className={debt.dti > 36 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                {debt.dti}% {debt.dti > 36 ? "(Too High)" : "(Good)"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;
