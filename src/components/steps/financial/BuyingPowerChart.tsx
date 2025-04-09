
import { useState, useEffect } from 'react';
import { Home, TrendingDown, DollarSign, CreditCard, GraduationCap, Car, Briefcase, Box } from 'lucide-react';
import { useMortgage } from '@/context/MortgageContext';
import { calculateMaxPurchasePrice, calculateMaxDTI } from '@/utils/mortgageCalculations';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface BuyingPowerChartProps {
  annualIncome: number;
  ficoScore: number;
  debtItems: {
    carLoan: number;
    studentLoan: number;
    creditCard: number;
    personalLoan: number;
    otherDebt: number;
  };
  mitigatingFactors: string[];
}

const BuyingPowerChart = ({ annualIncome, ficoScore, debtItems, mitigatingFactors }: BuyingPowerChartProps) => {
  const { userData } = useMortgage();
  const [maxPurchasePrice, setMaxPurchasePrice] = useState<number>(0);
  const [adjustedPurchasePrice, setAdjustedPurchasePrice] = useState<number>(0);
  const [debtImpacts, setDebtImpacts] = useState<Array<{ name: string, amount: number, icon: JSX.Element }>>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [maxMonthlyPayment, setMaxMonthlyPayment] = useState<number>(0);
  const [remainingMonthlyPayment, setRemainingMonthlyPayment] = useState<number>(0);

  // Default values if not yet fetched
  const defaultInterestRate = 7.5;
  const defaultPropertyTax = 1.2; // 1.2% of home value
  const defaultInsurance = 1200; // $1200/year
  const defaultLoanType = 'conventional';
  const defaultLTV = 80; // 20% down payment

  useEffect(() => {
    if (annualIncome <= 0) return;

    // Calculate the maximum DTI based on FICO score and mitigating factors
    const maxDTI = calculateMaxDTI(
      ficoScore,
      defaultLTV,
      defaultLoanType,
      mitigatingFactors
    );

    // Monthly income and max monthly payment based on DTI
    const monthly = annualIncome / 12;
    const maxPayment = monthly * (maxDTI / 100);
    
    setMonthlyIncome(monthly);
    setMaxMonthlyPayment(maxPayment);

    // Calculate how each debt impacts the remaining payment
    let remaining = maxPayment;
    
    // Calculate the max purchase price with no debts
    const maxPrice = calculateMaxPurchasePrice(
      annualIncome,
      0, // No debts
      maxDTI,
      defaultInterestRate,
      defaultPropertyTax,
      defaultInsurance,
      100 - defaultLTV
    );
    
    setMaxPurchasePrice(maxPrice);
    
    // Calculate impacts of each debt
    const impacts: Array<{ name: string, amount: number, icon: JSX.Element }> = [];
    let totalDebt = 0;

    if (debtItems.carLoan > 0) {
      totalDebt += debtItems.carLoan;
      impacts.push({ 
        name: 'Car Loan', 
        amount: debtItems.carLoan, 
        icon: <Car className="h-4 w-4" /> 
      });
    }
    
    if (debtItems.studentLoan > 0) {
      totalDebt += debtItems.studentLoan;
      impacts.push({ 
        name: 'Student Loan', 
        amount: debtItems.studentLoan, 
        icon: <GraduationCap className="h-4 w-4" /> 
      });
    }
    
    if (debtItems.creditCard > 0) {
      totalDebt += debtItems.creditCard;
      impacts.push({ 
        name: 'Credit Card', 
        amount: debtItems.creditCard, 
        icon: <CreditCard className="h-4 w-4" /> 
      });
    }
    
    if (debtItems.personalLoan > 0) {
      totalDebt += debtItems.personalLoan;
      impacts.push({ 
        name: 'Personal Loan', 
        amount: debtItems.personalLoan, 
        icon: <Briefcase className="h-4 w-4" /> 
      });
    }
    
    if (debtItems.otherDebt > 0) {
      totalDebt += debtItems.otherDebt;
      impacts.push({ 
        name: 'Other Debt', 
        amount: debtItems.otherDebt, 
        icon: <Box className="h-4 w-4" /> 
      });
    }
    
    // Calculate remaining payment after debts
    remaining = maxPayment - totalDebt;
    setRemainingMonthlyPayment(remaining);
    
    // Calculate adjusted purchase price with debts
    const adjustedPrice = calculateMaxPurchasePrice(
      annualIncome,
      totalDebt,
      maxDTI,
      defaultInterestRate,
      defaultPropertyTax,
      defaultInsurance,
      100 - defaultLTV
    );
    
    setAdjustedPurchasePrice(adjustedPrice);
    setDebtImpacts(impacts);
  }, [annualIncome, ficoScore, debtItems, mitigatingFactors]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const percentageRemaining = maxMonthlyPayment > 0 
    ? (remainingMonthlyPayment / maxMonthlyPayment) * 100 
    : 0;
  
  return (
    <Card className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium flex items-center justify-center gap-2">
          <Home className="h-5 w-5" />
          Your Buying Power
        </h3>
        <p className="text-sm text-muted-foreground">
          See how your income and debts affect what you can afford
        </p>
      </div>
      
      <div className="space-y-4 pt-2">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="text-center">
            <Label className="text-sm">Maximum Buying Power</Label>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(maxPurchasePrice)}
            </p>
          </div>
          <div className="text-center">
            <Label className="text-sm">Adjusted Buying Power</Label>
            <p className="text-2xl font-bold text-finance-green">
              {formatCurrency(adjustedPurchasePrice)}
            </p>
          </div>
        </div>
        
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
        
        <div className="space-y-2">
          <Label className="text-sm">Impact of Debts on Buying Power</Label>
          {debtImpacts.length > 0 ? (
            <div className="space-y-2">
              {debtImpacts.map((debt, index) => {
                // Calculate impact on buying power
                const debtImpact = calculateMaxPurchasePrice(
                  annualIncome,
                  debt.amount,
                  calculateMaxDTI(ficoScore, defaultLTV, defaultLoanType, mitigatingFactors),
                  defaultInterestRate,
                  defaultPropertyTax,
                  defaultInsurance,
                  100 - defaultLTV
                );
                
                const buyingPowerReduction = maxPurchasePrice - debtImpact;
                const percentReduction = (buyingPowerReduction / maxPurchasePrice) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5">{debt.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{debt.name}: {formatCurrency(debt.amount)}/mo</span>
                        <span className="text-destructive">
                          -{formatCurrency(buyingPowerReduction)}
                        </span>
                      </div>
                      <Progress value={100 - percentReduction} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No debt payments entered
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BuyingPowerChart;
