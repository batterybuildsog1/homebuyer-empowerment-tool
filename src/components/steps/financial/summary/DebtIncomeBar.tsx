
import { DollarSign, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/formatters';

interface DebtIncomeBarProps {
  monthlyIncome: number;
  maxMonthlyPayment: number;
  remainingMonthlyPayment: number;
}

const DebtIncomeBar = ({
  monthlyIncome,
  maxMonthlyPayment,
  remainingMonthlyPayment
}: DebtIncomeBarProps) => {
  const percentageRemaining = maxMonthlyPayment > 0 
    ? (remainingMonthlyPayment / maxMonthlyPayment) * 100 
    : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>Monthly Income: {formatCurrency(monthlyIncome)}</span>
        <span>Max DTI Payment: {formatCurrency(maxMonthlyPayment)}</span>
      </div>
      <Progress value={percentageRemaining} className="h-3" />
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4 text-destructive" />
          Debt: {formatCurrency(maxMonthlyPayment - remainingMonthlyPayment)}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-finance-green" />
          Available for Mortgage: {formatCurrency(remainingMonthlyPayment)}
        </span>
      </div>
    </div>
  );
};

export default DebtIncomeBar;
