
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import AuthButton from "@/components/ui/AuthButton";
import { 
  BarChart3, 
  Home, 
  TargetIcon, 
  ChevronRight,
  Check,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    setIsLoggedIn(userLoggedIn);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Finance Empowerment Tool | Home</title>
        <meta name="description" content="Master your finances with our all-in-one financial planning tool" />
      </Helmet>
      
      {/* Main container */}
      <div className="min-h-screen bg-background">
        {/* Header/Navigation */}
        <header className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-r from-primary-500 to-finance-purple flex items-center justify-center text-white font-bold">
              FE
            </div>
            <span className="text-lg font-semibold hidden md:block">Finance Empowerment</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/mortgage-planning" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mortgage
            </Link>
            <Link to="/financial-goals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Goals
            </Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <AuthButton />
            {!isLoggedIn && (
              <Button size="sm" className="hidden md:flex">
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            )}
            
            <button 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden container mx-auto px-4 pb-4 pt-2">
            <nav className="flex flex-col space-y-4 border-t pt-4">
              <Link to="/" className="text-sm hover:text-primary transition-colors py-2">
                Home
              </Link>
              <Link to="/mortgage-planning" className="text-sm hover:text-primary transition-colors py-2">
                Mortgage
              </Link>
              <Link to="/financial-goals" className="text-sm hover:text-primary transition-colors py-2">
                Goals
              </Link>
              <Link to="/dashboard" className="text-sm hover:text-primary transition-colors py-2">
                Dashboard
              </Link>
              
              {!isLoggedIn && (
                <div className="pt-2">
                  <Button asChild size="sm" className="w-full">
                    <Link to="/auth?tab=signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-finance-purple"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              A more effective way to manage finances
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Track expenses, manage income, and plan your path to homeownership with our all-in-one financial tool.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button size="lg" className="px-8" asChild>
                <Link to={isLoggedIn ? "/mortgage-planning" : "/auth?tab=signup"}>
                  {isLoggedIn ? "Go to Dashboard" : "Start Free"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group" asChild>
                <Link to={isLoggedIn ? "/mortgage-planning" : "/auth"}>
                  {isLoggedIn ? "Mortgage Planning" : "Learn more"} <ChevronRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>
          </div>
          
          {/* Decorative gradient shape */}
          <div className="relative h-24 md:h-40 mt-16 overflow-hidden">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-finance-purple/20 to-primary-500/20 blur-3xl opacity-50" />
          </div>
        </section>
        
        {/* Features Section */}
        <section className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Core Features</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <FeatureCard 
                icon={<BarChart3 className="size-8 text-primary" />}
                title="Financial Dashboard"
                description="Get a complete overview of your finances, track expenses, and monitor income in real-time."
                link="/dashboard"
              />
              
              {/* Feature 2 */}
              <FeatureCard 
                icon={<Home className="size-8 text-finance-green" />}
                title="Mortgage Planning"
                description="Calculate how much home you can afford and create a roadmap to homeownership."
                link="/mortgage-planning"
              />
              
              {/* Feature 3 */}
              <FeatureCard 
                icon={<TargetIcon className="size-8 text-finance-gold" />}
                title="Financial Goals"
                description="Set and track your financial goals with personalized recommendations for your future."
                link="/financial-goals"
              />
            </div>
          </div>
        </section>
        
        {/* Pricing section */}
        <section className="container mx-auto px-4 py-12 md:py-24 bg-muted/50 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mb-12">Start free, upgrade when you need more features.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Tier */}
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Basic</h3>
                  <div className="mt-2 text-3xl font-bold">$0 <span className="text-base font-normal text-muted-foreground">/month</span></div>
                </div>
                <ul className="space-y-3 my-6">
                  <PricingItem>Basic expense tracking</PricingItem>
                  <PricingItem>Income monitoring</PricingItem>
                  <PricingItem>Mortgage calculator</PricingItem>
                  <PricingItem>3 financial goals</PricingItem>
                </ul>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to={isLoggedIn ? "/dashboard" : "/auth?tab=signup"}>
                    {isLoggedIn ? "Access Dashboard" : "Get Started"}
                  </Link>
                </Button>
              </div>
              
              {/* Pro Tier */}
              <div className="bg-gradient-to-b from-card to-card border-2 border-primary/20 rounded-xl p-6 shadow-lg relative">
                <div className="absolute -top-3 right-4 bg-primary text-white text-xs px-3 py-1 rounded-full">Popular</div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <div className="mt-2 text-3xl font-bold">$9 <span className="text-base font-normal text-muted-foreground">/month</span></div>
                </div>
                <ul className="space-y-3 my-6">
                  <PricingItem>Advanced expense categories</PricingItem>
                  <PricingItem>Income forecasting</PricingItem>
                  <PricingItem>Full mortgage planning</PricingItem>
                  <PricingItem>Unlimited financial goals</PricingItem>
                  <PricingItem>Custom reports</PricingItem>
                </ul>
                <Button size="lg" className="w-full" asChild>
                  <Link to={isLoggedIn ? "/dashboard" : "/auth?tab=signup"}>
                    {isLoggedIn ? "Upgrade Now" : "Start Free Trial"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer Section */}
        <footer className="bg-card mt-24 pt-16 pb-8 border-t">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                  <li><Link to="/mortgage-planning" className="text-sm text-muted-foreground hover:text-foreground">Mortgage</Link></li>
                  <li><Link to="/financial-goals" className="text-sm text-muted-foreground hover:text-foreground">Goals</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                  <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                  <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/guides" className="text-sm text-muted-foreground hover:text-foreground">Guides</Link></li>
                  <li><Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">Support</Link></li>
                  <li><Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
                  <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
                  <li><Link to="/security" className="text-sm text-muted-foreground hover:text-foreground">Security</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary-500 to-finance-purple flex items-center justify-center text-white font-bold text-xs">
                  FE
                </div>
                <span className="text-sm font-semibold">Finance Empowerment</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Finance Empowerment. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        
        {/* Mobile navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card/80 backdrop-blur-md border-t md:hidden py-2">
          <div className="grid grid-cols-4 gap-1">
            <Link to="/dashboard" className="flex flex-col items-center py-2">
              <BarChart3 className="size-5 text-muted-foreground" />
              <span className="text-xs mt-1 text-muted-foreground">Dashboard</span>
            </Link>
            <Link to="/mortgage-planning" className="flex flex-col items-center py-2">
              <Home className="size-5 text-muted-foreground" />
              <span className="text-xs mt-1 text-muted-foreground">Mortgage</span>
            </Link>
            <Link to="/financial-goals" className="flex flex-col items-center py-2">
              <TargetIcon className="size-5 text-muted-foreground" />
              <span className="text-xs mt-1 text-muted-foreground">Goals</span>
            </Link>
            <Link to="/" className="flex flex-col items-center py-2">
              <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary">FE</span>
              </div>
              <span className="text-xs mt-1 text-muted-foreground">Home</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

// Helper Components
const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  link 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string;
}) => {
  return (
    <Link to={link}>
      <motion.div 
        className="bg-card rounded-xl p-6 border hover:shadow-md transition-all duration-300"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-4 text-primary flex items-center text-sm font-medium">
          Learn more <ChevronRight className="size-4 ml-1" />
        </div>
      </motion.div>
    </Link>
  );
};

const PricingItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="size-4 text-primary mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
};

export default Index;
