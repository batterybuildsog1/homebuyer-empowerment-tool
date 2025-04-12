import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign, Home, TrendingUp, Users, Menu, X } from "lucide-react";
import { Mail } from "@/components/ui/icons";
import { formatCurrency } from "@/utils/formatters";
import { calculateMaxPurchasePrice } from "@/utils/mortgage/loanCalculations";

const HeroPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [standardPrice, setStandardPrice] = useState(0);
  const [enhancedPrice, setEnhancedPrice] = useState(0);
  const [percentIncrease, setPercentIncrease] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    setIsLoggedIn(userLoggedIn);
  }, []);

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

  // Handle get started click
  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/mortgage-planning');
    } else {
      navigate('/auth');
    }
  };

  // Handle email submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate('/auth?email=' + encodeURIComponent(email));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1F2C] text-white">
      {/* Navigation */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-[#8b76e0]" />
          <span className="font-bold text-xl">Moneybucket.ai</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-[#8b76e0] transition-colors">Home</Link>
          <Link to="/mortgage-planning" className="hover:text-[#8b76e0] transition-colors">Mortgage</Link>
          <Link to="/financial-goals" className="hover:text-[#8b76e0] transition-colors">Goals</Link>
          <Link to="/dashboard" className="hover:text-[#8b76e0] transition-colors">Dashboard</Link>
        </nav>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                <Link to="/mortgage-planning">Mortgage Planning</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                <Link to="/auth">Login</Link>
              </Button>
              <Button asChild className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#232738] p-4 border-b border-white/10">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="py-2 hover:text-[#8b76e0] transition-colors">Home</Link>
            <Link to="/mortgage-planning" className="py-2 hover:text-[#8b76e0] transition-colors">Mortgage</Link>
            <Link to="/financial-goals" className="py-2 hover:text-[#8b76e0] transition-colors">Goals</Link>
            <Link to="/dashboard" className="py-2 hover:text-[#8b76e0] transition-colors">Dashboard</Link>
            
            <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
              {isLoggedIn ? (
                <>
                  <Button asChild size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                    <Link to="/mortgage-planning">Mortgage Planning</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                    <Link to="/auth?tab=signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        {/* Top Hero Content */}
        <div className="flex flex-col md:flex-row">
          {/* Left Content */}
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-center max-w-2xl mx-auto md:mx-0">
            <Heading as="h1" size="3xl" className="mb-4 leading-tight">
              <span className="text-[#8b76e0]">Buy the house,</span> they said you couldn't.
            </Heading>
            
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              Our financial planning tool helps you achieve homeownership, 
              even when others say it's impossible.
            </p>
            
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input 
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 bg-white/10 border-white/20 text-white w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="bg-[#8b76e0] hover:bg-[#7b66d0] flex items-center gap-2">
                Get My Buying Power
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Card className="bg-white/5 border-white/10 w-full sm:w-auto">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-[#8b76e0]/20 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-[#8b76e0]" />
                  </div>
                  <div>
                    <div className="font-semibold">Boost your buying power</div>
                    <div className="text-sm text-gray-400">Maximize your mortgage approval</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 w-full sm:w-auto">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-[#8b76e0]/20 p-2 rounded-full">
                    <Users className="h-5 w-5 text-[#8b76e0]" />
                  </div>
                  <div>
                    <div className="font-semibold">5,000+ success stories</div>
                    <div className="text-sm text-gray-400">People who found their dream home</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="hidden md:block flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1F2C] to-transparent z-10 opacity-80"></div>
            <img 
              src="/lovable-uploads/568b51fd-afc4-4ca5-9554-5f21d204b036.png" 
              alt="Modern home exterior" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Buying Power Calculator Section */}
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
                onClick={handleGetStarted}
              >
                Get my personalized buying power
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-black/30 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Heading as="h3" size="sm" className="mb-4">Moneybucket.ai</Heading>
              <p className="text-gray-400 text-sm">
                Your financial planning companion for achieving homeownership
              </p>
            </div>
            <div>
              <Heading as="h3" size="sm" className="mb-4">Quick Links</Heading>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/mortgage-planning" className="hover:text-[#8b76e0]">Mortgage Calculator</Link></li>
                <li><Link to="/financial-goals" className="hover:text-[#8b76e0]">Financial Goals</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#8b76e0]">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <Heading as="h3" size="sm" className="mb-4">Contact</Heading>
              <p className="text-gray-400 text-sm">
                support@moneybucket.ai<br />
                (555) 123-4567
              </p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Moneybucket.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;
