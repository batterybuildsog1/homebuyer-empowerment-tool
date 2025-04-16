
import React from "react";
import { Helmet } from "react-helmet-async";
import { HeroContent } from "@/components/hero/HeroContent";
import { HeroNavigation } from "@/components/hero/HeroNavigation";
import { HeroFooter } from "@/components/hero/HeroFooter";
import { RatesDashboard } from "@/components/rates/RatesDashboard";

const HeroPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#1A1F2C]">
      <Helmet>
        <title>Finance Empowerment Tool</title>
        <meta 
          name="description" 
          content="Master your finances and achieve your home buying goals" 
        />
      </Helmet>
      
      <HeroNavigation />
      
      <main className="flex-grow">
        <section className="min-h-[80vh] flex items-center border-b border-white/10">
          <HeroContent />
        </section>
        
        <section className="py-16 bg-gradient-to-b from-[#1A1F2C] to-[#101218]">
          <RatesDashboard />
        </section>
      </main>
      
      <HeroFooter />
    </div>
  );
};

export default HeroPage;
