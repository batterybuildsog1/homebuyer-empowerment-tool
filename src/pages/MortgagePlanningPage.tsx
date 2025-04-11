
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MortgageProvider } from "@/context/MortgageContext";
import MortgageCalculator from "@/components/MortgageCalculator";
import { Helmet } from "react-helmet-async";

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
            <h1 className="text-2xl font-semibold">Mortgage Planning</h1>
          </header>

          <main>
            <MortgageCalculator />
          </main>
          
          <footer className="mt-8 py-4">
            <nav className="grid grid-cols-4 gap-2 shadow-md rounded-md border-t bg-card">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full">Dashboard</Button>
              </Link>
              <Link to="/mortgage-planning">
                <Button variant="ghost" className="w-full">Mortgage</Button>
              </Link>
              <Link to="/financial-goals">
                <Button variant="ghost" className="w-full">Goals</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full">Home</Button>
              </Link>
            </nav>
          </footer>
        </div>
      </MortgageProvider>
    </>
  );
};

export default MortgagePlanningPage;
