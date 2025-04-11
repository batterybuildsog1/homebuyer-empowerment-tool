
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import FinancialGoalsPage from "./pages/FinancialGoalsPage";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsRouteObserver />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/financial-goals" element={<FinancialGoalsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
