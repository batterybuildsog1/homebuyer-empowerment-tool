
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, DollarSign, Home } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HeroPage = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      {/* Minimal Header */}
      <header className="w-full p-5 md:p-8 flex justify-between items-center border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-[#9b87f5]" />
          <span className="font-medium text-lg">Moneybucket.ai</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-[#9b87f5] transition-colors text-sm">Dashboard</Link>
          <Link to="/mortgage-planning" className="hover:text-[#9b87f5] transition-colors text-sm">Mortgage</Link>
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link to="/dashboard">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#9b87f5] hover:bg-[#8b76e0] h-9">
            <Link to="/dashboard">Get Started</Link>
          </Button>
        </div>
        <div className="md:hidden">
          <Button asChild size="sm" className="bg-[#9b87f5] hover:bg-[#8b76e0]">
            <Link to="/dashboard">Start</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Content */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center max-w-xl mx-auto md:mx-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="text-[#9b87f5]">Buy the house</span> they said you couldn't.
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
            <Button className="bg-[#9b87f5] hover:bg-[#8b76e0] flex items-center gap-2 py-2">
              Calculate Buying Power
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-zinc-50 border-zinc-100 hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="bg-[#9b87f5]/10 p-2 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="font-medium">Lower DTI ratio</div>
            </Card>
            
            <Card className="p-4 bg-zinc-50 border-zinc-100 hover:shadow-md transition-shadow flex items-center gap-3">
              <div className="bg-[#9b87f5]/10 p-2 rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 5L8 12L16 19" stroke="#9b87f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="font-medium">Higher approval</div>
            </Card>
          </div>
        </div>
        
        {/* Right Image */}
        <div className="hidden md:block flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent z-10"></div>
          <AspectRatio ratio={16/9} className="h-full">
            <img 
              src="/lovable-uploads/568b51fd-afc4-4ca5-9554-5f21d204b036.png" 
              alt="Modern home exterior" 
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 px-8 md:px-16 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-[#9b87f5]" />
            <span className="font-medium">Moneybucket.ai</span>
          </div>
          
          <div className="flex gap-8 text-sm text-zinc-500">
            <Link to="/mortgage-planning" className="hover:text-[#9b87f5]">Mortgage</Link>
            <Link to="/dashboard" className="hover:text-[#9b87f5]">Dashboard</Link>
            <a href="#" className="hover:text-[#9b87f5]">Privacy</a>
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
