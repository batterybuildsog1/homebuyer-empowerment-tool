
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatters';

interface LoanAmountSummaryProps {
  maxLoanAmount: number;
  adjustedLoanAmount: number;
}

const LoanAmountSummary = ({ 
  maxLoanAmount, 
  adjustedLoanAmount 
}: LoanAmountSummaryProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="text-center">
        <Label className="text-sm">Maximum Borrowing Power</Label>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(maxLoanAmount)}
        </p>
      </div>
      <div className="text-center">
        <Label className="text-sm">Adjusted Borrowing Power</Label>
        <p className="text-2xl font-bold text-finance-green">
          {formatCurrency(adjustedLoanAmount)}
        </p>
      </div>
    </div>
  );
};

export default LoanAmountSummary;
