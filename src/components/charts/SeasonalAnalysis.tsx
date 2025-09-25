import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, CloudRain, Sun, Snowflake } from "lucide-react";
import { getMonthlyTotals } from "@/utils/mockData";
import { getSystemMonthlyTotals } from "@/utils/systemData";

interface SeasonalAnalysisProps {
  data: any[];
}

export function SeasonalAnalysis({ data }: SeasonalAnalysisProps) {
  // Check if data has unified system structure
  const hasSystemType = data.length > 0 && data[0]?.system_type;
  const monthlyData = hasSystemType ? getSystemMonthlyTotals(data) : getMonthlyTotals(data);
  
  // Define seasons and their characteristics
  const seasons = {
    verao: { months: [11, 0, 1], name: 'Verão', icon: Sun, color: '#f59e0b' },
    outono: { months: [2, 3, 4], name: 'Outono', icon: CloudRain, color: '#d97706' },
    inverno: { months: [5, 6, 7], name: 'Inverno', icon: Snowflake, color: '#3b82f6' },
    primavera: { months: [8, 9, 10], name: 'Primavera', icon: Thermometer, color: '#10b981' }
  };

  // Group data by seasons
  const seasonalData = Object.entries(seasons).map(([key, season]) => {
    const seasonMonths = season.months.map(monthIndex => monthlyData[monthIndex]);
    const totalConsumption = seasonMonths.reduce((sum, month) => sum + month.totalConsumption, 0);
    const totalValue = seasonMonths.reduce((sum, month) => sum + month.totalValue, 0);
    const avgConsumption = totalConsumption / seasonMonths.length;
    const avgValue = totalValue / seasonMonths.length;

    return {
      season: season.name,
      icon: season.icon,
      color: season.color,
      consumo: Math.round(avgConsumption * 10) / 10,
      valor: Math.round(avgValue),
      total_consumo: Math.round(totalConsumption * 10) / 10,
      total_valor: Math.round(totalValue),
      months: seasonMonths.map(m => m.month),
      efficiency: avgConsumption / avgValue * 1000, // m³ per R$ 1000
    };
  });

  // Find patterns
  const maxConsumption = Math.max(...seasonalData.map(s => s.consumo));
  const minConsumption = Math.min(...seasonalData.map(s => s.consumo));
  const highestSeason = seasonalData.find(s => s.consumo === maxConsumption);
  const lowestSeason = seasonalData.find(s => s.consumo === minConsumption);

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
          <div className="flex items-center space-x-2 mb-2">
            <data.icon className="h-4 w-4" style={{ color: data.color }} />
            <p className="font-medium text-popover-foreground">{data.season}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-primary">
              Consumo médio: <span className="font-medium">{data.consumo}m³</span>
            </p>
            <p className="text-sm text-success">
              Valor médio: <span className="font-medium">{formatCurrency(data.valor)}</span>
            </p>
            <p className="text-sm text-warning">
              Total período: <span className="font-medium">{data.total_consumo}m³</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Meses: {data.months.join(', ')}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Análise Sazonal de Consumo
        </h3>
        <p className="text-sm text-muted-foreground">
          Padrões de consumo por estação do ano
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-center space-x-2 mb-2">
            {highestSeason && <highestSeason.icon className="h-5 w-5 text-destructive" />}
            <span className="font-medium text-foreground">Maior Consumo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {highestSeason?.season} com média de {highestSeason?.consumo}m³
          </p>
          <Badge variant="destructive" className="mt-2 text-xs">
            +{Math.round(((maxConsumption - minConsumption) / minConsumption) * 100)}% vs menor
          </Badge>
        </div>

        <div className="p-4 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            {lowestSeason && <lowestSeason.icon className="h-5 w-5 text-success" />}
            <span className="font-medium text-foreground">Menor Consumo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {lowestSeason?.season} com média de {lowestSeason?.consumo}m³
          </p>
          <Badge variant="secondary" className="mt-2 text-xs">
            Mais eficiente
          </Badge>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="season"
              className="fill-muted-foreground"
              fontSize={11}
            />
            <YAxis
              className="fill-muted-foreground"
              fontSize={11}
              tickFormatter={(value) => `${value}m³`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="consumo" radius={[4, 4, 0, 0]}>
              {seasonalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {seasonalData.map((season, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-background/50">
            <season.icon 
              className="h-6 w-6 mx-auto mb-2" 
              style={{ color: season.color }}
            />
            <p className="text-xs font-medium text-foreground">{season.season}</p>
            <p className="text-sm font-semibold" style={{ color: season.color }}>
              {season.consumo}m³
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(season.valor)}
            </p>
          </div>
        ))}
      </div>

      {/* Efficiency Ranking */}
      <div className="mt-6">
        <h4 className="font-semibold text-foreground mb-3">Ranking de Eficiência</h4>
        <div className="space-y-2">
          {seasonalData
            .sort((a, b) => b.efficiency - a.efficiency)
            .map((season, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded bg-background/30">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <season.icon className="h-4 w-4" style={{ color: season.color }} />
                  <span className="text-sm text-foreground">{season.season}</span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {season.efficiency.toFixed(2)} m³/R$1k
                </span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}