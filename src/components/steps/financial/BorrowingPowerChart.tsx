
import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useMortgage } from '@/context/MortgageContext';
import { calculateMaxDTI, calculateMaxLoanAmount } from '@/utils/mortgageCalculations';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DebtImpactList, { createDebtImpactList } from './debt/DebtImpactList';
import LoanAmountSummary from './summary/LoanAmountSummary';
import DebtIncomeBar from './summary/DebtIncomeBar';

interface BorrowingPowerChartProps {
  annualIncome: number;
  ficoScore: number;
  debtItems: {
    carLoan: number;
    studentLoan: number;
    creditCard: number;
    personalLoan: number;
    otherDebt: number;
  };
  selectedFactors: Record<string, string>;
}

const BorrowingPowerChart = ({ 
  annualIncome, 
  ficoScore, 
  debtItems, 
  selectedFactors 
}: BorrowingPowerChartProps) => {
  const { userData } = useMortgage();
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(0);
  const [adjustedLoanAmount, setAdjustedLoanAmount] = useState<number>(0);
  const [debtImpacts, setDebtImpacts] = useState<Array<{ name: string; amount: number; icon: JSX.Element }>>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState<number>(0);
  const [remainingMonthlyPayment, setRemainingMonthlyPayment] = useState<number>(0);
  const [maxDTI, setMaxDTI] = useState<number>(0);

  // Default values if not yet fetched
  const defaultInterestRate = 7.5;
  const defaultLoanType = userData.loanDetails.loanType || 'conventional';
  const defaultLTV = 80; // Assuming 80% LTV for calculations on this page

  useEffect(() => {
    if (annualIncome <= 0) return;

    // Calculate the maximum DTI based on FICO score and compensating factors
    const calculatedMaxDTI = calculateMaxDTI(
      ficoScore,
      defaultLTV,
      defaultLoanType,
      selectedFactors
    );
    
    setMaxDTI(calculatedMaxDTI);

    // Monthly income and max monthly payment based on DTI
    const monthly = annualIncome / 12;
    const maxPayment = monthly * (calculatedMaxDTI / 100);
    
    setMonthlyIncome(monthly);
    setMaxMonthlyPayment(maxPayment);

    // Calculate maximum loan amount with no debts
    const maxLoan = calculateMaxLoanAmount(
      annualIncome,
      0, // No debts
      calculatedMaxDTI,
      defaultInterestRate,
      defaultLoanType
    );
    
    setMaxLoanAmount(maxLoan);
    
    // Process debt items into impact components
    const impacts = createDebtImpactList(debtItems);
    setDebtImpacts(impacts);
    
    // Calculate total debt
    const totalDebt = Object.values(debtItems).reduce((sum, amount) => sum + amount, 0);
    
    // Calculate remaining payment after debts
    const remaining = maxPayment - totalDebt;
    setRemainingMonthlyPayment(remaining);
    
    // Calculate adjusted loan amount with debts
    const adjustedLoan = calculateMaxLoanAmount(
      annualIncome,
      totalDebt,
      calculatedMaxDTI,
      defaultInterestRate,
      defaultLoanType
    );
    
    setAdjustedLoanAmount(adjustedLoan);
  }, [annualIncome, ficoScore, debtItems, selectedFactors, defaultLoanType]);
  
  return (
    <Card className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium flex items-center justify-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Borrowing Power
        </h3>
        <p className="text-sm text-muted-foreground">
          See how your income and debts affect your maximum loan amount
        </p>
      </div>
      
      <div className="space-y-4 pt-2">
        <LoanAmountSummary 
          maxLoanAmount={maxLoanAmount} 
          adjustedLoanAmount={adjustedLoanAmount} 
        />
        
        <DebtIncomeBar 
          monthlyIncome={monthlyIncome}
          maxMonthlyPayment={maxMonthlyPayment}
          remainingMonthlyPayment={remainingMonthlyPayment}
        />
        
        <div className="space-y-2">
          <Label className="text-sm">Impact of Debts on Borrowing Power</Label>
          <DebtImpactList 
            debtImpacts={debtImpacts}
            maxLoanAmount={maxLoanAmount}
            annualIncome={annualIncome}
            ficoScore={ficoScore}
            defaultInterestRate={defaultInterestRate}
            defaultLoanType={defaultLoanType}
            selectedFactors={selectedFactors}
            defaultLTV={defaultLTV}
          />
        </div>
      </div>
    </Card>
  );
};

export default BorrowingPowerChart;
