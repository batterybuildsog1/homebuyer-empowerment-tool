
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Home, BarChart3, Target, DollarSign, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ROUTES } from '@/utils/routes';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout, userName } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate(ROUTES.auth);
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null; // Don't render anything while redirecting
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header/Navigation */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to={ROUTES.root} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary-500 to-finance-purple flex items-center justify-center text-white font-semibold text-xs">
                FE
              </div>
              <span className="font-semibold hidden md:inline">Finance Empowerment</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to={ROUTES.dashboard} 
              className={`flex items-center space-x-2 text-sm ${isActive(ROUTES.dashboard) ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to={ROUTES.mortgage} 
              className={`flex items-center space-x-2 text-sm ${isActive(ROUTES.mortgage) ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Home className="h-4 w-4" />
              <span>Mortgage</span>
            </Link>
            
            <Link 
              to={ROUTES.goals} 
              className={`flex items-center space-x-2 text-sm ${isActive(ROUTES.goals) ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Target className="h-4 w-4" />
              <span>Goals</span>
            </Link>
          </nav>
          
          {/* User menu */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Hi, {userName || 'User'}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="p-2 md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-background">
            <nav className="flex flex-col space-y-4">
              <Link 
                to={ROUTES.dashboard}
                className={`flex items-center space-x-3 p-2 rounded-md ${isActive(ROUTES.dashboard) ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to={ROUTES.mortgage}
                className={`flex items-center space-x-3 p-2 rounded-md ${isActive(ROUTES.mortgage) ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Mortgage</span>
              </Link>
              
              <Link 
                to={ROUTES.goals}
                className={`flex items-center space-x-3 p-2 rounded-md ${isActive(ROUTES.goals) ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Target className="h-5 w-5" />
                <span>Goals</span>
              </Link>
              
              <div className="pt-4 mt-2 border-t border-border flex justify-between items-center">
                <div className="text-sm">
                  Hi, {userName || 'User'}
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-t md:hidden">
        <div className="grid grid-cols-3 gap-1">
          <Link 
            to={ROUTES.dashboard}
            className={`flex flex-col items-center py-3 ${isActive(ROUTES.dashboard) ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          
          <Link 
            to={ROUTES.mortgage}
            className={`flex flex-col items-center py-3 ${isActive(ROUTES.mortgage) ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Mortgage</span>
          </Link>
          
          <Link 
            to={ROUTES.goals}
            className={`flex flex-col items-center py-3 ${isActive(ROUTES.goals) ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Target className="h-5 w-5" />
            <span className="text-xs mt-1">Goals</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default PageLayout;
