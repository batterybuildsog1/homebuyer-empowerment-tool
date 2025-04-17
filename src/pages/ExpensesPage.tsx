
import React from 'react';
import PageLayout from '@/components/layouts/PageLayout';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/Heading';

const ExpensesPage = () => {
  return (
    <>
      <Helmet>
        <title>Expenses - Finance Tool</title>
      </Helmet>
      <PageLayout>
        <Heading title="Expenses" subtitle="Track and manage your expenses" />
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect to Plaid to automatically import and categorize your expenses.
                This feature is coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </>
  );
};

export default ExpensesPage;
