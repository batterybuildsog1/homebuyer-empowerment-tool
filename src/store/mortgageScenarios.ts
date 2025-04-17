
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserData } from '@/context/mortgage/types';
import { supabase } from '@/integrations/supabase/client';
import { useMortgage } from '@/context/MortgageContext';
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
  
  // Actions
  fetchScenarios: () => Promise<void>;
  loadScenario: (id: string) => Promise<void>;
  saveScenario: (name: string) => Promise<string | null>;
  updateScenario: (id: string, updates?: { name?: string }) => Promise<void>;
  duplicateScenario: (id: string, newName: string) => Promise<string | null>;
  archiveScenario: (id: string) => Promise<void>;
  createScenarioFromCurrent: (name: string) => Promise<string | null>;
}

// Create the store with persistence
export const useMortgageScenarios = create<MortgageScenariosState>()(
  persist(
    (set, get) => ({
      currentScenarioId: null,
      scenarios: [],
      isLoading: false,
      isLoadingList: false,

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
      loadScenario: async (id: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase
            .from('mortgage_scenarios')
            .select('data')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          // Get the mortgage context functions directly (without getState)
          const mortgageContext = useMortgage();
          
          // Safely cast the data with type checking
          if (data.data && typeof data.data === 'object' && 
              'location' in data.data && 
              'financials' in data.data &&
              'loanDetails' in data.data &&
              'results' in data.data) {
            // Set the user data from the loaded scenario
            mortgageContext.setUserData(data.data as UserData);
            mortgageContext.completeWorkflow();
            
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
        // Get the mortgage context data directly (without getState)
        const mortgageContext = useMortgage();
        const { userData } = mortgageContext;
        
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase
            .from('mortgage_scenarios')
            .insert([{ 
              name, 
              data: userData 
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
        // Get the mortgage context data directly (without getState)
        const mortgageContext = useMortgage();
        const { userData } = mortgageContext;
        
        set({ isLoading: true });
        
        try {
          const updateData: any = { 
            data: userData, 
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
