
import { useState, useEffect } from 'react';
import { DollarSign, CircleDollarSign } from 'lucide-react';
import { useMortgage } from '@/context/MortgageContext';
import { calculateMaxDTI, calculateMaxLoanAmount } from '@/utils/mortgageCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState<number>(0);
  const [remainingMonthlyPayment, setRemainingMonthlyPayment] = useState<number>(0);
  const [totalDebt, setTotalDebt] = useState<number>(0);
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
    
    // Calculate total debt
    const totalMonthlyDebt = Object.values(debtItems).reduce((sum, amount) => sum + amount, 0);
    setTotalDebt(totalMonthlyDebt);
    
    // Calculate remaining payment after debts
    const remaining = maxPayment - totalMonthlyDebt;
    setRemainingMonthlyPayment(remaining > 0 ? remaining : 0);
    
    // Calculate adjusted loan amount with debts
    const adjustedLoan = calculateMaxLoanAmount(
      annualIncome,
      totalMonthlyDebt,
      calculatedMaxDTI,
      defaultInterestRate,
      defaultLoanType
    );
    
    setAdjustedLoanAmount(adjustedLoan);
  }, [annualIncome, ficoScore, debtItems, selectedFactors, defaultLoanType]);
  
  // Prepare data for donut chart
  const getDonutData = () => {
    if (monthlyIncome <= 0) return [];
    
    // We'll only show available for mortgage and debts in the chart
    const availableForMortgage = {
      name: 'Available for Mortgage',
      value: remainingMonthlyPayment,
      color: '#6366f1' // finance-purple equivalent
    };
    
    const debts = {
      name: 'Current Debts',
      value: totalDebt,
      color: '#ef4444' // red-500
    };
    
    return [availableForMortgage, debts];
  };
  
  const donutData = getDonutData();
  
  // Calculate the impact of debts on borrowing power
  const debtImpact = maxLoanAmount - adjustedLoanAmount;
  const debtImpactPercentage = maxLoanAmount > 0 ? (debtImpact / maxLoanAmount) * 100 : 0;
  
  return (
    <Card className="w-full h-full overflow-hidden border rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-1 flex items-center justify-center gap-1.5 text-finance-purple">
            <DollarSign className="h-5 w-5" />
            Your Borrowing Power
          </h3>
          <p className="text-sm text-muted-foreground">
            See how your income and debts affect your maximum loan amount
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="text-center">
            <div className="text-xs uppercase text-muted-foreground">MAXIMUM</div>
            <div className="text-finance-purple text-2xl font-semibold">
              {formatCurrency(maxLoanAmount)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase text-muted-foreground">ADJUSTED</div>
            <div className="text-green-500 text-2xl font-semibold">
              {formatCurrency(adjustedLoanAmount)}
            </div>
          </div>
        </div>
        
        {/* Donut Chart */}
        <div className="relative mt-4 mx-auto" style={{ height: '180px', width: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                startAngle={90}
                endAngle={-270}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold">{formatCurrency(remainingMonthlyPayment, 0)}</div>
            <div className="text-xs text-muted-foreground">/mo</div>
          </div>
        </div>
        
        {/* Monthly Breakdown */}
        <div className="space-y-2.5 mt-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
              <span className="text-sm">Monthly Income</span>
            </div>
            <span className="font-medium text-sm">{formatCurrency(monthlyIncome, 0)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Monthly Debts</span>
            </div>
            <span className="font-medium text-sm">-{formatCurrency(totalDebt, 0)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Available for Mortgage</span>
            </div>
            <span className="font-medium text-sm">{formatCurrency(remainingMonthlyPayment, 0)}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-2 border-t text-xs text-center text-muted-foreground">
          Your debts reduce borrowing power by {formatCurrency(debtImpact, 0)} ({debtImpactPercentage.toFixed(0)}%)
        </div>
      </CardContent>
    </Card>
  );
};

export default BorrowingPowerChart;
