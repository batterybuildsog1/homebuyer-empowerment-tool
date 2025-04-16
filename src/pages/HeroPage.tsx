
import { useState } from "react";
import { HeroNavigation } from "@/components/hero/HeroNavigation";
import { HeroContent } from "@/components/hero/HeroContent";
import { BuyingPowerCalculator } from "@/components/hero/BuyingPowerCalculator";
import { HeroFooter } from "@/components/hero/HeroFooter";

const HeroPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1F2C] text-white">
      <HeroNavigation 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        {/* Top Hero Content */}
        <HeroContent />

        {/* Buying Power Calculator Section */}
        <BuyingPowerCalculator />
      </main>

      <HeroFooter />
    </div>
  );
};

export default HeroPage;
