
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
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Modern color palette with better contrast
const COLORS = ["#8b76e0", "#60A5FA", "#10B981", "#F59E0B", "#EF4444", "#334155"];

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
    color: COLORS[index % COLORS.length],
    // Calculate percentage for each category
    percentage: Math.round((data.total / 
      Object.values(categorizedExpenses).reduce((sum, cat) => sum + cat.total, 0)) * 100)
  }));

  // Prepare subcategory data if a category is selected
  const subcategoryData = selectedCategory && categorizedExpenses[selectedCategory] 
    ? Object.entries(categorizedExpenses[selectedCategory].subcategories)
        .map(([name, value], index) => ({
          name: name.length > 15 ? `${name.substring(0, 13)}...` : name, // Truncate long names
          value,
          color: COLORS[(index + 3) % COLORS.length] // Offset colors for visual distinction
        }))
        .sort((a, b) => b.value - a.value) // Sort by value descending
    : [];

  const handleCategoryClick = (data: any) => {
    if (data.name === selectedCategory) {
      setSelectedCategory(null); // Toggle off if clicking the same category
    } else {
      setSelectedCategory(data.name);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const chartConfig = COLORS.reduce((config, color, index) => {
    const name = chartData[index]?.name || `category-${index}`;
    return {
      ...config,
      [name]: { color },
    };
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <span className="bg-gradient-to-r from-primary-500 to-finance-purple bg-clip-text text-transparent">
              Expense Breakdown
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Main Category Pie Chart */}
            <div className="h-[340px] w-full">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      // Custom label with non-overlapping positioning
                      label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                        // Calculate position for the label to prevent overlap
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        // Only show label for categories with percentage >= 5%
                        if (percent < 0.05) return null;
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill={COLORS[chartData.findIndex(item => item.name === name) % COLORS.length]}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            className="text-xs font-medium"
                          >
                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      onClick={handleCategoryClick}
                      className="cursor-pointer"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={selectedCategory === entry.name ? 3 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [formatCurrency(value as number), 'Amount']} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Subcategory Chart (shows when category is selected) */}
            <div className={`h-[340px] w-full ${!selectedCategory ? 'hidden md:flex md:items-center md:justify-center' : ''}`}>
              {selectedCategory ? (
                <>
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-lg font-medium mb-4 text-center">
                      <span className="text-finance-purple">{selectedCategory}</span> Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart 
                        data={subcategoryData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), 'Amount']}
                          labelStyle={{ color: "#334155" }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {subcategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="mb-2">Select a category to see detailed breakdown</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {chartData.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedCategory(category.name)}
                          className="px-3 py-1.5 text-sm rounded-full transition-all duration-200 hover:scale-105"
                          style={{ 
                            backgroundColor: `${category.color}20`, 
                            color: category.color,
                            border: `1px solid ${category.color}40`
                          }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
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
        className="shadow-md rounded-lg border bg-card animate-fade-in"
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
              <div 
                key={index} 
                className="border rounded-lg p-3 transition-all duration-300 hover:shadow-md"
                style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{category}</h3>
                  <span className="font-semibold">{formatCurrency(data.total)}</span>
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(data.subcategories)
                    .sort(([, a], [, b]) => b - a) // Sort by amount descending
                    .slice(0, 5) // Show only top 5 subcategories
                    .map(([subcat, amount], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-muted-foreground truncate max-w-[70%]">{subcat}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>
                    ))
                  }
                  {Object.keys(data.subcategories).length > 5 && (
                    <div className="text-xs text-muted-foreground italic mt-2">
                      +{Object.keys(data.subcategories).length - 5} more subcategories
                    </div>
                  )}
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
