
import MortgageCalculator from "@/components/MortgageCalculator";
import { MortgageProvider } from "@/context/MortgageContext";

const Index = () => {
  return (
    <MortgageProvider>
      <div className="min-h-screen bg-background">
        <MortgageCalculator />
      </div>
    </MortgageProvider>
  );
};

export default Index;
