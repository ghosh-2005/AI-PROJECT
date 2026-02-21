import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { fetchHistory, HistoryItem, HistoryResponse } from "@/lib/api";

interface PredictionHistoryProps {
  refreshTrigger: number;
}

export function PredictionHistory({ refreshTrigger }: PredictionHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response: HistoryResponse = await fetchHistory(page, pagination.limit);
      if (response.success && response.data) {
        setHistory(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, [refreshTrigger]);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-success/20 text-success border-success/30">High</Badge>;
    if (score >= 0.6) return <Badge className="bg-warning/20 text-warning border-warning/30">Med</Badge>;
    return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Low</Badge>;
  };

  return (
    <Card className="data-card border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-data-blue/10">
              <History className="h-5 w-5 text-data-blue" />
            </div>
            Prediction History
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadHistory(pagination.page)}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No predictions yet</p>
            <p className="text-xs mt-1 opacity-70">Your prediction history will appear here</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">TV</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Radio</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">News</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Digital</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-right">Sales</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Conf.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-secondary/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {formatCurrency(item.tv_budget)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {formatCurrency(item.radio_budget)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {formatCurrency(item.newspaper_budget)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right">
                        {formatCurrency(item.digital_budget)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-right font-semibold text-success">
                        {formatCurrency(item.predicted_sales)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getConfidenceBadge(item.confidence_score)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground text-xs">
                Showing {history.length} of {pagination.total} predictions
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadHistory(pagination.page - 1)}
                  disabled={!pagination.has_prev || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground font-mono px-2">
                  {pagination.page} / {pagination.total_pages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadHistory(pagination.page + 1)}
                  disabled={!pagination.has_next || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
