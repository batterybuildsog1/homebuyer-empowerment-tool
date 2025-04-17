
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, FilePlus, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ScenarioList from './ScenarioList';

interface ScenarioActionsProps {
  onNewScenario: () => void;
  onOpenSave: () => void;
  onLoadScenario: (id: string) => void;
  fetchScenarios: () => void;
  scenarios: any[];
  isLoadingList: boolean;
  currentScenarioId: string | null;
  scenarioListOpen: boolean;
  setScenarioListOpen: (open: boolean) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onArchive: (id: string) => void;
}

const ScenarioActions: React.FC<ScenarioActionsProps> = ({
  onNewScenario,
  onOpenSave,
  onLoadScenario,
  fetchScenarios,
  scenarios,
  isLoadingList,
  currentScenarioId,
  scenarioListOpen,
  setScenarioListOpen,
  onRename,
  onDuplicate,
  onArchive,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="default" className="gap-2" onClick={onOpenSave}>
        <Save className="w-4 h-4" />
        Save Scenario
      </Button>

      <Button variant="outline" className="gap-2" onClick={onNewScenario}>
        <FilePlus className="w-4 h-4" />
        New Scenario
      </Button>

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
            <ScenarioList
              scenarios={scenarios}
              currentScenarioId={currentScenarioId}
              onLoad={onLoadScenario}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onArchive={onArchive}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ScenarioActions;
