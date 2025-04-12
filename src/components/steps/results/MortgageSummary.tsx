
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { UserData } from "@/context/MortgageContext";
import { Shield } from "lucide-react";

interface MortgageSummaryProps {
  loanDetails: UserData['loanDetails'];
  maxHomePrice: number | null;
}

const MortgageSummary: React.FC<MortgageSummaryProps> = ({ 
  loanDetails, 
  maxHomePrice 
}) => {
  if (!maxHomePrice) return null;
  
  // Calculate loan amount
  const loanAmount = maxHomePrice * (loanDetails.ltv / 100);
  
  // Calculate monthly MIP/PMI amount
  const calculateMonthlyMIPorPMI = (): number => {
    if (!maxHomePrice) return 0;
    
    // For FHA loans, use the ongoing MIP rate
    if (loanDetails.loanType === 'fha' && loanDetails.ongoingMIP) {
      return (loanDetails.ongoingMIP / 100) * loanAmount / 12;
    }
    
    // For conventional loans with LTV > 80, calculate PMI
    if (loanDetails.loanType === 'conventional' && loanDetails.ltv > 80) {
      // Simple PMI estimate based on LTV for conventional loans
      let pmiRate = loanDetails.ltv > 95 ? 1.1 : 
                   loanDetails.ltv > 90 ? 0.8 : 
                   loanDetails.ltv > 85 ? 0.5 : 0.3;
      return (pmiRate / 100) * loanAmount / 12;
    }
    
    return 0;
  };

  const monthlyMIPorPMI = calculateMonthlyMIPorPMI();
  const monthlyPropertyTax = loanDetails.propertyTax ? ((loanDetails.propertyTax / 100) * maxHomePrice / 12) : 0;
  const monthlyInsurance = loanDetails.propertyInsurance ? (loanDetails.propertyInsurance / 12) : 0;

  return (
    <div className="financial-card p-6 bg-card rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-blue-500" />
        Mortgage Summary
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1 border-b">
          <span>Loan Type:</span>
          <span className="font-medium">{loanDetails.loanType === 'conventional' ? 'Conventional' : 'FHA'}</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Down Payment:</span>
          <span className="font-medium">{100 - loanDetails.ltv}% ({formatCurrency(maxHomePrice * ((100 - loanDetails.ltv) / 100))})</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Loan Amount:</span>
          <span className="font-medium">{formatCurrency(loanAmount)}</span>
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
          <span className="font-medium">{formatCurrency(monthlyPropertyTax)}/month</span>
        </div>
        
        <div className="flex justify-between py-1 border-b">
          <span>Property Insurance:</span>
          <span className="font-medium">{formatCurrency(monthlyInsurance)}/month</span>
        </div>
        
        {loanDetails.loanType === 'fha' && (
          <div className="flex justify-between py-1 border-b">
            <span>Upfront MIP:</span>
            <span className="font-medium">{formatCurrency(loanDetails.upfrontMIP ? 
              (loanAmount * (loanDetails.upfrontMIP / 100)) : 0)}
            </span>
          </div>
        )}
        
        {monthlyMIPorPMI > 0 && (
          <div className="flex justify-between py-1 border-b bg-slate-50 dark:bg-slate-900">
            <span>{loanDetails.loanType === 'fha' ? 'Monthly MIP:' : 'Monthly PMI:'}</span>
            <span className="font-medium">{formatCurrency(monthlyMIPorPMI)}/month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageSummary;
