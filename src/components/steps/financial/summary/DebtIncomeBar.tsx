
import { DollarSign, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/utils/formatters';
import { DTIStatus } from '@/utils/mortgage/dtiCalculations';
import DTIWarningTooltip from '@/components/ui/DTIWarningTooltip';

interface DebtIncomeBarProps {
  monthlyIncome: number;
  maxMonthlyPayment: number;
  remainingMonthlyPayment: number;
  maxDTI?: number;
  strongFactorCount?: number;
  frontEndDTIStatus?: DTIStatus;
  backEndDTIStatus?: DTIStatus;
}

const DebtIncomeBar = ({
  monthlyIncome,
  maxMonthlyPayment,
  remainingMonthlyPayment,
  maxDTI = 0,
  strongFactorCount = 0,
  frontEndDTIStatus,
  backEndDTIStatus
}: DebtIncomeBarProps) => {
  const percentageRemaining = maxMonthlyPayment > 0 
    ? (remainingMonthlyPayment / maxMonthlyPayment) * 100 
    : 0;
    
  const dtiRatio = monthlyIncome > 0 
    ? (maxMonthlyPayment / monthlyIncome) * 100 
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
      
      {/* DTI information section */}
      <div className="flex justify-between text-sm mt-2 pt-2 border-t">
        <span className="flex items-center gap-1">
          Max DTI: <span className="font-medium">{maxDTI.toFixed(1)}%</span>
          {backEndDTIStatus && backEndDTIStatus.status !== 'normal' && (
            <DTIWarningTooltip 
              dtiStatus={backEndDTIStatus}
              tooltipWidth="wide"
            />
          )}
        </span>
        <span className="flex items-center gap-1">
          {strongFactorCount >= 2 ? (
            <>
              <CheckCircle className="h-4 w-4 text-finance-green" />
              <span className="text-finance-green">Strong Profile ({strongFactorCount})</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Need more strong factors</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default DebtIncomeBar;
