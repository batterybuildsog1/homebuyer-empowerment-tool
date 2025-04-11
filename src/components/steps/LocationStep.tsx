
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { MapPin, Home, ArrowRight } from "lucide-react";

const LocationStep: React.FC = () => {
  const { userData, updateLocation, setCurrentStep } = useMortgage();
  const [formData, setFormData] = useState({
    city: userData.location.city,
    state: userData.location.state,
    zipCode: userData.location.zipCode,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    } else if (formData.state.length !== 2) {
      newErrors.state = "Please use 2-letter state code (e.g., CA)";
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateLocation(formData);
      toast.success("Location information saved!");
      setCurrentStep(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="bg-finance-purple/10 p-3 rounded-full">
          <MapPin className="h-6 w-6 text-finance-purple" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Where are you looking to buy?</h2>
          <p className="text-muted-foreground mt-1">
            We'll use this information to provide accurate estimates for property taxes and insurance rates in your area.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <Home className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city name"
                className="pl-10"
              />
            </div>
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State (2-letter code)</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })}
              placeholder="CA"
              maxLength={2}
              className="uppercase"
            />
            {errors.state && <p className="text-sm text-destructive mt-1">{errors.state}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            placeholder="12345"
          />
          {errors.zipCode && <p className="text-sm text-destructive mt-1">{errors.zipCode}</p>}
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full sm:w-auto gap-2">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LocationStep;
