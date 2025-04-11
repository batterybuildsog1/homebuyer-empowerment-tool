
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, DollarSign, Home, TrendingUp, Users } from "lucide-react";

const HeroPage = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Navigation */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-[#9b87f5]" />
          <span className="font-bold text-xl">Moneybucket.ai</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:text-[#9b87f5] transition-colors">Home</Link>
          <Link to="/mortgage-planning" className="hover:text-[#9b87f5] transition-colors">Mortgage</Link>
          <Link to="/financial-goals" className="hover:text-[#9b87f5] transition-colors">Goals</Link>
          <Link to="/dashboard" className="hover:text-[#9b87f5] transition-colors">Dashboard</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" className="hidden md:flex border-[#9b87f5] text-[#9b87f5]">
            <Link to="/dashboard">Login</Link>
          </Button>
          <Button asChild className="bg-[#9b87f5] hover:bg-[#7a68c7]">
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Content */}
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center max-w-2xl mx-auto md:mx-0">
          <Heading as="h1" size="3xl" className="mb-4 leading-tight">
            <span className="text-[#9b87f5]">Buy the house,</span> <span className="text-gray-800">they said you couldn't.</span>
          </Heading>
          
          <p className="text-lg text-gray-600 mb-8 max-w-xl">
            Our financial planning tool helps you achieve homeownership, 
            even when others say it's impossible. Start your journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="email"
                placeholder="Enter your email"
                className="pl-10 border-gray-300 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button size="lg" className="bg-[#9b87f5] hover:bg-[#7a68c7] flex items-center gap-2">
              Calculate Your Buying Power
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6">
            <Card className="bg-gray-50 border-gray-100 w-full sm:w-auto">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#9b87f5]/10 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-[#9b87f5]" />
                </div>
                <div>
                  <div className="font-semibold">Boost your buying power</div>
                  <div className="text-sm text-gray-500">Maximize your mortgage approval</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 border-gray-100 w-full sm:w-auto">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#9b87f5]/10 p-2 rounded-full">
                  <Users className="h-5 w-5 text-[#9b87f5]" />
                </div>
                <div>
                  <div className="font-semibold">5,000+ success stories</div>
                  <div className="text-sm text-gray-500">People who found their dream home</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right Image - New house image with lighter styling */}
        <div className="hidden md:block flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent z-10"></div>
          <img 
            src="/lovable-uploads/568b51fd-afc4-4ca5-9554-5f21d204b036.png" 
            alt="Modern house exterior" 
            className="w-full h-full object-cover"
          />
        </div>
      </main>

      {/* Bottom Section - Simplified and more minimal */}
      <footer className="bg-gray-50 py-6 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between gap-8">
            <div className="flex items-center space-x-6">
              <Link to="/mortgage-planning" className="text-gray-600 hover:text-[#9b87f5] transition-colors text-sm">Mortgage</Link>
              <Link to="/financial-goals" className="text-gray-600 hover:text-[#9b87f5] transition-colors text-sm">Goals</Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-[#9b87f5] transition-colors text-sm">Dashboard</Link>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Moneybucket.ai
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;
