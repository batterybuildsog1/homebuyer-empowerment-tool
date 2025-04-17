import React from 'react';
import { useScenarioManager } from '@/hooks/useScenarioManager';
import ScenarioActions from './ScenarioActions';
import SaveScenarioDialog from './dialogs/SaveScenarioDialog';
import RenameScenarioDialog from './dialogs/RenameScenarioDialog';
import DuplicateScenarioDialog from './dialogs/DuplicateScenarioDialog';

const ScenarioManager: React.FC = () => {
  const {
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
  } = useScenarioManager();

  return (
    <div className="space-y-4">
      <ScenarioActions
        onNewScenario={handleCreateNewScenario}
        onOpenSave={() => setSaveDialogOpen(true)}
        onLoadScenario={handleLoadScenario}
        fetchScenarios={fetchScenarios}
        scenarios={scenarios}
        isLoadingList={isLoadingList}
        currentScenarioId={currentScenarioId}
        scenarioListOpen={scenarioListOpen}
        setScenarioListOpen={setScenarioListOpen}
        onRename={(id, name) => {
          setIsRenamingScenario(true);
          setRenamedScenarioName(name);
        }}
        onDuplicate={(id, name) => {
          setIsDuplicatingScenario(true);
          setDuplicateScenarioName(name);
        }}
        onArchive={async (id) => {
          
        }}
      />

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
