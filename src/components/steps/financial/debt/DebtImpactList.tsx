
import { Car, CreditCard, GraduationCap, Briefcase, Box } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatters';
import { calculateMaxLoanAmount, calculateMaxDTI } from '@/utils/mortgageCalculations';

interface DebtItem {
  name: string;
  amount: number;
  icon: JSX.Element;
}

interface DebtImpactListProps {
  debtImpacts: DebtItem[];
  maxLoanAmount: number;
  annualIncome: number;
  ficoScore: number;
  defaultInterestRate: number;
  defaultLoanType: 'conventional' | 'fha';
  selectedFactors: Record<string, string>;
  defaultLTV: number;
}

const DebtImpactList = ({
  debtImpacts,
  maxLoanAmount,
  annualIncome,
  ficoScore,
  defaultInterestRate,
  defaultLoanType,
  selectedFactors,
  defaultLTV
}: DebtImpactListProps) => {
  const maxDTI = calculateMaxDTI(ficoScore, defaultLTV, defaultLoanType, selectedFactors);

  if (debtImpacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-2">
        No debt payments entered
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {debtImpacts.map((debt, index) => {
        // Calculate impact on borrowing power
        const loanAmountWithoutDebt = maxLoanAmount;
        const loanAmountWithDebt = calculateMaxLoanAmount(
          annualIncome,
          debt.amount,
          maxDTI,
          defaultInterestRate,
          defaultLoanType
        );
        
        const borrowingPowerReduction = loanAmountWithoutDebt - loanAmountWithDebt;
        const percentReduction = (borrowingPowerReduction / loanAmountWithoutDebt) * 100;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <div className="w-5">{debt.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span>{debt.name}: {formatCurrency(debt.amount)}/mo</span>
                <span className="text-destructive">
                  -{formatCurrency(borrowingPowerReduction)}
                </span>
              </div>
              <Progress value={100 - percentReduction} className="h-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function createDebtImpactList(debtItems: {
  carLoan: number;
  studentLoan: number;
  creditCard: number;
  personalLoan: number;
  otherDebt: number;
}): DebtItem[] {
  const impacts: Array<DebtItem> = [];

  if (debtItems.carLoan > 0) {
    impacts.push({ 
      name: 'Car Loan', 
      amount: debtItems.carLoan, 
      icon: <Car className="h-4 w-4" /> 
    });
  }
  
  if (debtItems.studentLoan > 0) {
    impacts.push({ 
      name: 'Student Loan', 
      amount: debtItems.studentLoan, 
      icon: <GraduationCap className="h-4 w-4" /> 
    });
  }
  
  if (debtItems.creditCard > 0) {
    impacts.push({ 
      name: 'Credit Card', 
      amount: debtItems.creditCard, 
      icon: <CreditCard className="h-4 w-4" /> 
    });
  }
  
  if (debtItems.personalLoan > 0) {
    impacts.push({ 
      name: 'Personal Loan', 
      amount: debtItems.personalLoan, 
      icon: <Briefcase className="h-4 w-4" /> 
    });
  }
  
  if (debtItems.otherDebt > 0) {
    impacts.push({ 
      name: 'Other Debt', 
      amount: debtItems.otherDebt, 
      icon: <Box className="h-4 w-4" /> 
    });
  }

  return impacts;
}

export default DebtImpactList;
