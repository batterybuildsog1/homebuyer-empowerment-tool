
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownToLine, Copy, RefreshCw } from 'lucide-react';

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localData: {
    name: string;
    updatedAt: Date;
  };
  remoteData: {
    name: string;
    updatedAt: Date;
  };
  onUseLocal: () => void;
  onUseRemote: () => void;
  onCreateDuplicate: () => void;
}

const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  open,
  onOpenChange,
  localData,
  remoteData,
  onUseLocal,
  onUseRemote,
  onCreateDuplicate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conflicting Changes Detected</DialogTitle>
          <DialogDescription>
            This scenario has been modified in multiple places. How would you like to resolve this conflict?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-medium text-sm">Local Version</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatDistanceToNow(localData.updatedAt, { addSuffix: true })}
            </p>
            <p className="text-sm mt-2">{localData.name}</p>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-medium text-sm">Remote Version</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatDistanceToNow(remoteData.updatedAt, { addSuffix: true })}
            </p>
            <p className="text-sm mt-2">{remoteData.name}</p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onUseLocal} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Keep Local Changes
            </Button>
            <Button onClick={onUseRemote} className="gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Use Server Version
            </Button>
          </div>
          
          <Button onClick={onCreateDuplicate} variant="secondary" className="gap-2">
            <Copy className="h-4 w-4" />
            Create Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
