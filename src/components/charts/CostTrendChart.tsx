import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getMonthlyTotals } from "@/utils/mockData";

interface CostTrendChartProps {
  data: any[];
}

export function CostTrendChart({ data }: CostTrendChartProps) {
  const monthlyData = getMonthlyTotals(data);
  
  // Calculate moving average and trend
  const chartData = monthlyData.map((month, index) => {
    const movingAvg = index >= 2 
      ? monthlyData.slice(Math.max(0, index - 2), index + 1)
          .reduce((sum, m) => sum + m.totalValue, 0) / Math.min(3, index + 1)
      : month.totalValue;

    const trend = index > 0 
      ? ((month.totalValue - monthlyData[index - 1].totalValue) / monthlyData[index - 1].totalValue) * 100
      : 0;

    return {
      month: month.month.slice(0, 3).toUpperCase(),
      fullMonth: month.month,
      valor: Math.round(month.totalValue),
      media: Math.round(movingAvg),
      tendencia: Math.round(trend * 100) / 100,
      consumo: Math.round(month.totalConsumption),
      variacao: index > 0 ? month.totalValue - monthlyData[index - 1].totalValue : 0,
    };
  });

  const avgValue = chartData.reduce((sum, d) => sum + d.valor, 0) / chartData.length;
  const lastTrend = chartData[chartData.length - 1]?.tendencia || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">
            {data.fullMonth.charAt(0).toUpperCase() + data.fullMonth.slice(1)}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-primary">
              Valor: <span className="font-medium">{formatCurrency(data.valor)}</span>
            </p>
            <p className="text-sm text-warning">
              Média móvel: <span className="font-medium">{formatCurrency(data.media)}</span>
            </p>
            <p className={`text-sm ${data.tendencia >= 0 ? 'text-success' : 'text-destructive'}`}>
              Tendência: <span className="font-medium">{data.tendencia > 0 ? '+' : ''}{data.tendencia}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Análise de Tendência de Custos
          </h3>
          <p className="text-sm text-muted-foreground">
            Evolução e previsão de gastos mensais
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastTrend >= 0 ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          <Badge 
            variant={lastTrend >= 0 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {lastTrend > 0 ? '+' : ''}{lastTrend}%
          </Badge>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              className="fill-muted-foreground"
              fontSize={11}
            />
            <YAxis
              className="fill-muted-foreground"
              fontSize={11}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={avgValue} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5" 
              opacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="valor"
              fill="url(#colorTrend)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="media"
              stroke="hsl(var(--warning))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-background/50">
          <p className="text-xs text-muted-foreground">Média Anual</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(avgValue)}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <p className="text-xs text-muted-foreground">Tendência Atual</p>
          <p className={`text-sm font-semibold ${lastTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
            {lastTrend > 0 ? '+' : ''}{lastTrend}%
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/50">
          <p className="text-xs text-muted-foreground">Projeção</p>
          <p className="text-sm font-semibold text-primary">
            {formatCurrency(chartData[chartData.length - 1]?.valor * (1 + lastTrend / 100) || 0)}
          </p>
        </div>
      </div>
    </Card>
  );
}