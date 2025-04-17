
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

interface DuplicateScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  onDuplicate: () => void;
  isLoading: boolean;
}

const DuplicateScenarioDialog: React.FC<DuplicateScenarioDialogProps> = ({
  open,
  onOpenChange,
  scenarioName,
  onScenarioNameChange,
  onDuplicate,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Scenario</DialogTitle>
          <DialogDescription>
            Create a copy of this mortgage scenario with a new name.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="duplicate-scenario" className="text-sm font-medium">
              New Name
            </label>
            <Input
              id="duplicate-scenario"
              placeholder="e.g., Dream Home 2025 (Copy)"
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
            onClick={onDuplicate}
            disabled={isLoading || !scenarioName.trim()}
          >
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateScenarioDialog;
