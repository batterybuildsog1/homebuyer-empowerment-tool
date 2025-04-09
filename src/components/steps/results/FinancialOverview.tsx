
import React from "react";
import { formatCurrency } from "@/utils/formatters";

interface FinancialOverviewProps {
  maxHomePrice: number | null;
  monthlyPayment: number | null;
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({ 
  maxHomePrice, 
  monthlyPayment 
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="financial-card text-center">
        <h3 className="text-lg font-medium mb-2">Maximum Home Price</h3>
        <p className="text-3xl font-bold text-finance-blue">
          {formatCurrency(maxHomePrice)}
        </p>
      </div>
      
      <div className="financial-card text-center">
        <h3 className="text-lg font-medium mb-2">Monthly Payment</h3>
        <p className="text-3xl font-bold text-finance-navy">
          {formatCurrency(monthlyPayment)}
        </p>
      </div>
    </div>
  );
};

export default FinancialOverview;
