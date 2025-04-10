
/**
 * Hook to provide analytics tracking throughout the app
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics/analyticsService';

export const useAnalytics = () => {
  const location = useLocation();
  
  // Track page views automatically when route changes
  useEffect(() => {
    analytics.trackPageView(location.pathname);
  }, [location.pathname]);
  
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
  };
};

// Export analytics events enumeration for consistency
export enum AnalyticsEvents {
  // User interaction events
  FORM_SUBMITTED = 'form_submitted',
  FORM_ERROR = 'form_error',
  
  // Mortgage calculator specific events
  FINANCIAL_STEP_SUBMITTED = 'financial_step_submitted',
  LOAN_DETAILS_UPDATED = 'loan_details_updated',
  RESULTS_VIEWED = 'results_viewed',
  
  // Selected factors events
  FACTOR_SELECTED = 'factor_selected',
  FACTOR_DESELECTED = 'factor_deselected',
}
