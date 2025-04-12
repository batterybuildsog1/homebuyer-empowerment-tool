
import { useState, useEffect } from 'react';
import { DollarSign, PieChart, CreditCard, Home } from 'lucide-react';
import { useMortgage } from '@/context/MortgageContext';
import { calculateMaxDTI, calculateMaxLoanAmount } from '@/utils/mortgageCalculations';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatters';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart as RechartsDonut, Pie, Cell, ResponsiveContainer } from 'recharts';

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
    
    const availableForMortgage = {
      name: 'Available for Mortgage',
      value: remainingMonthlyPayment,
      color: '#8b76e0' // finance.purple
    };
    
    const debts = {
      name: 'Current Debts',
      value: totalDebt,
      color: '#EF4444' // finance.red
    };
    
    const remaining = {
      name: 'Other Expenses',
      value: monthlyIncome - maxMonthlyPayment,
      color: '#60A5FA' // finance.lightBlue
    };
    
    return [availableForMortgage, debts, remaining];
  };
  
  const donutData = getDonutData();
  
  // Calculate the impact of debts on borrowing power
  const debtImpact = maxLoanAmount - adjustedLoanAmount;
  const debtImpactPercentage = maxLoanAmount > 0 ? (debtImpact / maxLoanAmount) * 100 : 0;
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium flex items-center justify-center gap-2">
            <DollarSign className="h-5 w-5 text-finance-purple" />
            Your Borrowing Power
          </h3>
          <p className="text-sm text-muted-foreground">
            See how your income and debts affect your maximum loan amount
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-center pt-1">
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Maximum</Label>
            <div className="text-finance-purple text-xl font-bold">
              {formatCurrency(maxLoanAmount)}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase text-muted-foreground">Adjusted</Label>
            <div className="text-finance-green text-xl font-bold">
              {formatCurrency(adjustedLoanAmount)}
            </div>
          </div>
        </div>
        
        {/* Donut Chart */}
        <div className="w-full aspect-square max-w-[200px] mx-auto relative">
          <ChartContainer config={{
            mortgage: { color: '#8b76e0' },
            debts: { color: '#EF4444' },
            other: { color: '#60A5FA' },
          }} className="h-full">
            <PieChart width={200} height={200}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                labelLine={false}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-lg font-bold">{formatCurrency(remainingMonthlyPayment)}</div>
              <div className="text-xs text-muted-foreground">/mo</div>
            </div>
          </ChartContainer>
        </div>
        
        {/* Monthly Breakdown */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-finance-purple"></div>
              <span>Monthly Income</span>
            </div>
            <span className="font-medium">{formatCurrency(monthlyIncome, 0)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-finance-red"></div>
              <span>Monthly Debts</span>
            </div>
            <span className="font-medium">-{formatCurrency(totalDebt, 0)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-finance-green"></div>
              <span>Available for Mortgage</span>
            </div>
            <span>{formatCurrency(remainingMonthlyPayment, 0)}</span>
          </div>
        </div>
        
        <div className="pt-1 text-xs text-center text-muted-foreground">
          Your debts reduce borrowing power by {formatCurrency(debtImpact, 0)} ({debtImpactPercentage.toFixed(0)}%)
        </div>
      </CardContent>
    </Card>
  );
};

export default BorrowingPowerChart;
