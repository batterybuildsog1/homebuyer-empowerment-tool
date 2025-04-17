
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData } from '@/context/mortgage/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Metadata for a scenario in the list view
export interface ScenarioMeta {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  isArchived: boolean;
}

interface MortgageScenariosState {
  // Currently loaded scenario ID
  currentScenarioId: string | null;
  
  // List of available scenarios (metadata only)
  scenarios: ScenarioMeta[];
  
  // Loading states
  isLoading: boolean;
  isLoadingList: boolean;
  
  // User data to use when saving scenarios
  currentUserData: UserData | null;
  
  // Actions
  setCurrentUserData: (userData: UserData) => void;
  fetchScenarios: () => Promise<void>;
  loadScenario: (id: string, setUserDataCallback: (data: UserData) => void, completeWorkflowCallback: () => void) => Promise<void>;
  saveScenario: (name: string) => Promise<string | null>;
  updateScenario: (id: string, updates?: { name?: string }) => Promise<void>;
  duplicateScenario: (id: string, newName: string) => Promise<string | null>;
  archiveScenario: (id: string) => Promise<void>;
  createScenarioFromCurrent: (name: string) => Promise<string | null>;
}

// Helper types for Supabase JSON conversion
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Create the store with persistence
export const useMortgageScenarios = create<MortgageScenariosState>()(
  persist(
    (set, get) => ({
      currentScenarioId: null,
      scenarios: [],
      isLoading: false,
      isLoadingList: false,
      currentUserData: null,
      
      // Set current user data for scenario operations
      setCurrentUserData: (userData: UserData) => {
        set({ currentUserData: userData });
      },

      // Fetch all scenarios for the current user
      fetchScenarios: async () => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          console.log('No active session, skipping scenario fetch');
          return;
        }

        set({ isLoadingList: true });
        
        try {
          const { data, error } = await supabase
            .from('mortgage_scenarios')
            .select('id, name, created_at, updated_at, is_archived')
            .eq('is_archived', false)
            .order('updated_at', { ascending: false });
            
          if (error) throw error;
          
          const formattedScenarios: ScenarioMeta[] = data.map(scenario => ({
            id: scenario.id,
            name: scenario.name,
            createdAt: scenario.created_at,
            updatedAt: scenario.updated_at,
            isArchived: scenario.is_archived
          }));
          
          set({ scenarios: formattedScenarios });
        } catch (error) {
          console.error('Error fetching scenarios:', error);
          toast.error('Failed to load your saved scenarios');
        } finally {
          set({ isLoadingList: false });
        }
      },

      // Load a specific scenario into the mortgage context
      loadScenario: async (id: string, setUserDataCallback, completeWorkflowCallback) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase
            .from('mortgage_scenarios')
            .select('data')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          // Safely cast the data with type checking and assertion
          const scenarioData = data.data as unknown;
          
          if (typeof scenarioData === 'object' && scenarioData !== null &&
              'location' in scenarioData && 
              'financials' in scenarioData &&
              'loanDetails' in scenarioData &&
              'results' in scenarioData) {
            // Set the user data from the loaded scenario using the callback
            setUserDataCallback(scenarioData as UserData);
            completeWorkflowCallback();
            
            // Update current scenario ID
            set({ currentScenarioId: id });
            
            toast.success('Scenario loaded successfully');
          } else {
            throw new Error('Invalid scenario data format');
          }
        } catch (error) {
          console.error('Error loading scenario:', error);
          toast.error('Failed to load scenario');
        } finally {
          set({ isLoading: false });
        }
      },

      // Save current mortgage data as a new scenario
      saveScenario: async (name: string) => {
        const userData = get().currentUserData;
        
        if (!userData) {
          toast.error('No mortgage data available to save');
          return null;
        }
        
        set({ isLoading: true });
        
        try {
          // Convert userData to a JSON-compatible format
          const jsonData = JSON.parse(JSON.stringify(userData)) as Json;
          
          const { data, error } = await supabase
            .from('mortgage_scenarios')
            .insert([{ 
              name, 
              data: jsonData
            }])
            .select('id')
            .single();
            
          if (error) throw error;
          
          // Refresh the scenarios list
          await get().fetchScenarios();
          
          // Set current scenario ID to the newly created one
          set({ currentScenarioId: data.id });
          
          toast.success('Scenario saved successfully');
          return data.id;
        } catch (error) {
          console.error('Error saving scenario:', error);
          toast.error('Failed to save scenario');
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Update an existing scenario
      updateScenario: async (id: string, updates = {}) => {
        const userData = get().currentUserData;
        
        if (!userData) {
          toast.error('No mortgage data available to update');
          return;
        }
        
        set({ isLoading: true });
        
        try {
          // Convert userData to a JSON-compatible format
          const jsonData = JSON.parse(JSON.stringify(userData)) as Json;
          
          const updateData: any = { 
            data: jsonData, 
            updated_at: new Date().toISOString()
          };
          
          // Add optional name update if provided
          if (updates.name) {
            updateData.name = updates.name;
          }
          
          const { error } = await supabase
            .from('mortgage_scenarios')
            .update(updateData)
            .eq('id', id);
            
          if (error) throw error;
          
          // Refresh the scenarios list
          await get().fetchScenarios();
          
          toast.success('Scenario updated successfully');
        } catch (error) {
          console.error('Error updating scenario:', error);
          toast.error('Failed to update scenario');
        } finally {
          set({ isLoading: false });
        }
      },

      // Duplicate an existing scenario
      duplicateScenario: async (id: string, newName: string) => {
        set({ isLoading: true });
        
        try {
          // First, get the scenario to duplicate
          const { data: sourceScenario, error: fetchError } = await supabase
            .from('mortgage_scenarios')
            .select('data')
            .eq('id', id)
            .single();
            
          if (fetchError) throw fetchError;
          
          // Insert as a new scenario with new name
          const { data, error } = await supabase
            .from('mortgage_scenarios')
            .insert([{ 
              name: newName, 
              data: sourceScenario.data 
            }])
            .select('id')
            .single();
            
          if (error) throw error;
          
          // Refresh the scenarios list
          await get().fetchScenarios();
          
          toast.success('Scenario duplicated successfully');
          return data.id;
        } catch (error) {
          console.error('Error duplicating scenario:', error);
          toast.error('Failed to duplicate scenario');
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Archive a scenario (soft delete)
      archiveScenario: async (id: string) => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase
            .from('mortgage_scenarios')
            .update({ 
              is_archived: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
            
          if (error) throw error;
          
          // Update current scenario ID if it was the archived one
          if (get().currentScenarioId === id) {
            set({ currentScenarioId: null });
          }
          
          // Refresh the scenarios list
          await get().fetchScenarios();
          
          toast.success('Scenario archived successfully');
        } catch (error) {
          console.error('Error archiving scenario:', error);
          toast.error('Failed to archive scenario');
        } finally {
          set({ isLoading: false });
        }
      },

      // Create a new scenario from current context data
      createScenarioFromCurrent: async (name: string) => {
        return get().saveScenario(name);
      }
    }),
    {
      name: 'mortgage-scenarios-storage',
      partialize: (state) => ({
        currentScenarioId: state.currentScenarioId,
        // We don't persist scenarios list as we'll fetch it from the server
      }),
    }
  )
);
