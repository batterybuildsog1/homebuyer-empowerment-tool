
import { useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Color palette for charts
const COLORS = ["#4A90E2", "#50C878", "#F5A623", "#E74C3C", "#9B59B6", "#34495E"];

interface CategoryData {
  total: number;
  subcategories: Record<string, number>;
}

interface ExpenseChartProps {
  categorizedExpenses: Record<string, CategoryData>;
}

const ExpenseChart = ({ categorizedExpenses }: ExpenseChartProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Prepare chart data for expenses by category
  const chartData = Object.entries(categorizedExpenses).map(([name, data], index) => ({
    name,
    value: data.total,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare subcategory data if a category is selected
  const subcategoryData = selectedCategory && categorizedExpenses[selectedCategory] 
    ? Object.entries(categorizedExpenses[selectedCategory].subcategories).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[(index + 3) % COLORS.length] // Offset colors for visual distinction
      }))
    : [];

  const handleCategoryClick = (data: any) => {
    setSelectedCategory(data.name);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Main Category Pie Chart */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    onClick={handleCategoryClick}
                    className="cursor-pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Subcategory Chart (shows when category is selected) */}
            <div className={`h-[300px] w-full ${!selectedCategory ? 'hidden md:block' : ''}`}>
              {selectedCategory ? (
                <>
                  <h3 className="text-lg font-medium mb-2 text-center">{selectedCategory} Breakdown</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={subcategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                      <Bar dataKey="value">
                        {subcategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a category to see detailed breakdown
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Details Section */}
      <Collapsible 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen}
        className="shadow-md rounded-lg border bg-card"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full flex justify-between items-center p-4 rounded-t-lg" 
          >
            <span className="text-lg font-medium">View All Categories</span>
            {isDetailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categorizedExpenses).map(([category, data], index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{category}</h3>
                  <span className="font-semibold">{formatCurrency(data.total)}</span>
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.subcategories).map(([subcat, amount], idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{subcat}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ExpenseChart;
