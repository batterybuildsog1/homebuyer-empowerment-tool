
import { UserData } from './types';

// Storage key for localStorage
const STORAGE_KEY = 'mortgage_calculator_data';

/**
 * Save user data to localStorage
 */
export const saveToLocalStorage = (data: UserData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Load user data from localStorage
 */
export const loadFromLocalStorage = (): UserData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};
