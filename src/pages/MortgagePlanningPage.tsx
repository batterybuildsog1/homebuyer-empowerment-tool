
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MortgageProvider } from "@/context/MortgageContext";
import MortgageCalculator from "@/components/MortgageCalculator";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const MortgagePlanningPage = () => {
  return (
    <>
      <Helmet>
        <title>Mortgage Planning | Home Buying Empowerment Tool</title>
        <meta name="description" content="Plan your mortgage and calculate how much home you can afford" />
      </Helmet>
      <MortgageProvider>
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
          <header className="mb-6">
            <motion.h1 
              className="text-2xl font-semibold"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Mortgage Planning
            </motion.h1>
          </header>

          <main>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <MortgageCalculator />
            </motion.div>
          </main>
          
          <footer className="mt-8 py-4 sticky bottom-0 left-0 right-0 z-10">
            <nav className="grid grid-cols-4 gap-2 shadow-md rounded-md border-t bg-card">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/mortgage-planning">
                <Button 
                  variant="ghost" 
                  className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95"
                >
                  Mortgage
                </Button>
              </Link>
              <Link to="/financial-goals">
                <Button 
                  variant="ghost" 
                  className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95"
                >
                  Goals
                </Button>
              </Link>
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95"
                >
                  Home
                </Button>
              </Link>
            </nav>
          </footer>
        </div>
      </MortgageProvider>
    </>
  );
};

export default MortgagePlanningPage;
