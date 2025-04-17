
import { useState } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { useMortgageScenarios } from '@/store/mortgageScenarios';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';
import { defaultUserData } from '@/context/mortgage/defaultData';
import { toast } from 'sonner';

export const useScenarioManager = () => {
  const navigate = useNavigate();
  const { userData, setUserData, completeWorkflow, setWorkflowCompleted } = useMortgage();
  const {
    scenarios,
    currentScenarioId,
    isLoading,
    isLoadingList,
    fetchScenarios,
    loadScenario,
    saveScenario,
    updateScenario,
    duplicateScenario,
    archiveScenario,
    createScenarioFromCurrent,
  } = useMortgageScenarios();

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioListOpen, setScenarioListOpen] = useState(false);
  const [isRenamingScenario, setIsRenamingScenario] = useState(false);
  const [renamedScenarioId, setRenamedScenarioId] = useState<string | null>(null);
  const [renamedScenarioName, setRenamedScenarioName] = useState('');
  const [isDuplicatingScenario, setIsDuplicatingScenario] = useState(false);
  const [duplicateScenarioId, setDuplicateScenarioId] = useState<string | null>(null);
  const [duplicateScenarioName, setDuplicateScenarioName] = useState('');
  const [newScenarioName, setNewScenarioName] = useState('');

  const handleCreateNewScenario = () => {
    setUserData(defaultUserData);
    setWorkflowCompleted(false);
    navigate(ROUTES.mortgage);
  };

  const handleSaveScenario = async () => {
    if (!newScenarioName.trim()) {
      toast.error('Please enter a name for your scenario');
      return;
    }

    if (currentScenarioId) {
      await updateScenario(currentScenarioId);
      toast.success('Scenario updated successfully');
    } else {
      const scenarioId = await createScenarioFromCurrent(newScenarioName);
      if (scenarioId) {
        toast.success('Scenario saved successfully');
        setNewScenarioName('');
      }
    }
    
    setSaveDialogOpen(false);
  };

  const handleSaveAsScenario = async () => {
    if (!newScenarioName.trim()) {
      toast.error('Please enter a name for your scenario');
      return;
    }

    const scenarioId = await createScenarioFromCurrent(newScenarioName);
    if (scenarioId) {
      toast.success('Scenario saved as new');
      setNewScenarioName('');
    }
    
    setSaveDialogOpen(false);
  };

  const handleUpdateScenarioName = async () => {
    if (!renamedScenarioName.trim() || !renamedScenarioId) {
      toast.error('Please enter a new name');
      return;
    }

    await updateScenario(renamedScenarioId, { name: renamedScenarioName });
    setIsRenamingScenario(false);
    setRenamedScenarioId(null);
    setRenamedScenarioName('');
  };

  const handleDuplicateScenario = async () => {
    if (!duplicateScenarioName.trim() || !duplicateScenarioId) {
      toast.error('Please enter a name for the duplicate');
      return;
    }

    await duplicateScenario(duplicateScenarioId, duplicateScenarioName);
    setIsDuplicatingScenario(false);
    setDuplicateScenarioId(null);
    setDuplicateScenarioName('');
  };

  const handleLoadScenario = (id: string) => {
    loadScenario(id, setUserData, completeWorkflow);
    setScenarioListOpen(false);
  };

  return {
    // States
    saveDialogOpen,
    setSaveDialogOpen,
    scenarioListOpen,
    setScenarioListOpen,
    isRenamingScenario,
    setIsRenamingScenario,
    isDuplicatingScenario,
    setIsDuplicatingScenario,
    // Values
    scenarios,
    currentScenarioId,
    isLoading,
    isLoadingList,
    newScenarioName,
    renamedScenarioName,
    duplicateScenarioName,
    // Setters
    setNewScenarioName,
    setRenamedScenarioName,
    setDuplicateScenarioName,
    // Handlers
    handleCreateNewScenario,
    handleSaveScenario,
    handleSaveAsScenario,
    handleUpdateScenarioName,
    handleDuplicateScenario,
    handleLoadScenario,
    // Actions
    fetchScenarios,
  };
};
