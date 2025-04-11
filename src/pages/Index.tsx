
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Finance Empowerment Tool</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track expenses, manage income, and plan your path to homeownership
            </p>
          </header>

          <main>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
          </main>

          <footer className="mt-16 py-4">
            <nav className="grid grid-cols-4 gap-2 shadow-md rounded-md border-t bg-card">
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full transition-colors duration-300">Dashboard</Button>
              </Link>
              <Link to="/mortgage-planning">
                <Button variant="ghost" className="w-full transition-colors duration-300">Mortgage</Button>
              </Link>
              <Link to="/financial-goals">
                <Button variant="ghost" className="w-full transition-colors duration-300">Goals</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full transition-colors duration-300">Home</Button>
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
      <div className="border rounded-lg p-6 h-full bg-card hover:shadow-lg transition-all duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

export default Index;
