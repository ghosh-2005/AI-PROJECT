import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Tv, Radio, Newspaper, Globe } from "lucide-react";
import { AdBudgetInput } from "@/lib/api";

interface PredictionFormProps {
  onSubmit: (data: AdBudgetInput) => Promise<void>;
  isLoading: boolean;
}

export function PredictionForm({ onSubmit, isLoading }: PredictionFormProps) {
  const [formData, setFormData] = useState<AdBudgetInput>({
    tv_budget: 0,
    radio_budget: 0,
    newspaper_budget: 0,
    digital_budget: 0,
  });

  const handleInputChange = (field: keyof AdBudgetInput, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, numValue),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const totalBudget = Object.values(formData).reduce((a, b) => a + b, 0);

  const inputFields = [
    { key: "tv_budget" as const, label: "TV Budget", icon: Tv, placeholder: "e.g., 230.1" },
    { key: "radio_budget" as const, label: "Radio Budget", icon: Radio, placeholder: "e.g., 37.8" },
    { key: "newspaper_budget" as const, label: "Newspaper Budget", icon: Newspaper, placeholder: "e.g., 69.2" },
    { key: "digital_budget" as const, label: "Digital Budget", icon: Globe, placeholder: "e.g., 150.0" },
  ];

  return (
    <Card className="data-card border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          Ad Budget Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inputFields.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">$</span>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={placeholder}
                    value={formData[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="pl-7 font-mono bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Total Budget:</span>
              <span className="font-mono text-lg font-semibold text-primary">
                ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <Button
              type="submit"
              disabled={isLoading || totalBudget === 0}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Predict Sales
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
