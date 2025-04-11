
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
    <div className="min-h-screen flex flex-col bg-[#1A1F2C] text-white">
      {/* Navigation */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center">
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
          <Button asChild variant="outline" className="hidden md:flex">
            <Link to="/dashboard">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Content */}
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center max-w-2xl mx-auto md:mx-0">
          <Heading as="h1" size="3xl" className="mb-4 leading-tight">
            <span className="text-[#9b87f5]">Buy the house,</span> they said you couldn't.
          </Heading>
          
          <p className="text-lg text-gray-300 mb-8 max-w-xl">
            Our financial planning tool helps you achieve homeownership, 
            even when others say it's impossible. Start your journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input 
                type="email"
                placeholder="Enter your email"
                className="pl-10 bg-white/10 border-white/20 text-white w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button size="lg" className="bg-[#9b87f5] hover:bg-[#8b5cf6] flex items-center gap-2">
              Calculate Your Buying Power
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6">
            <Card className="bg-white/5 border-white/10 w-full sm:w-auto">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#9b87f5]/20 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-[#9b87f5]" />
                </div>
                <div>
                  <div className="font-semibold">Boost your buying power</div>
                  <div className="text-sm text-gray-400">Maximize your mortgage approval</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 w-full sm:w-auto">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-[#9b87f5]/20 p-2 rounded-full">
                  <Users className="h-5 w-5 text-[#9b87f5]" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1F2C] to-transparent z-10"></div>
          <img 
            src="/lovable-uploads/568b51fd-afc4-4ca5-9554-5f21d204b036.png" 
            alt="Modern home exterior" 
            className="w-full h-full object-cover"
          />
        </div>
      </main>

      {/* Bottom Section */}
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
                <li><Link to="/mortgage-planning" className="hover:text-[#9b87f5]">Mortgage Calculator</Link></li>
                <li><Link to="/financial-goals" className="hover:text-[#9b87f5]">Financial Goals</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#9b87f5]">Dashboard</Link></li>
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
