
// Feature flag definitions
export interface FeatureFlags {
  scenariosEnabled: boolean;
  scenariosReadOnly: boolean;
  advancedSyncEnabled: boolean;
}

// Default feature flags
const defaultFlags: FeatureFlags = {
  scenariosEnabled: true,      // Enable the scenarios feature
  scenariosReadOnly: false,    // If true, users can only view scenarios, not save
  advancedSyncEnabled: false,  // Enable advanced sync with conflict resolution
};

/**
 * Get feature flags based on environment variables or defaults
 * In production, these would come from a service like LaunchDarkly or a backend API
 */
export const getFeatureFlags = (): FeatureFlags => {
  // In a real app, we'd either use environment variables or fetch from a service
  // For now, we'll use window.localStorage for development purposes
  
  try {
    // Check if we have stored flags
    const storedFlags = localStorage.getItem('featureFlags');
    if (storedFlags) {
      return { ...defaultFlags, ...JSON.parse(storedFlags) };
    }
  } catch (error) {
    console.error('Error parsing feature flags:', error);
  }
  
  return defaultFlags;
};

/**
 * Save feature flags to localStorage (for development purposes)
 */
export const saveFeatureFlags = (flags: Partial<FeatureFlags>): void => {
  try {
    const currentFlags = getFeatureFlags();
    const updatedFlags = { ...currentFlags, ...flags };
    localStorage.setItem('featureFlags', JSON.stringify(updatedFlags));
  } catch (error) {
    console.error('Error saving feature flags:', error);
  }
};

/**
 * Hook to access feature flags
 */
export const useFeatureFlags = () => {
  return getFeatureFlags();
};
