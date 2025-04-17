
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Edit, FileText, Trash2, Upload } from 'lucide-react';
import { ScenarioMeta } from '@/store/mortgageScenarios';

interface ScenarioListProps {
  scenarios: ScenarioMeta[];
  currentScenarioId: string | null;
  onLoad: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onArchive: (id: string) => void;
}

const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  currentScenarioId,
  onLoad,
  onRename,
  onDuplicate,
  onArchive,
}) => {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
        <p>You don't have any saved scenarios yet.</p>
      </div>
    );
  }

  return (
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLoad(scenario.id)}
                title="Load Scenario"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRename(scenario.id, scenario.name)}
                title="Rename"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicate(scenario.id, `${scenario.name} (Copy)`)}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onArchive(scenario.id)}
                title="Archive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ScenarioList;
