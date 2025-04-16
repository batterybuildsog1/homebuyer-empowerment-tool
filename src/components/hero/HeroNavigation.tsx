
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { ROUTES } from "@/utils/routes";

type HeroNavigationProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const HeroNavigation = ({ mobileMenuOpen, setMobileMenuOpen }: HeroNavigationProps) => {
  const { isLoggedIn } = useUser();
  
  return (
    <>
      {/* Navigation */}
      <header className="w-full p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-[#8b76e0]" />
          <span className="font-bold text-xl">Moneybucket.ai</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to={ROUTES.root} className="hover:text-[#8b76e0] transition-colors">Home</Link>
          <Link to={ROUTES.mortgage} className="hover:text-[#8b76e0] transition-colors">Mortgage</Link>
          <Link to={ROUTES.goals} className="hover:text-[#8b76e0] transition-colors">Goals</Link>
          <Link to={ROUTES.dashboard} className="hover:text-[#8b76e0] transition-colors">Dashboard</Link>
        </nav>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                <Link to={ROUTES.dashboard}>Dashboard</Link>
              </Button>
              <Button asChild className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                <Link to={ROUTES.mortgage}>Mortgage Planning</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                <Link to={ROUTES.auth}>Login</Link>
              </Button>
              <Button asChild className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                <Link to={`${ROUTES.auth}?tab=signup`}>Get Started</Link>
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
            <Link to={ROUTES.root} className="py-2 hover:text-[#8b76e0] transition-colors">Home</Link>
            <Link to={ROUTES.mortgage} className="py-2 hover:text-[#8b76e0] transition-colors">Mortgage</Link>
            <Link to={ROUTES.goals} className="py-2 hover:text-[#8b76e0] transition-colors">Goals</Link>
            <Link to={ROUTES.dashboard} className="py-2 hover:text-[#8b76e0] transition-colors">Dashboard</Link>
            
            <div className="pt-2 border-t border-white/10 flex flex-col space-y-2">
              {isLoggedIn ? (
                <>
                  <Button asChild size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                    <Link to={ROUTES.dashboard}>Dashboard</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                    <Link to={ROUTES.mortgage}>Mortgage Planning</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white">
                    <Link to={ROUTES.auth}>Login</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-[#8b76e0] hover:bg-[#7b66d0] text-white">
                    <Link to={`${ROUTES.auth}?tab=signup`}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
