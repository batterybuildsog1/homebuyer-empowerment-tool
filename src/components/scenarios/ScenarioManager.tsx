import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FileText, FilePlus, Save } from 'lucide-react';
import { useMortgage } from '@/context/MortgageContext';
import { useMortgageScenarios } from '@/store/mortgageScenarios';
import { toast } from 'sonner';
import SaveScenarioDialog from './dialogs/SaveScenarioDialog';
import RenameScenarioDialog from './dialogs/RenameScenarioDialog';
import DuplicateScenarioDialog from './dialogs/DuplicateScenarioDialog';
import ScenarioList from './ScenarioList';
import { defaultUserData } from '@/context/mortgage/defaultData';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';

const ScenarioManager: React.FC = () => {
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

  // Handle create new scenario
  const handleCreateNewScenario = () => {
    setUserData(defaultUserData);
    setWorkflowCompleted(false);
    navigate(ROUTES.mortgage);
  };

  // Handle save scenario
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

  return (
    <div className="space-y-4">
      {/* Save/Load Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Save Button */}
        <Button variant="default" className="gap-2" onClick={() => setSaveDialogOpen(true)}>
          <Save className="w-4 h-4" />
          {currentScenarioId ? 'Update Scenario' : 'Save Scenario'}
        </Button>

        {/* New Scenario Button */}
        <Button variant="outline" className="gap-2" onClick={handleCreateNewScenario}>
          <FilePlus className="w-4 h-4" />
          New Scenario
        </Button>

        {/* Load/View Scenarios */}
        <Sheet open={scenarioListOpen} onOpenChange={setScenarioListOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2" onClick={() => fetchScenarios()}>
              <FileText className="w-4 h-4" />
              My Scenarios
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md md:max-w-lg">
            <SheetHeader>
              <SheetTitle>Your Mortgage Scenarios</SheetTitle>
              <SheetDescription>
                View, load and manage your saved mortgage scenarios.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 h-[calc(100vh-180px)] overflow-y-auto pr-2">
              {isLoadingList ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : scenarios.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p>You don't have any saved scenarios yet.</p>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      setScenarioListOpen(false);
                      setSaveDialogOpen(true);
                    }}
                  >
                    <FilePlus className="w-4 h-4" />
                    Create Your First Scenario
                  </Button>
                </div>
              ) : (
                <ScenarioList
                  scenarios={scenarios}
                  currentScenarioId={currentScenarioId}
                  onLoad={handleLoadScenario}
                  onRename={(id, name) => {
                    setIsRenamingScenario(true);
                    setRenamedScenarioId(id);
                    setRenamedScenarioName(name);
                  }}
                  onDuplicate={(id, name) => {
                    setIsDuplicatingScenario(true);
                    setDuplicateScenarioId(id);
                    setDuplicateScenarioName(name);
                  }}
                  onArchive={archiveScenario}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Dialogs */}
      <SaveScenarioDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        scenarioName={newScenarioName}
        onScenarioNameChange={setNewScenarioName}
        onSave={handleSaveScenario}
        onSaveAs={handleSaveAsScenario}
        isCurrentScenario={!!currentScenarioId}
        isLoading={isLoading}
      />

      <RenameScenarioDialog
        open={isRenamingScenario}
        onOpenChange={setIsRenamingScenario}
        scenarioName={renamedScenarioName}
        onScenarioNameChange={setRenamedScenarioName}
        onRename={handleUpdateScenarioName}
        isLoading={isLoading}
      />

      <DuplicateScenarioDialog
        open={isDuplicatingScenario}
        onOpenChange={setIsDuplicatingScenario}
        scenarioName={duplicateScenarioName}
        onScenarioNameChange={setDuplicateScenarioName}
        onDuplicate={handleDuplicateScenario}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ScenarioManager;
