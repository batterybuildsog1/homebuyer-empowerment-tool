
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heading } from "@/components/ui/Heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Users, Mail } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useMortgage } from "@/context/MortgageContext";
import { toast } from "sonner";
import { ROUTES } from "@/utils/routes";

export const HeroContent = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { isLoggedIn } = useUser();
  
  // Use the mortgage context only if user is logged in
  const mortgageContext = isLoggedIn ? useMortgage() : null;
  const isMortgageComplete = mortgageContext?.isMortgageWorkflowCompleted() || false;

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
    toast.success("Welcome back! Here's your financial dashboard.");
  };

  // Handle email submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate(`${ROUTES.auth}?email=${encodeURIComponent(email)}`);
    } else {
      // No email, just navigate to auth page
      navigate(ROUTES.auth);
    }
  };

  return (
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
  );
};
