import { useState } from "react";
import { toast } from "sonner";
import { PredictionForm } from "@/components/PredictionForm";
import { PredictionResult } from "@/components/PredictionResult";
import { PredictionHistory } from "@/components/PredictionHistory";
import { predictSales, AdBudgetInput, PredictionResult as PredictionResultType } from "@/lib/api";
import { BarChart3, Cpu, Database, Zap } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResultType | null>(null);
  const [processingTime, setProcessingTime] = useState<number | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePredict = async (data: AdBudgetInput) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await predictSales(data);
      const elapsed = Date.now() - startTime;
      setProcessingTime(elapsed);

      if (response.success && response.data) {
        setResult(response.data);
        setRefreshTrigger((prev) => prev + 1);
        toast.success("Prediction complete", {
          description: `Sales forecast: $${response.data.predicted_sales.toLocaleString()}`,
        });
      } else {
        toast.error("Prediction failed", {
          description: response.error || "An error occurred",
        });
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Failed to connect to the prediction service",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 glow-cyan">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AdSales Predictor</h1>
                <p className="text-xs text-muted-foreground">ML-Powered Sales Forecasting</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {[
            { icon: Cpu, label: "Linear Regression Model" },
            { icon: Database, label: "Persistent Storage" },
            { icon: Zap, label: "Real-time Predictions" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground"
            >
              <Icon className="h-3 w-3" />
              {label}
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PredictionForm onSubmit={handlePredict} isLoading={isLoading} />
          <PredictionResult result={result} processingTime={processingTime} />
        </div>

        {/* History Section */}
        <PredictionHistory refreshTrigger={refreshTrigger} />

        {/* Footer Info */}
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            Built with Linear Regression • Model v1.0.0 • 
            <span className="text-primary ml-1">Backend-First Architecture</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
