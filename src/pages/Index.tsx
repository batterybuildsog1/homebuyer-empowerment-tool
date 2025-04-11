
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Finance Empowerment Tool | Home</title>
        <meta name="description" content="Master your finances with our all-in-one financial planning tool" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <header className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Finance Empowerment Tool
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Track expenses, manage income, and plan your path to homeownership
            </motion.p>
          </header>

          <main>
            <motion.div 
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card 
                title="Financial Dashboard" 
                description="Get a complete overview of your finances, track expenses, and monitor income."
                icon="📊"
                link="/dashboard"
              />
              <Card 
                title="Mortgage Planning" 
                description="Calculate how much home you can afford and create a roadmap to homeownership."
                icon="🏠"
                link="/mortgage-planning"
              />
              <Card 
                title="Financial Goals" 
                description="Set and track your financial goals with personalized recommendations."
                icon="🎯"
                link="/financial-goals"
              />
            </motion.div>
          </main>

          <footer className="mt-16 py-4 sticky bottom-0 left-0 right-0 z-10">
            <nav className="grid grid-cols-4 gap-2 shadow-md rounded-md border-t bg-card">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Dashboard</Button>
              </Link>
              <Link to="/mortgage-planning">
                <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Mortgage</Button>
              </Link>
              <Link to="/financial-goals">
                <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Goals</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full transition-colors duration-300 hover:bg-primary/10 active:scale-95">Home</Button>
              </Link>
            </nav>
          </footer>
        </div>
      </div>
    </>
  );
};

// Card component for the homepage
const Card = ({ title, description, icon, link }: { title: string; description: string; icon: string; link: string }) => {
  return (
    <Link to={link} className="block h-full">
      <motion.div 
        className="border rounded-lg p-6 h-full bg-card hover:shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  );
};

export default Index;
