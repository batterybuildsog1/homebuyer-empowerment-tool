
import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useMortgage } from '@/context/MortgageContext';
import { calculateMaxDTI, calculateMaxLoanAmount, countStrongFactors, getNonHousingDTIOption, createEnhancedFactors } from '@/utils/mortgageCalculations';
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
  const [strongFactorCount, setStrongFactorCount] = useState<number>(0);

  // Get the current loan type from context
  const loanType = userData.loanDetails.loanType || 'conventional';
  const ltv = userData.loanDetails.ltv || 80; // Use context LTV if available

  // Get interest rate based on current loan type
  const interestRate = loanType === 'conventional' 
    ? (userData.loanDetails.conventionalInterestRate || 7.5)
    : (userData.loanDetails.fhaInterestRate || 7.5);

  useEffect(() => {
    if (annualIncome <= 0) return;
    
    console.log("BorrowingPowerChart: Recalculating with factors:", selectedFactors);
    console.log("Current loan type:", loanType, "LTV:", ltv, "Interest Rate:", interestRate);

    // Calculate monthly income and total debt
    const monthly = annualIncome / 12;
    const totalDebt = Object.values(debtItems).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
    
    setMonthlyIncome(monthly);
    
    // Create enhanced factors with calculated values
    const enhancedFactors = createEnhancedFactors(
      selectedFactors,
      ficoScore,
      totalDebt,
      monthly
    );
    
    console.log("Enhanced factors for DTI calculation:", enhancedFactors);
    
    // Calculate the maximum DTI based on FICO score, loan type and compensating factors
    const calculatedMaxDTI = calculateMaxDTI(
      ficoScore,
      ltv,
      loanType,
      enhancedFactors,
      totalDebt,
      monthly
    );
    
    console.log("Calculated Max DTI:", calculatedMaxDTI, "for loan type:", loanType);
    setMaxDTI(calculatedMaxDTI);
    
    // Calculate and set strong factor count
    const strongCount = countStrongFactors(enhancedFactors);
    console.log("Strong factor count:", strongCount);
    setStrongFactorCount(strongCount);

    // Calculate max monthly payment based on DTI
    const maxPayment = monthly * (calculatedMaxDTI / 100);
    setMaxMonthlyPayment(maxPayment);

    // Calculate maximum loan amount with no debts
    const maxLoan = calculateMaxLoanAmount(
      annualIncome,
      0, // No debts
      calculatedMaxDTI,
      interestRate,
      loanType
    );
    
    setMaxLoanAmount(maxLoan);
    
    // Process debt items into impact components
    const impacts = createDebtImpactList(debtItems);
    setDebtImpacts(impacts);
    
    // Calculate remaining payment after debts
    const remaining = maxPayment - totalDebt;
    setRemainingMonthlyPayment(remaining > 0 ? remaining : 0);
    
    // Calculate adjusted loan amount with debts
    const adjustedLoan = calculateMaxLoanAmount(
      annualIncome,
      totalDebt,
      calculatedMaxDTI,
      interestRate,
      loanType
    );
    
    setAdjustedLoanAmount(adjustedLoan > 0 ? adjustedLoan : 0);
  }, [annualIncome, ficoScore, debtItems, selectedFactors, loanType, ltv, interestRate]);
  
  return (
    <Card className="p-4 space-y-4 h-full overflow-auto" style={{ maxHeight: '600px' }}>
      <div className="text-center">
        <h3 className="text-lg font-medium flex items-center justify-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Borrowing Power
        </h3>
        <p className="text-sm text-muted-foreground">
          See how your income and debts affect your maximum loan amount
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Current loan type: {loanType.charAt(0).toUpperCase() + loanType.slice(1)}
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
          maxDTI={maxDTI}
          strongFactorCount={strongFactorCount}
        />
        
        <div className="space-y-2">
          <Label className="text-sm">Impact of Debts on Borrowing Power</Label>
          <div className="max-h-[200px] overflow-y-auto pr-1">
            <DebtImpactList 
              debtImpacts={debtImpacts}
              maxLoanAmount={maxLoanAmount}
              annualIncome={annualIncome}
              ficoScore={ficoScore}
              defaultInterestRate={interestRate}
              defaultLoanType={loanType}
              selectedFactors={selectedFactors}
              defaultLTV={ltv}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BorrowingPowerChart;
