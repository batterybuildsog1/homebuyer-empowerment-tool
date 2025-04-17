
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMortgageScenarios } from '@/store/mortgageScenarios';
import { useUser } from '@/context/UserContext';
import { FileText, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';
import { formatCurrency } from '@/utils/formatters';

const MortgageScenariosList = () => {
  const { isLoggedIn } = useUser();
  const { scenarios, isLoadingList, fetchScenarios, loadScenario } = useMortgageScenarios();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetchScenarios();
    }
  }, [isLoggedIn, fetchScenarios]);

  const handleLoadScenario = async (id: string) => {
    await loadScenario(id);
    navigate(ROUTES.mortgage);
  };

  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Scenarios</CardTitle>
          <CardDescription>Sign in to view your saved mortgage scenarios.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Mortgage Scenarios
        </CardTitle>
        <CardDescription>Your saved mortgage planning scenarios</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingList ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
            <p>You don't have any saved scenarios yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario Name</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.slice(0, 5).map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell className="font-medium">{scenario.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(scenario.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLoadScenario(scenario.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => navigate(ROUTES.mortgage)}
        >
          <Plus className="h-4 w-4" />
          New Scenario
        </Button>
        {scenarios.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(ROUTES.mortgage)}
          >
            View All
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MortgageScenariosList;
