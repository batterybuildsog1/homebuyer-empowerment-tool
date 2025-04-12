
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { DollarSign } from "lucide-react";

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
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="financial-card text-center p-6 bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Maximum Home Price</h3>
          <p className="text-3xl font-bold text-blue-500">
            {formatCurrency(maxHomePrice)}
          </p>
        </div>
        
        <div className="financial-card text-center p-6 bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Monthly Payment</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(monthlyPayment)}
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
            
            <div className="flex justify-between items-center pt-2 border-t">
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
