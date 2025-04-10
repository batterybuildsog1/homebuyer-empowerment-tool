
/**
 * Analytics configuration
 * Enable or disable providers as needed
 */
import { analytics } from './analyticsService';
import { GoogleAnalyticsProvider } from './providers/googleAnalytics';

// Environment variables can be used here
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Configure analytics with providers based on environment
export const configureAnalytics = () => {
  // Only add Google Analytics in production or if explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    if (GA_MEASUREMENT_ID) {
      analytics.addProvider(new GoogleAnalyticsProvider(GA_MEASUREMENT_ID));
    }
  }
};

// Auto-configure analytics
configureAnalytics();
