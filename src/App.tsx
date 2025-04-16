
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
import { HelmetProvider } from 'react-helmet-async';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="finance-theme">
        <MortgageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HeroPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/mortgage" element={<MortgagePlanningPage />} />
              <Route path="/goals" element={<FinancialGoalsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </MortgageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
