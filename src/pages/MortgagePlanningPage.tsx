
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MortgageProvider } from "@/context/MortgageContext";
import MortgageCalculator from "@/components/MortgageCalculator";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Home, User, BarChart, Settings } from "lucide-react";

const MortgagePlanningPage = () => {
  return (
    <>
      <Helmet>
        <title>Mortgage Planning | Moneybucket.ai</title>
        <meta name="description" content="Calculate your maximum purchasing power and plan your mortgage" />
      </Helmet>
      <MortgageProvider>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-finance-purple" />
                  <span className="font-bold text-lg">Moneybucket.ai</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                  <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-finance-purple transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/mortgage-planning" className="text-sm font-medium text-finance-purple">
                    Mortgage
                  </Link>
                  <Link to="/financial-goals" className="text-sm font-medium text-foreground hover:text-finance-purple transition-colors">
                    Goals
                  </Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link to="/dashboard">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link to="/dashboard">
                    <BarChart className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                  <Link to="/dashboard">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 py-8">
              <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
                <Link to="/">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <motion.h1 
                  className="text-2xl md:text-3xl font-bold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Mortgage Planning
                </motion.h1>
              </div>
              
              <motion.div
                className="prose prose-lg max-w-none text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p>
                  Calculate your maximum purchasing power and create a personalized mortgage plan
                  that fits your financial situation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <MortgageCalculator />
              </motion.div>
            </div>
          </main>
          
          {/* Footer for mobile navigation */}
          <footer className="md:hidden py-4 border-t border-border bg-card fixed bottom-0 left-0 right-0 z-10">
            <nav className="grid grid-cols-4 gap-1">
              <Link to="/" className="flex flex-col items-center justify-center text-xs text-muted-foreground">
                <Home className="h-5 w-5 mb-1" />
                <span>Home</span>
              </Link>
              <Link to="/mortgage-planning" className="flex flex-col items-center justify-center text-xs text-finance-purple">
                <BarChart className="h-5 w-5 mb-1" />
                <span>Mortgage</span>
              </Link>
              <Link to="/financial-goals" className="flex flex-col items-center justify-center text-xs text-muted-foreground">
                <ArrowLeft className="h-5 w-5 mb-1 rotate-45" />
                <span>Goals</span>
              </Link>
              <Link to="/dashboard" className="flex flex-col items-center justify-center text-xs text-muted-foreground">
                <User className="h-5 w-5 mb-1" />
                <span>Account</span>
              </Link>
            </nav>
          </footer>
        </div>
      </MortgageProvider>
    </>
  );
};

export default MortgagePlanningPage;
