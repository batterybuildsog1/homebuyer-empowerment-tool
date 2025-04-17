
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/Heading";
import { ChevronRight, PlusCircle, Home, BarChart3, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useMortgage } from "@/context/MortgageContext";
import { useUser } from "@/context/UserContext";
import PageLayout from "@/components/layouts/PageLayout";
import { formatCurrency } from "@/utils/formatters";
import { ROUTES } from "@/utils/routes";

const DashboardPage = () => {
  const { isLoggedIn, userName } = useUser();
  const { userData, isMortgageWorkflowCompleted } = useMortgage();
  const isWorkflowCompleted = isMortgageWorkflowCompleted();
  
  return (
    <PageLayout>
      <Helmet>
        <title>Dashboard | Finance Empowerment Tool</title>
        <meta name="description" content="View your financial dashboard and manage your accounts" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Heading as="h1" size="2xl">Dashboard</Heading>
              <p className="text-muted-foreground mt-1">Welcome back, {userName || "User"}</p>
            </div>
            
            <div className="flex gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link to={ROUTES.goals}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Goal</span>
                </Link>
              </Button>
              
              {!isWorkflowCompleted && (
                <Button asChild className="gap-2">
                  <Link to={ROUTES.mortgage}>
                    <Home className="h-4 w-4" />
                    <span>Complete Mortgage Planning</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Incomplete mortgage workflow alert */}
        {!isWorkflowCompleted && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-700/20">
                  <Home className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium">Complete Your Mortgage Planning</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Finish setting up your mortgage details to get personalized recommendations and maximize your buying power.
                  </p>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link to={ROUTES.mortgage}>
                      Continue Setup <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Main dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial Summary */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Financial Summary
              </CardTitle>
              <CardDescription>Your current financial overview</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isWorkflowCompleted ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Annual Income</div>
                    <div className="text-2xl font-semibold">{formatCurrency(userData.financials.annualIncome)}</div>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Monthly Debts</div>
                    <div className="text-2xl font-semibold">
                      {formatCurrency(userData.financials.monthlyDebts || 0)}
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">FICO Score</div>
                    <div className="text-2xl font-semibold">{userData.financials.ficoScore || "N/A"}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Complete your mortgage planning to view your financial summary
                  </div>
                  <Button asChild>
                    <Link to={ROUTES.mortgage}>Complete Mortgage Planning</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Buying Power Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-finance-green" />
                Buying Power
              </CardTitle>
              <CardDescription>Your home purchasing ability</CardDescription>
            </CardHeader>
            
            <CardContent>
              {isWorkflowCompleted ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Max Home Price</div>
                    <div className="text-2xl font-semibold">{formatCurrency(userData.results.maxHomePrice || 0)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
                    <div className="text-xl font-medium">{formatCurrency(userData.results.monthlyPayment || 0)}</div>
                  </div>
                  
                  <Button asChild variant="outline" size="sm" className="w-full mt-4">
                    <Link to={ROUTES.mortgage}>
                      View Details <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    Complete your mortgage planning to view your buying power
                  </div>
                  <Button asChild size="sm">
                    <Link to={ROUTES.mortgage}>Start Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* More dashboard cards can be added here */}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
