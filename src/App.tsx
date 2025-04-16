
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import HeroPage from './pages/HeroPage';
import DashboardPage from './pages/DashboardPage';
import MortgagePlanningPage from './pages/MortgagePlanningPage';
import FinancialGoalsPage from './pages/FinancialGoalsPage';
import NotFound from './pages/NotFound';
import { MortgageProvider } from '@/context/MortgageContext';
import { UserProvider } from '@/context/UserContext';
import { HelmetProvider } from 'react-helmet-async';
import AuthPage from './pages/AuthPage';
import { ROUTES } from './utils/routes';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="finance-theme">
        <UserProvider>
          <MortgageProvider>
            <Router>
              <Routes>
                <Route path={ROUTES.root} element={<HeroPage />} />
                <Route path={ROUTES.dashboard} element={<DashboardPage />} />
                <Route path={ROUTES.mortgage} element={<MortgagePlanningPage />} />
                <Route path={ROUTES.goals} element={<FinancialGoalsPage />} />
                <Route path={ROUTES.auth} element={<AuthPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </MortgageProvider>
        </UserProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
