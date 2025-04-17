
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

interface RenameScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  onRename: () => void;
  isLoading: boolean;
}

const RenameScenarioDialog: React.FC<RenameScenarioDialogProps> = ({
  open,
  onOpenChange,
  scenarioName,
  onScenarioNameChange,
  onRename,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Scenario</DialogTitle>
          <DialogDescription>
            Enter a new name for your mortgage scenario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="rename-scenario" className="text-sm font-medium">
              New Name
            </label>
            <Input
              id="rename-scenario"
              placeholder="e.g., Dream Home 2025"
              value={scenarioName}
              onChange={(e) => onScenarioNameChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onRename}
            disabled={isLoading || !scenarioName.trim()}
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameScenarioDialog;
