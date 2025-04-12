
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { DollarSign, Home, CreditCard } from "lucide-react";

interface FinancialOverviewProps {
  maxHomePrice: number | null;
  monthlyPayment: number | null;
  financialDetails?: {
    monthlyIncome: number;
    maxMonthlyDebtPayment: number;
    availableForMortgage: number;
  };
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ 
  maxHomePrice, 
  monthlyPayment,
  financialDetails
}) => {
  if (!maxHomePrice || !monthlyPayment || !financialDetails) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="financial-card p-6 bg-card rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Home className="h-5 w-5 mr-2 text-blue-500" />
              Maximum Home Price
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-500 text-center">
            {formatCurrency(maxHomePrice)}
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Based on your income, debts, and loan factors
          </p>
        </div>
        
        <div className="financial-card p-6 bg-card rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Monthly Payment
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600 text-center">
            {formatCurrency(monthlyPayment)}
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Includes principal, interest, taxes, and insurance
          </p>
        </div>
      </div>
      
      {financialDetails && (
        <div className="financial-card p-6 bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
            Financial Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Monthly Income:</span>
              <span className="font-medium">{formatCurrency(financialDetails.monthlyIncome)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Maximum Debt Payment (DTI):</span>
              <span className="font-medium">{formatCurrency(financialDetails.maxMonthlyDebtPayment)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t bg-slate-50 dark:bg-slate-900 p-2 rounded">
              <span className="text-sm font-medium">Available for Mortgage:</span>
              <span className="font-bold text-green-600">{formatCurrency(financialDetails.availableForMortgage)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverview;
