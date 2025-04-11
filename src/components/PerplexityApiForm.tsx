
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PerplexityApiFormProps {
  onApiKeySet: (key: string) => void;
}

const PerplexityApiForm: React.FC<PerplexityApiFormProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      onApiKeySet(apiKey);
      // Store in localStorage for persistence
      localStorage.setItem("perplexity_api_key", apiKey);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Info className="h-5 w-5" />
            API Key Required
          </CardTitle>
          <CardDescription>
            Please enter your Perplexity API key to access mortgage rate data and property information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium text-muted-foreground">
                Enter your API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-finance-purple/30 focus:border-finance-purple transition-colors"
                placeholder="pk-xxxxx"
              />
            </div>
            <Button type="submit" className="w-full">
              Set API Key
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            Your API key is stored locally and never shared with our servers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerplexityApiForm;
