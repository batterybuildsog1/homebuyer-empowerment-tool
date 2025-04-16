
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface MortgageRate {
  date: string;
  conventional: number;
  fha: number;
  spread_bps: number;
  source: string;
}

export const MortgageRatesCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState<MortgageRate | null>(null);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchLatestRates = async () => {
    try {
      const { data, error } = await supabase
        .from("rates")
        .select("*")
        .eq("valid", true)
        .order("date", { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        throw error;
      }
      
      setRates(data as MortgageRate);
    } catch (error) {
      console.error("Error fetching rates:", error);
      toast.error("Failed to fetch latest rates");
    }
  };

  const refreshRates = async () => {
    setIsLoading(true);
    toast.info("Fetching latest mortgage rates...");
    
    try {
      // Call the edge function directly
      const { data, error } = await supabase.functions.invoke("fetch_mnd_rates");
      
      if (error) {
        throw error;
      }
      
      if (data.status === "ok") {
        toast.success("Successfully fetched latest rates!");
        fetchLatestRates(); // Fetch the newly saved rates
      } else {
        throw new Error(data.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error refreshing rates:", error);
      toast.error("Failed to refresh rates");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rates on component mount
  useState(() => {
    fetchLatestRates();
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Current Mortgage Rates</CardTitle>
        <CardDescription>
          {rates ? 
            `As of ${formatDate(rates.date)} from ${rates.source}` : 
            "Loading latest rates..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rates ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Conventional</p>
                <p className="text-2xl font-bold">{rates.conventional.toFixed(2)}%</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">FHA</p>
                <p className="text-2xl font-bold">{rates.fha.toFixed(2)}%</p>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Spread</p>
              <p className="text-2xl font-bold">{rates.spread_bps} bps</p>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">No rate data available</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={refreshRates} 
          className="w-full" 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Fetching rates..." : "Refresh Rates"}
        </Button>
      </CardFooter>
    </Card>
  );
};
