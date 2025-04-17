
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Beaker } from 'lucide-react';
import { FeatureFlags, getFeatureFlags, saveFeatureFlags } from '@/utils/featureFlags';

const FeatureFlagsPanel: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags());
  
  useEffect(() => {
    // Update flags whenever localStorage changes (in another tab)
    const handleStorageChange = () => {
      setFlags(getFeatureFlags());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const updateFlag = (key: keyof FeatureFlags, value: boolean) => {
    const updatedFlags = { ...flags, [key]: value };
    setFlags(updatedFlags);
    saveFeatureFlags(updatedFlags);
  };
  
  const resetFlags = () => {
    localStorage.removeItem('featureFlags');
    setFlags(getFeatureFlags());
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-primary" />
          Feature Flags (Development Only)
        </CardTitle>
        <CardDescription>
          Toggle features for testing and incremental rollout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="scenarios-enabled" className="font-medium">Enable Scenarios</Label>
              <p className="text-sm text-muted-foreground">
                Enable the mortgage scenarios feature
              </p>
            </div>
            <Switch
              id="scenarios-enabled"
              checked={flags.scenariosEnabled}
              onCheckedChange={(checked) => updateFlag('scenariosEnabled', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="read-only" className="font-medium">Read-Only Mode</Label>
              <p className="text-sm text-muted-foreground">
                Users can only view scenarios, not create or edit
              </p>
            </div>
            <Switch
              id="read-only"
              checked={flags.scenariosReadOnly}
              onCheckedChange={(checked) => updateFlag('scenariosReadOnly', checked)}
              disabled={!flags.scenariosEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="advanced-sync" className="font-medium">Advanced Sync</Label>
              <p className="text-sm text-muted-foreground">
                Enable conflict detection and resolution
              </p>
            </div>
            <Switch
              id="advanced-sync"
              checked={flags.advancedSyncEnabled}
              onCheckedChange={(checked) => updateFlag('advancedSyncEnabled', checked)}
              disabled={!flags.scenariosEnabled}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={resetFlags}>
          Reset to Defaults
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureFlagsPanel;
