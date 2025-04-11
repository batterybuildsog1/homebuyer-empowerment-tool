
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  CalendarIcon, 
  DollarSignIcon,
  TargetIcon,
  CheckCircleIcon
} from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

const FinancialGoalsPage = () => {
  const { goals, addGoal, updateProgress, loading, error } = useGoals();
  const [newGoal, setNewGoal] = useState({ title: "", target: "", deadline: "" });
  const [showForm, setShowForm] = useState(false);

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.deadline) {
      addGoal({
        title: newGoal.title,
        target: parseFloat(newGoal.target),
        deadline: newGoal.deadline,
        progress: 0,
      });
      setNewGoal({ title: "", target: "", deadline: "" });
      setShowForm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-semibold">Financial Goals</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">Unable to load your goals</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Financial Goals</h1>
        </div>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-1" /> Add Goal
          </Button>
        )}
      </header>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              New Financial Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Down Payment for House"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="target">Target Amount ($)</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="target"
                    type="number"
                    placeholder="50000"
                    className="pl-10"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="deadline"
                    type="date"
                    className="pl-10"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              Create Goal
            </Button>
          </CardFooter>
        </Card>
      )}

      <main className="grid gap-4">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't set any financial goals yet.</p>
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon className="h-4 w-4 mr-1" /> Add Your First Goal
            </Button>
          </div>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{goal.title}</span>
                  <span className="text-sm font-normal text-gray-500">
                    Target: ${goal.target.toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>${((goal.progress / 100) * goal.target).toLocaleString()} saved</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                
                {/* Goal Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Target Date</span>
                    <span className="font-medium">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining</span>
                    <span className="font-medium">
                      ${(goal.target * (1 - goal.progress / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Savings Need</span>
                    <span className="font-medium">
                      ${Math.ceil(goal.target * (1 - goal.progress / 100) / 
                        (Math.max(1, Math.floor((new Date(goal.deadline).getTime() - new Date().getTime()) / 
                        (1000 * 60 * 60 * 24 * 30)))))}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="text-xs" 
                  onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 10))}>
                  Decrease Progress
                </Button>
                <Button variant="outline" 
                  className="text-xs text-green-500 hover:text-green-700"
                  onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 10))}>
                  <CheckCircleIcon className="h-3 w-3 mr-1" /> Update Progress
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </main>

      <footer className="mt-8 py-4">
        <nav className="grid grid-cols-4 gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full">Dashboard</Button>
          </Link>
          <Link to="/mortgage-planning">
            <Button variant="ghost" className="w-full">Mortgage</Button>
          </Link>
          <Link to="/financial-goals">
            <Button variant="ghost" className="w-full">Goals</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full">Home</Button>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default FinancialGoalsPage;
