import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useMortgageScenarios } from '@/store/mortgageScenarios';
import { useMortgage } from '@/context/MortgageContext';
import { toast } from 'sonner';
import { loadFromLocalStorage } from '@/context/mortgage/storage';
import { FileArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ScenarioMigration: React.FC = () => {
  const { isLoggedIn } = useUser();
  const { saveScenario } = useMortgageScenarios();
  const { userData } = useMortgage();
  
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [scenarioName, setScenarioName] = useState('My First Scenario');
  
  useEffect(() => {
    // Only attempt migration if user is logged in and migration hasn't been completed yet
    if (isLoggedIn && !migrationCompleted) {
      // Check if there's local data to migrate
      const localData = loadFromLocalStorage();
      
      if (localData && localData.workflowCompleted) {
        // Found completed local data, show migration dialog
        setShowMigrationDialog(true);
      }
    }
  }, [isLoggedIn, migrationCompleted]);
  
  const handleMigration = async () => {
    try {
      // Save current mortgage data to Supabase
      const scenarioId = await saveScenario(scenarioName);
      
      if (scenarioId) {
        toast.success('Your mortgage scenario has been successfully migrated to the cloud!');
        
        // Mark migration as completed to avoid showing the dialog again
        setMigrationCompleted(true);
        setShowMigrationDialog(false);
        
        // Note: We'll still keep the localStorage data for now
        // It could be explicitly cleared later if desired
      }
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Failed to migrate your mortgage scenario');
    }
  };
  
  const skipMigration = () => {
    setMigrationCompleted(true);
    setShowMigrationDialog(false);
    toast('You can save your scenario later from the mortgage planning page.');
  };
  
  return (
    <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Mortgage Data</DialogTitle>
          <DialogDescription>
            We've found your mortgage planning data. Would you like to save it to your account so you can access it across devices?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm">We've detected a completed mortgage scenario in your browser's storage. Save it to your account to:</p>
            <ul className="text-sm mt-2 ml-4 list-disc">
              <li>Access it from any device</li>
              <li>Create multiple scenarios to compare options</li>
              <li>Keep your data safe</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="scenario-name" className="text-sm font-medium">
              Scenario Name
            </label>
            <Input
              id="scenario-name"
              placeholder="e.g., Dream Home 2025"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={skipMigration}>
            Skip
          </Button>
          <Button onClick={handleMigration} disabled={!scenarioName.trim()} className="gap-2">
            <FileArrowUp className="h-4 w-4" />
            Save to Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioMigration;
