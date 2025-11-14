import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface StressEntry {
  id: string;
  stress_score: number;
  created_at: string;
}

interface StressTrendChartProps {
  entries: StressEntry[];
}

const StressTrendChart = ({ entries }: StressTrendChartProps) => {
  // Prepare data for chart
  const chartData = entries
    .slice(0, 30) // Last 30 entries
    .reverse()
    .map((entry) => ({
      date: new Date(entry.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      score: entry.stress_score,
    }));

  // Calculate trend
  const calculateTrend = () => {
    if (chartData.length < 2) return null;
    const recent = chartData.slice(-7);
    const older = chartData.slice(-14, -7);
    
    if (older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.score, 0) / older.length;
    
    return recentAvg - olderAvg;
  };

  const trend = calculateTrend();

  if (chartData.length === 0) {
    return (
      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Stress Trend</CardTitle>
          <CardDescription>Track your stress levels over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Complete a few stress analyses to see your trend
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stress Trend</CardTitle>
            <CardDescription>Last {chartData.length} check-ins</CardDescription>
          </div>
          {trend !== null && (
            <div className="flex items-center gap-2">
              {trend > 0 ? (
                <>
                  <TrendingUp className="w-5 h-5 text-danger" />
                  <span className="text-sm text-danger font-medium">
                    +{trend.toFixed(1)} pts
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-5 h-5 text-success" />
                  <span className="text-sm text-success font-medium">
                    {trend.toFixed(1)} pts
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StressTrendChart;
