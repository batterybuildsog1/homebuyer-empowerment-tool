
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Home, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { calculateMaxPurchasePrice } from "@/utils/mortgage/loanCalculations";
import { useUser } from "@/context/UserContext";
import { useMortgage } from "@/context/MortgageContext";
import { ROUTES } from "@/utils/routes";

export const BuyingPowerCalculator = () => {
  const navigate = useNavigate();
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [standardPrice, setStandardPrice] = useState(0);
  const [enhancedPrice, setEnhancedPrice] = useState(0);
  const [percentIncrease, setPercentIncrease] = useState(0);
  
  const { isLoggedIn } = useUser();
  
  // Use the mortgage context only if user is logged in
  const mortgageContext = isLoggedIn ? useMortgage() : null;
  const isMortgageComplete = mortgageContext?.isMortgageWorkflowCompleted() || false;

  // Calculate buying power comparison based on income
  useEffect(() => {
    // Standard lender calculation (43% DTI)
    const standardDTI = 43;
    const standardRate = 6.75; // Average market rate
    const standardMaxPrice = calculateMaxPurchasePrice(
      annualIncome,
      500, // Average monthly debts
      standardDTI,
      standardRate,
      1.25, // Property tax rate
      1200, // Annual insurance
      20, // 20% down payment
      0 // No PMI with 20% down
    );

    // Moneybucket.ai enhanced calculation (52% DTI)
    const enhancedDTI = 52;
    const enhancedRate = 6.5; // Slightly better rate
    const enhancedMaxPrice = calculateMaxPurchasePrice(
      annualIncome,
      500, // Same monthly debts
      enhancedDTI,
      enhancedRate,
      1.25, // Same property tax rate
      1200, // Same annual insurance
      20, // Same down payment
      0 // No PMI with 20% down
    );

    // Cap at about $450,000 for the enhanced version
    const cappedEnhancedPrice = Math.min(enhancedMaxPrice, 450000);
    
    // Calculate percentage increase
    const increase = Math.round(((cappedEnhancedPrice - standardMaxPrice) / standardMaxPrice) * 100);

    setStandardPrice(standardMaxPrice);
    setEnhancedPrice(cappedEnhancedPrice);
    setPercentIncrease(increase);
  }, [annualIncome]);

  // Handle income input changes
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAnnualIncome(parseInt(value) || 0);
  };

  // Direct user based on their status
  const navigateToAppropriateScreen = () => {
    if (!isLoggedIn) {
      // Not logged in - go to auth
      navigate(ROUTES.auth);
      return;
    }
    
    if (!isMortgageComplete) {
      // Logged in but mortgage workflow not completed - go to mortgage planning
      navigate(ROUTES.mortgage);
      return;
    }
    
    // Logged in and mortgage workflow completed - go to dashboard
    navigate(ROUTES.dashboard);
  };

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <Heading as="h2" size="2xl" className="text-center mb-10 text-[#1A1F2C]">
          See how much <span className="text-[#8b76e0]">more house</span> you can afford
        </Heading>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Income Input */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
            <Heading as="h3" size="md" className="mb-4 text-[#1A1F2C]">
              Your annual income
            </Heading>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input 
                type="text"
                className="pl-10 pr-4 py-3 bg-white border-gray-200 text-[#1A1F2C] text-lg rounded-md shadow-sm"
                value={annualIncome.toLocaleString()}
                onChange={handleIncomeChange}
              />
            </div>
          </div>
          
          {/* Comparison Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Lender Card */}
            <Card className="bg-gray-50 border border-gray-200 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="font-medium text-gray-500 mb-2">Standard Lenders</div>
                <Heading as="h3" size="lg" className="text-[#1A1F2C] mb-2">
                  {formatCurrency(standardPrice)}
                </Heading>
                <div className="text-sm text-gray-500">Max home price</div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-600">
                    <div className="rounded-full bg-gray-100 p-1 mr-2">
                      <Home className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Standard mortgage approval</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Moneybucket.ai Enhanced Card */}
            <Card className="bg-gradient-to-br from-[#f0edff] to-white border border-[#e5e0ff] shadow-md overflow-hidden">
              <CardContent className="p-6">
                <div className="font-medium text-[#6b57d0] mb-2">With Moneybucket.ai</div>
                <Heading as="h3" size="lg" className="text-[#1A1F2C] mb-2">
                  {formatCurrency(enhancedPrice)}
                </Heading>
                <div className="text-sm text-gray-600">Max home price</div>
                
                <div className="mt-4 pt-4 border-t border-[#e5e0ff]">
                  <div className="flex items-center">
                    <div className="rounded-full bg-[#8b76e0]/20 p-1 mr-2">
                      <TrendingUp className="h-4 w-4 text-[#8b76e0]" />
                    </div>
                    <span className="text-sm font-medium text-[#6b57d0]">
                      {percentIncrease}% more buying power
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center">
          <Button 
            size="lg" 
            className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white px-8 shadow-lg"
            onClick={navigateToAppropriateScreen}
          >
            Get my personalized buying power
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
