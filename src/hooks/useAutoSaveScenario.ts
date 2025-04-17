
import { useEffect } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { useMortgageScenarios } from '@/store/mortgageScenarios';
import { toast } from 'sonner';

export const useAutoSaveScenario = () => {
  const { workflowCompleted, userData } = useMortgage();
  const { scenarios, createScenarioFromCurrent } = useMortgageScenarios();

  useEffect(() => {
    const autoSaveScenario = async () => {
      // Only auto-save if workflow is completed and no scenarios exist
      if (workflowCompleted && scenarios.length === 0) {
        const defaultName = `First Home Plan - ${new Date().toLocaleDateString(undefined, { 
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}`;
        
        const scenarioId = await createScenarioFromCurrent(defaultName);
        
        if (scenarioId) {
          toast.success('Your mortgage scenario has been automatically saved');
        }
      }
    };

    void autoSaveScenario();
  }, [workflowCompleted, scenarios.length, createScenarioFromCurrent]);
};
