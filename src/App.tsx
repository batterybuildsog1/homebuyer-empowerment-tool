
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { UserProvider } from "./context/UserContext";
import HeroPage from "./pages/HeroPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import FinancialGoalsPage from "./pages/FinancialGoalsPage";
import MortgagePlanningPage from "./pages/MortgagePlanningPage";

// Ensure analytics is loaded
import "@/services/analytics/analyticsConfig";

const queryClient = new QueryClient();

// Analytics route observer component
const AnalyticsRouteObserver = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  
  useEffect(() => {
    // This is just a placeholder that ensures the analytics route tracking is initialized
    // The actual tracking is done in the useAnalytics hook
    console.debug(
      "Route changed:", 
      location.pathname, 
      "Navigation type:", 
      navigationType
    );
  }, [location, navigationType]);
  
  return null;
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsRouteObserver />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HeroPage />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected routes */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/financial-goals" element={
                <ProtectedRoute>
                  <FinancialGoalsPage />
                </ProtectedRoute>
              } />
              <Route path="/mortgage-planning" element={
                <ProtectedRoute>
                  <MortgagePlanningPage />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
