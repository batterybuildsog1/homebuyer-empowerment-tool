
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { UserData } from "@/context/MortgageContext";

interface MortgageSummaryProps {
  loanDetails: UserData['loanDetails'];
  maxHomePrice: number | null;
}

const MortgageSummary: React.FC<MortgageSummaryProps> = ({ 
  loanDetails, 
  maxHomePrice 
}) => {
  return (
    <div className="financial-card">
      <h3 className="text-lg font-medium mb-3">Mortgage Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1 border-b">
          <span>Loan Type:</span>
          <span className="font-medium">{loanDetails.loanType === 'conventional' ? 'Conventional' : 'FHA'}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Down Payment:</span>
          <span className="font-medium">{100 - loanDetails.ltv}% ({formatCurrency(maxHomePrice ? maxHomePrice * ((100 - loanDetails.ltv) / 100) : null)})</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Loan Amount:</span>
          <span className="font-medium">{formatCurrency(maxHomePrice ? maxHomePrice * (loanDetails.ltv / 100) : null)}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Interest Rate:</span>
          <span className="font-medium">{loanDetails.interestRate ? loanDetails.interestRate.toFixed(2) : 'N/A'}%</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Loan Term:</span>
          <span className="font-medium">30 Years</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Property Tax:</span>
          <span className="font-medium">${loanDetails.propertyTax ? ((loanDetails.propertyTax / 100) * (maxHomePrice || 0) / 12).toFixed(0) : 'N/A'}/month</span>
        </div>
        
        <div className="flex justify-between py-1">
          <span>Property Insurance:</span>
          <span className="font-medium">${loanDetails.propertyInsurance ? (loanDetails.propertyInsurance / 12).toFixed(0) : 'N/A'}/month</span>
        </div>
        
        {loanDetails.loanType === 'fha' && (
          <div className="flex justify-between py-1 border-t">
            <span>Upfront MIP:</span>
            <span className="font-medium">{formatCurrency(maxHomePrice && loanDetails.upfrontMIP ? 
              (maxHomePrice * (loanDetails.ltv / 100) * (loanDetails.upfrontMIP / 100)) : null)}
            </span>
          </div>
        )}
        
        {loanDetails.ltv > 80 && (
          <div className="flex justify-between py-1 border-t">
            <span>{loanDetails.loanType === 'fha' ? 'Monthly MIP:' : 'Monthly PMI:'}</span>
            <span className="font-medium">Included in payment</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageSummary;
