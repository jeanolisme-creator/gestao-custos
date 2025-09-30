import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { getMonthlyTotals } from "@/utils/mockData";
import { useSystem } from "@/contexts/SystemContext";

interface EvolutionChartProps {
  data: any[];
  title?: string;
  type?: 'line' | 'area';
}

export function EvolutionChart({ 
  data, 
  title = "Evolução Mensal de Gastos - 2025",
  type = 'area'
}: EvolutionChartProps) {
  const { currentSystem } = useSystem();
  
  const getUnit = () => {
    switch (currentSystem) {
      case 'energy': return 'KWh';
      case 'fixed-line': return 'plano';
      default: return 'm³';
    }
  };
  const monthlyData = getMonthlyTotals(data).map(month => ({
    month: month.month.slice(0, 3).toUpperCase(),
    fullMonth: month.month,
    valor: Math.round(month.totalValue),
    consumo: Math.round(month.totalConsumption * 10) / 10,
    servicos: Math.round(month.totalService),
    escolas: month.schoolCount,
  }));

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
              Valor Total: <span className="font-medium">{formatCurrency(data.valor)}</span>
            </p>
            <p className="text-sm text-success">
              Consumo: <span className="font-medium">{data.consumo}{getUnit()}</span>
            </p>
            <p className="text-sm text-warning">
              Serviços: <span className="font-medium">{formatCurrency(data.servicos)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Escolas: <span className="font-medium">{data.escolas}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Acompanhamento mensal de gastos e consumo
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
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
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValor)"
              />
            </AreaChart>
          ) : (
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                className="fill-muted-foreground"
                fontSize={11}
              />
              <YAxis
                className="fill-muted-foreground"
                fontSize={11}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "hsl(var(--primary-glow))" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}