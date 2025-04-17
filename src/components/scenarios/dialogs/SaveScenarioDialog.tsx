
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SaveScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  onSave: () => void;
  onSaveAs: () => void;
  isCurrentScenario: boolean;
  isLoading: boolean;
}

const SaveScenarioDialog: React.FC<SaveScenarioDialogProps> = ({
  open,
  onOpenChange,
  scenarioName,
  onScenarioNameChange,
  onSave,
  onSaveAs,
  isCurrentScenario,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCurrentScenario ? 'Update Scenario' : 'Save Mortgage Scenario'}
          </DialogTitle>
          <DialogDescription>
            {isCurrentScenario 
              ? 'Update your current mortgage scenario or save as a new one.' 
              : 'Save your current mortgage scenario for future reference.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="scenario-name" className="text-sm font-medium">
              Scenario Name
            </label>
            <Input
              id="scenario-name"
              placeholder="e.g., Dream Home 2025"
              value={scenarioName}
              onChange={(e) => onScenarioNameChange(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          {isCurrentScenario ? (
            <>
              <Button 
                variant="outline" 
                onClick={onSave}
                disabled={isLoading}
              >
                Update Current
              </Button>
              <Button 
                onClick={onSaveAs}
                disabled={isLoading || !scenarioName.trim()}
              >
                Save As New
              </Button>
            </>
          ) : (
            <Button 
              onClick={onSave}
              disabled={isLoading || !scenarioName.trim()}
            >
              Save Scenario
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveScenarioDialog;
