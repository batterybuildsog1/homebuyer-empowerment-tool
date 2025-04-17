
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserNav } from '@/components/ui/UserNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ROUTES } from '@/utils/routes';
import ScenarioSwitcher from './ScenarioSwitcher';

interface PageHeaderProps {
  toggleSidebar: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const isMainApp = location.pathname !== ROUTES.root && location.pathname !== ROUTES.auth;
  
  return (
    <header className="sticky top-0 z-40 bg-background border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isMainApp && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Finance Tool</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Only show scenario switcher on mortgage and dashboard pages */}
          {(location.pathname === ROUTES.mortgage || location.pathname === ROUTES.dashboard) && (
            <ScenarioSwitcher />
          )}
          
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
