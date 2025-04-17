import React, { useEffect } from 'react';
import { useMortgageScenarios } from '@/store/mortgageScenarios';
import { useUser } from '@/context/UserContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { FilePlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';
import { useMortgage } from '@/store/mortgage';

const ScenarioSwitcher: React.FC = () => {
  const { isLoggedIn } = useUser();
  const { 
    scenarios, 
    currentScenarioId, 
    fetchScenarios, 
    loadScenario 
  } = useMortgageScenarios();
  const navigate = useNavigate();
  const { setUserData, completeWorkflow } = useMortgage();

  // Fetch scenarios when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      fetchScenarios();
    }
  }, [isLoggedIn, fetchScenarios]);

  // Handle scenario change
  const handleScenarioChange = (id: string) => {
    if (id === 'new') {
      navigate(ROUTES.mortgage);
    } else {
      loadScenario(id, setUserData, completeWorkflow).then(() => {
        navigate(ROUTES.mortgage);
      });
    }
  };

  // If not logged in or no scenarios, show simplified UI
  if (!isLoggedIn || scenarios.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => navigate(ROUTES.mortgage)}
      >
        <FilePlus className="h-4 w-4" />
        New Scenario
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={currentScenarioId || 'new'} 
        onValueChange={handleScenarioChange}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Select Scenario" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New Scenario</SelectItem>
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id}>
              {scenario.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScenarioSwitcher;
