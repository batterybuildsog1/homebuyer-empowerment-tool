
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  CalendarIcon, 
  DollarSignIcon,
  TargetIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { Heading } from "@/components/ui/Heading";

const FinancialGoalsPage = () => {
  const { goals, addGoal, updateProgress, loading, error, fetchGoals } = useGoals();
  const [newGoal, setNewGoal] = useState({ title: "", target: "", deadline: "" });
  const [showForm, setShowForm] = useState(false);

  const handleAddGoal = () => {
    // Validate inputs
    if (!newGoal.title.trim()) {
      toast("Missing title", {
        description: "Please enter a title for your goal"
      });
      return;
    }

    if (!newGoal.target || isNaN(parseFloat(newGoal.target)) || parseFloat(newGoal.target) <= 0) {
      toast("Invalid target amount", {
        description: "Please enter a valid target amount greater than zero"
      });
      return;
    }

    if (!newGoal.deadline) {
      toast("Missing deadline", {
        description: "Please select a target date"
      });
      return;
    }

    // All validations passed
    addGoal({
      title: newGoal.title,
      target: parseFloat(newGoal.target),
      deadline: newGoal.deadline,
      progress: 0,
    });
    
    // Reset form and hide it
    setNewGoal({ title: "", target: "", deadline: "" });
    setShowForm(false);
    
    // Show success message
    toast("Goal created", {
      description: "Your financial goal has been added successfully"
    });
  };

  const handleProgressUpdate = (goalId: string, newProgress: number) => {
    updateProgress(goalId, newProgress);
    toast("Progress updated", {
      description: `Goal progress updated to ${newProgress}%`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Heading as="h1" size="2xl" className="text-foreground">Financial Goals</Heading>
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border border-border">
                <CardHeader className="pb-0">
                  <Skeleton className="h-7 w-3/4" />
                </CardHeader>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <Skeleton className="h-4 w-4/6 mb-4" />
                  <Skeleton className="h-3 w-full mt-6 rounded-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-28 rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md mx-auto text-center">
          <AlertCircleIcon className="h-16 w-16 text-destructive mx-auto mb-6" />
          <Heading as="h1" size="xl" className="mb-3">Unable to load your goals</Heading>
          <p className="text-muted-foreground mb-8">
            {error.message || "An unknown error occurred"}
          </p>
          <Button onClick={() => fetchGoals()} size="lg" className="font-medium">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-accent/30 active:scale-95 transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Heading as="h1" size="2xl">Financial Goals</Heading>
            </div>
            
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="hover:bg-finance-purple/90 active:scale-95 transition-all duration-200 flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Goal</span>
              </Button>
            )}
          </div>
        </header>

        {showForm && (
          <Card className="mb-8 border border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-card pb-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TargetIcon className="h-5 w-5 text-finance-purple" />
                New Financial Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Down Payment for House"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="focus-visible:ring-finance-purple/30 focus-visible:border-finance-purple"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-sm font-medium">Target Amount ($)</Label>
                  <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="target"
                      type="number"
                      placeholder="50000"
                      className="pl-10 focus-visible:ring-finance-purple/30 focus-visible:border-finance-purple"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">Target Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="deadline"
                    type="date"
                    className="pl-10 focus-visible:ring-finance-purple/30 focus-visible:border-finance-purple"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3 justify-end border-t bg-card/50 px-6 py-4">
              <Button 
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddGoal}
                className="bg-finance-purple hover:bg-finance-purple/90 transition-all duration-200"
              >
                Create Goal
              </Button>
            </CardFooter>
          </Card>
        )}

        <main className="space-y-6">
          {goals.length === 0 ? (
            <div className="text-center py-16 bg-background-secondary/30 border border-dashed border-border rounded-lg">
              <TargetIcon className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <Heading as="h3" size="lg" className="mb-2">No goals yet</Heading>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Setting clear financial goals helps you track progress and stay motivated on your journey to financial success.
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-finance-purple hover:bg-finance-purple/90 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {goals.map((goal) => (
                <Card key={goal.id} className="overflow-hidden border border-border shadow-sm transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                      <div className="text-sm font-medium px-3 py-1 bg-finance-purple/10 text-finance-purple rounded-full">
                        Target: ${goal.target.toLocaleString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">${((goal.progress / 100) * goal.target).toLocaleString()} saved</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        className="h-2.5 bg-secondary" 
                      />
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-3 text-sm">
                      <div className="p-3 bg-background-secondary/40 rounded-md">
                        <div className="text-muted-foreground mb-1">Target Date</div>
                        <div className="font-medium">
                          {new Date(goal.deadline).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="p-3 bg-background-secondary/40 rounded-md">
                        <div className="text-muted-foreground mb-1">Remaining</div>
                        <div className="font-medium">
                          ${(goal.target * (1 - goal.progress / 100)).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-background-secondary/40 rounded-md">
                        <div className="text-muted-foreground mb-1">Monthly Need</div>
                        <div className="font-medium">
                          ${Math.ceil(goal.target * (1 - goal.progress / 100) / 
                            (Math.max(1, Math.floor((new Date(goal.deadline).getTime() - new Date().getTime()) / 
                            (1000 * 60 * 60 * 24 * 30)))))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-card/50 px-6 py-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProgressUpdate(goal.id, Math.max(0, goal.progress - 10))}
                      className="text-sm transition-all duration-200"
                    >
                      Decrease Progress
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-finance-green hover:text-finance-green/80 transition-all duration-200"
                      onClick={() => handleProgressUpdate(goal.id, Math.min(100, goal.progress + 10))}
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" /> Update Progress
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-12 py-6">
          <nav className="max-w-xl mx-auto flex items-center justify-between px-4 py-3 shadow-sm rounded-xl border border-border bg-card">
            <Link to="/dashboard">
              <Button variant="ghost" className="transition-colors duration-300 hover:text-finance-purple">Dashboard</Button>
            </Link>
            <Link to="/mortgage-planning">
              <Button variant="ghost" className="transition-colors duration-300 hover:text-finance-purple">Mortgage</Button>
            </Link>
            <Link to="/financial-goals" className="relative">
              <Button variant="ghost" className="font-medium text-finance-purple">
                Goals
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-finance-purple rounded-full"></span>
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" className="transition-colors duration-300 hover:text-finance-purple">Home</Button>
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default FinancialGoalsPage;
