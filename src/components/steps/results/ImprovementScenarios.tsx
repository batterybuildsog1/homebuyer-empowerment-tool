
import React from "react";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { UserData } from "@/context/MortgageContext";

interface ImprovementScenariosProps {
  scenarios: UserData['results']['scenarios'];
  maxHomePrice: number | null;
}

const ImprovementScenarios: React.FC<ImprovementScenariosProps> = ({ 
  scenarios, 
  maxHomePrice 
}) => {
  return (
    <div className="financial-card">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Ways to Increase Your Buying Power
      </h3>
      
      {scenarios && scenarios.length > 0 ? (
        <div className="space-y-6">
          {scenarios.map((scenario, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-finance-blue">
                {scenario.loanType !== scenario.loanType
                  ? `Switch to ${scenario.loanType === 'conventional' ? 'Conventional' : 'FHA'} Loan`
                  : scenario.ficoChange > 0
                  ? `Increase FICO Score by ${scenario.ficoChange} points`
                  : scenario.ltvChange < 0
                  ? `Increase Down Payment to ${100 - (scenario.ltvChange)}%`
                  : 'Alternative Scenario'}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">New Home Price</p>
                  <p className="font-medium">{formatCurrency(scenario.maxHomePrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Monthly Payment</p>
                  <p className="font-medium">{formatCurrency(scenario.monthlyPayment)}</p>
                </div>
              </div>
              
              <div className="pt-1">
                <p className="text-sm font-medium flex items-center gap-1">
                  <span className={scenario.maxHomePrice > (maxHomePrice || 0) ? "text-finance-green" : "text-destructive"}>
                    {scenario.maxHomePrice > (maxHomePrice || 0)
                      ? `+${formatCurrency(scenario.maxHomePrice - (maxHomePrice || 0))} buying power`
                      : `${formatCurrency(scenario.maxHomePrice - (maxHomePrice || 0))} buying power`}
                  </span>
                </p>
              </div>
            </div>
          ))}
          
          <div className="text-sm text-muted-foreground pt-2">
            <p>These scenarios are estimates based on current rates and your inputs. Actual loan terms may vary.</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No alternative scenarios available.</p>
      )}
    </div>
  );
};

export default ImprovementScenarios;
