
/**
 * Core analytics service that handles event tracking across the application
 */

// Analytics provider types
export type AnalyticsEventData = Record<string, any>;

export interface AnalyticsProvider {
  initialize(): Promise<void>;
  trackEvent(eventName: string, data: AnalyticsEventData): void;
  trackPageView(path: string): void;
  setUserProperties(properties: Record<string, any>): void;
}

// Default console logger provider for development
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  async initialize(): Promise<void> {
    console.log('Analytics initialized in development mode');
    return Promise.resolve();
  }

  trackEvent(eventName: string, data: AnalyticsEventData): void {
    console.log(`%cAnalytics Event: ${eventName}`, 'color: purple; font-weight: bold', data);
  }

  trackPageView(path: string): void {
    console.log(`%cPage View: ${path}`, 'color: blue; font-weight: bold');
  }

  setUserProperties(properties: Record<string, any>): void {
    console.log('User Properties:', properties);
  }
}

// Analytics service that manages providers
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;
  private readonly environment: string;

  constructor() {
    this.environment = import.meta.env.MODE || 'development';
    
    // Add console provider by default in development
    if (this.environment === 'development') {
      this.providers.push(new ConsoleAnalyticsProvider());
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await Promise.all(this.providers.map(provider => provider.initialize()));
      this.isInitialized = true;
      console.log(`Analytics initialized with ${this.providers.length} providers`);
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
    // Initialize this provider if the service is already initialized
    if (this.isInitialized) {
      provider.initialize().catch(error => 
        console.error('Failed to initialize provider:', error)
      );
    }
  }

  trackEvent(eventName: string, data: AnalyticsEventData = {}): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized when tracking event:', eventName);
      return;
    }

    // Add environment to all events
    const enrichedData = {
      ...data,
      environment: this.environment,
      timestamp: new Date().toISOString(),
    };

    this.providers.forEach(provider => {
      try {
        provider.trackEvent(eventName, enrichedData);
      } catch (error) {
        console.error(`Error tracking event ${eventName}:`, error);
      }
    });
  }

  trackPageView(path: string): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized when tracking page view:', path);
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.trackPageView(path);
      } catch (error) {
        console.error(`Error tracking page view ${path}:`, error);
      }
    });
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized when setting user properties');
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.setUserProperties(properties);
      } catch (error) {
        console.error('Error setting user properties:', error);
      }
    });
  }
}

// Export a singleton instance
export const analytics = new AnalyticsService();

// Auto-initialize
analytics.initialize().catch(console.error);
