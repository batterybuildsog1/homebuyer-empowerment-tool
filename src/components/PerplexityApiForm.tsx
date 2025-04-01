
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

interface PerplexityApiFormProps {
  onApiKeySet: (apiKey: string) => void;
}

const PerplexityApiForm: React.FC<PerplexityApiFormProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Please enter a valid Perplexity API key");
      return;
    }

    setIsSubmitting(true);
    try {
      // Store the API key in local storage
      localStorage.setItem("perplexity_api_key", apiKey);
      onApiKeySet(apiKey);
      toast.success("API key saved successfully");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Perplexity API Key Required
          </CardTitle>
          <CardDescription>
            This application uses Perplexity's Sonar API to fetch real-time mortgage data.
            Please provide your API key to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Perplexity API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your API key is stored locally on your device and is never sent to our servers.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save API Key"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PerplexityApiForm;
