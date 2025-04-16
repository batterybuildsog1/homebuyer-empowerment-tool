
import React from "react";
import { Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { UserData } from "@/context/MortgageContext";
import DTIWarningTooltip from "@/components/ui/DTIWarningTooltip";

interface FinancialBreakdownProps {
  financialDetails: NonNullable<UserData['results']['financialDetails']>;
  monthlyDebts: number;
  maxHomePrice: number | null;
  ltv: number;
}

const FinancialBreakdown: React.FC<FinancialBreakdownProps> = ({ 
  financialDetails, 
  monthlyDebts,
  maxHomePrice,
  ltv
}) => {
  return (
    <div className="financial-card">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Calculator className="h-5 w-5 mr-2" />
        Financial Breakdown
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1 border-b">
          <span>Housing Expense Ratio:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{financialDetails.frontEndDTI?.toFixed(1) || "N/A"}%</span>
            {financialDetails.frontEndDTIStatus && (
              <DTIWarningTooltip dtiStatus={financialDetails.frontEndDTIStatus} />
            )}
          </div>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Total Debt Ratio (DTI):</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{financialDetails.backEndDTI?.toFixed(1) || financialDetails.maxDTI.toFixed(1)}%</span>
            {financialDetails.backEndDTIStatus && (
              <DTIWarningTooltip dtiStatus={financialDetails.backEndDTIStatus} />
            )}
          </div>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Monthly Income:</span>
          <span className="font-medium">{formatCurrency(financialDetails.monthlyIncome)}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Maximum Monthly Debt Payment:</span>
          <span className="font-medium">{formatCurrency(financialDetails.maxMonthlyDebtPayment)}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Current Monthly Debts:</span>
          <span className="font-medium">{formatCurrency(monthlyDebts)}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b bg-slate-50 dark:bg-slate-900">
          <span className="font-medium">Available for Mortgage Payment:</span>
          <span className="font-medium text-finance-green">{formatCurrency(financialDetails.availableForMortgage)}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Adjusted Interest Rate:</span>
          <span className="font-medium">{financialDetails.adjustedRate.toFixed(3)}%</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Maximum Loan Amount:</span>
          <span className="font-medium">{formatCurrency(maxHomePrice ? maxHomePrice * (ltv / 100) : 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialBreakdown;
