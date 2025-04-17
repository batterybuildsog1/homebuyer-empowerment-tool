
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useMortgage } from '@/context/MortgageContext';
import { useMortgageScenarios, ScenarioMeta } from '@/store/mortgageScenarios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Copy, Edit, FilePlus, FileText, Save, Trash2, Upload } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const ScenarioManager: React.FC = () => {
  const { isLoggedIn } = useUser();
  const { userData, setUserData, completeWorkflow } = useMortgage();
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
    setCurrentUserData,
  } = useMortgageScenarios();

  // Form state
  const [newScenarioName, setNewScenarioName] = useState('');
  const [isRenamingScenario, setIsRenamingScenario] = useState(false);
  const [renamedScenarioId, setRenamedScenarioId] = useState<string | null>(null);
  const [renamedScenarioName, setRenamedScenarioName] = useState('');
  const [isDuplicatingScenario, setIsDuplicatingScenario] = useState(false);
  const [duplicateScenarioId, setDuplicateScenarioId] = useState<string | null>(null);
  const [duplicateScenarioName, setDuplicateScenarioName] = useState('');
  
  // UI state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [scenarioListOpen, setScenarioListOpen] = useState(false);

  // Update the store's userData whenever it changes in the context
  useEffect(() => {
    setCurrentUserData(userData);
  }, [userData, setCurrentUserData]);

  // Load scenarios when the component mounts
  useEffect(() => {
    if (isLoggedIn) {
      fetchScenarios();
    }
  }, [isLoggedIn, fetchScenarios]);

  // Handle save scenario
  const handleSaveScenario = async () => {
    if (!newScenarioName.trim()) {
      toast.error('Please enter a name for your scenario');
      return;
    }

    if (currentScenarioId) {
      // Update existing scenario
      await updateScenario(currentScenarioId);
      toast.success('Scenario updated successfully');
    } else {
      // Create new scenario
      const scenarioId = await createScenarioFromCurrent(newScenarioName);
      if (scenarioId) {
        toast.success('Scenario saved successfully');
        setNewScenarioName('');
      }
    }
    
    setSaveDialogOpen(false);
  };

  // Handle "Save As" scenario
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

  // Handle update scenario name
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

  // Handle duplicate scenario
  const handleDuplicateScenario = async () => {
    if (!duplicateScenarioName.trim() || !duplicateScenarioId) {
      toast.error('Please enter a name for the duplicate');
      return;
    }

    const newId = await duplicateScenario(duplicateScenarioId, duplicateScenarioName);
    if (newId) {
      setIsDuplicatingScenario(false);
      setDuplicateScenarioId(null);
      setDuplicateScenarioName('');
    }
  };

  // Handle load scenario
  const handleLoadScenario = (id: string) => {
    loadScenario(id, setUserData, completeWorkflow);
    setScenarioListOpen(false);
  };

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Save Your Mortgage Scenarios</CardTitle>
          <CardDescription>
            Sign in to save and manage your mortgage scenarios.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <a href="/auth">Sign In / Sign Up</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save/Load Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Save Button */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2">
              <Save className="w-4 h-4" />
              {currentScenarioId ? 'Update Scenario' : 'Save Scenario'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentScenarioId ? 'Update Scenario' : 'Save Mortgage Scenario'}
              </DialogTitle>
              <DialogDescription>
                {currentScenarioId 
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
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              {currentScenarioId && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => updateScenario(currentScenarioId)}
                    disabled={isLoading}
                  >
                    Update Current
                  </Button>
                  <Button 
                    onClick={handleSaveAsScenario}
                    disabled={isLoading || !newScenarioName.trim()}
                  >
                    Save As New
                  </Button>
                </>
              )}
              {!currentScenarioId && (
                <Button 
                  onClick={handleSaveScenario}
                  disabled={isLoading || !newScenarioName.trim()}
                >
                  Save Scenario
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenarios.map((scenario) => (
                      <TableRow key={scenario.id}>
                        <TableCell className="font-medium">
                          {scenario.name}
                          {currentScenarioId === scenario.id && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(scenario.updatedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          {/* Load Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleLoadScenario(scenario.id)}
                            title="Load Scenario"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          
                          {/* Edit Name Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsRenamingScenario(true);
                              setRenamedScenarioId(scenario.id);
                              setRenamedScenarioName(scenario.name);
                            }}
                            title="Rename"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* Duplicate Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsDuplicatingScenario(true);
                              setDuplicateScenarioId(scenario.id);
                              setDuplicateScenarioName(`${scenario.name} (Copy)`);
                            }}
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          
                          {/* Delete/Archive Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Archive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive Scenario</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to archive "{scenario.name}"? This action can't be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    await archiveScenario(scenario.id);
                                  }}
                                >
                                  Archive
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenamingScenario} onOpenChange={setIsRenamingScenario}>
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
                value={renamedScenarioName}
                onChange={(e) => setRenamedScenarioName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRenamingScenario(false);
                setRenamedScenarioId(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateScenarioName}
              disabled={isLoading || !renamedScenarioName.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={isDuplicatingScenario} onOpenChange={setIsDuplicatingScenario}>
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
                value={duplicateScenarioName}
                onChange={(e) => setDuplicateScenarioName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDuplicatingScenario(false);
                setDuplicateScenarioId(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDuplicateScenario}
              disabled={isLoading || !duplicateScenarioName.trim()}
            >
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenarioManager;
