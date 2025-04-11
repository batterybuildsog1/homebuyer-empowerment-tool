
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Calculator, DollarSign, Home } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatCurrency } from "@/utils/formatters";

const HeroPage = () => {
  const [email, setEmail] = useState("");
  const [income, setIncome] = useState("");
  
  // Calculate buying power with different DTI ratios
  const calculateBuyingPower = (annualIncome: number, dtiRatio: number) => {
    if (!annualIncome) return 0;
    
    const monthlyIncome = annualIncome / 12;
    // Assuming average interest rate of 6.5%, 30-year term, $0 debts for simplicity
    const maxMonthlyPayment = monthlyIncome * (dtiRatio / 100);
    
    // Simplified calculation (rough estimate)
    const maxHomePrice = maxMonthlyPayment * 180; // Multiplier that approximates mortgage calculation
    
    return Math.round(maxHomePrice);
  };
  
  const annualIncome = parseInt(income) || 100000; // Default to 100k if empty
  const standardBuyingPower = calculateBuyingPower(annualIncome, 43);
  const enhancedBuyingPower = calculateBuyingPower(annualIncome, 52);
  const buyingPowerIncrease = enhancedBuyingPower - standardBuyingPower;
  const percentageIncrease = Math.round((buyingPowerIncrease / standardBuyingPower) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* Minimal Header */}
      <header className="w-full p-5 md:p-8 flex justify-between items-center border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-[#8b76e0]" />
          <span className="font-medium text-lg">Moneybucket.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-[#8b76e0] transition-colors text-sm">Dashboard</Link>
          <Link to="/mortgage-planning" className="hover:text-[#8b76e0] transition-colors text-sm">Mortgage</Link>
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link to="/dashboard">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#8b76e0] hover:bg-[#7a66cf] h-9">
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Button asChild size="sm" className="bg-[#8b76e0] hover:bg-[#7a66cf]">
            <Link to="/dashboard">Start</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Content */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center max-w-xl mx-auto md:mx-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-[#8b76e0]">Buy the house</span> they said you couldn't.
          </h1>
          
          <p className="text-zinc-600 mb-8 md:text-lg">
            Our financial tool helps you achieve homeownership, even when others say it's impossible.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
              <Input 
                type="email"
                placeholder="Enter your email"
                className="pl-10 border-zinc-200 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button className="bg-[#8b76e0] hover:bg-[#7a66cf] flex items-center gap-2 py-2">
              Calculate Buying Power
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-zinc-50 border-zinc-100 hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="bg-[#8b76e0]/10 p-2 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="#8b76e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="font-medium">Lower DTI ratio</div>
            </Card>
            
            <Card className="p-4 bg-zinc-50 border-zinc-100 hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="bg-[#8b76e0]/10 p-2 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 5L8 12L16 19" stroke="#8b76e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="font-medium">Higher approval</div>
            </Card>
          </div>
        </div>
        
        {/* Right Image */}
        <div className="hidden md:block flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent z-10 opacity-80"></div>
          <AspectRatio ratio={16/9} className="h-full">
            <img 
              src="/lovable-uploads/568b51fd-afc4-4ca5-9554-5f21d204b036.png" 
              alt="Modern home exterior" 
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
      </main>

      {/* Buying Power Calculator Section */}
      <section className="py-12 px-8 md:px-16 bg-white border-t border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Left side - Input */}
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Discover your <span className="text-[#8b76e0]">true buying power</span>
              </h2>
              
              <p className="text-zinc-600">
                See how our mortgage solutions can increase your home purchasing power.
              </p>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700">
                  Your annual income
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    type="text"
                    placeholder="100,000"
                    className="pl-10 border-zinc-200"
                    value={income}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '');
                      setIncome(value);
                    }}
                  />
                </div>
                
                <Button className="w-full bg-[#8b76e0] hover:bg-[#7a66cf]">
                  Calculate
                </Button>
              </div>
            </div>
            
            {/* Right side - Results */}
            <div className="w-full md:w-1/2 space-y-6">
              <Card className="p-6 border-2 border-[#8b76e0]/20 bg-gradient-to-br from-white to-[#8b76e0]/5">
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="h-6 w-6 text-[#8b76e0]" />
                  <h3 className="text-xl font-semibold">Your Buying Power</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="text-sm text-zinc-500">Standard Lender</div>
                    <div className="text-2xl font-bold">{formatCurrency(standardBuyingPower)}</div>
                  </div>
                  
                  <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-zinc-300 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-zinc-500 flex items-center">
                      <span className="font-semibold text-[#8b76e0]">Moneybucket.ai</span>
                      <span className="ml-2 bg-[#8b76e0]/10 text-[#8b76e0] text-xs px-2 py-0.5 rounded-full">
                        +{percentageIncrease}%
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-[#8b76e0]">{formatCurrency(enhancedBuyingPower)}</div>
                  </div>
                  
                  <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-[#8b76e0] rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-100">
                    <div className="text-zinc-600 text-sm">
                      That's an additional <span className="font-semibold text-[#8b76e0]">{formatCurrency(buyingPowerIncrease)}</span> in home buying power!
                    </div>
                  </div>
                </div>
              </Card>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/mortgage-planning">
                  Get your personalized mortgage plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-8 md:px-16 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#8b76e0]" />
            <span className="font-medium">Moneybucket.ai</span>
          </div>
          
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link to="/mortgage-planning" className="hover:text-[#8b76e0]">Mortgage</Link>
            <Link to="/dashboard" className="hover:text-[#8b76e0]">Dashboard</Link>
            <a href="#" className="hover:text-[#8b76e0]">Privacy</a>
          </div>
          
          <div className="text-sm text-zinc-400">
            © {new Date().getFullYear()} Moneybucket.ai
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;
