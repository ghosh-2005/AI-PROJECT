import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, Cpu, Clock } from "lucide-react";
import { PredictionResult as PredictionResultType } from "@/lib/api";

interface PredictionResultProps {
  result: PredictionResultType | null;
  processingTime?: number;
}

export function PredictionResult({ result, processingTime }: PredictionResultProps) {
  if (!result) {
    return (
      <Card className="data-card border-border/50 bg-card/50 backdrop-blur-sm h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-success/10">
              <Target className="h-5 w-5 text-success" />
            </div>
            Prediction Result
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter ad budgets and click predict</p>
            <p className="text-xs mt-1 opacity-70">to see your sales forecast</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidenceColor = result.confidence_score >= 0.8 
    ? "text-success" 
    : result.confidence_score >= 0.6 
      ? "text-warning" 
      : "text-destructive";

  const confidenceLabel = result.confidence_score >= 0.8 
    ? "High" 
    : result.confidence_score >= 0.6 
      ? "Medium" 
      : "Low";

  return (
    <Card className="data-card border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <Target className="h-5 w-5 text-success" />
            </div>
            Prediction Result
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {result.algorithm}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prediction */}
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-mono text-xs">
              v{result.model_version}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            Predicted Sales
          </div>
          <div className="font-mono text-4xl font-bold text-success animate-number-count">
            ${result.predicted_sales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Confidence Score */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Confidence Score
            </span>
            <span className={`font-semibold ${confidenceColor}`}>
              {confidenceLabel}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                result.confidence_score >= 0.8 
                  ? "bg-success" 
                  : result.confidence_score >= 0.6 
                    ? "bg-warning" 
                    : "bg-destructive"
              }`}
              style={{ width: `${result.confidence_score * 100}%` }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="font-mono text-sm font-semibold">
              {(result.confidence_score * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
          <div className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            <span className="font-mono">{result.algorithm}</span>
          </div>
          {processingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="font-mono">{processingTime}ms</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
