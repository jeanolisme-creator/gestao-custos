import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, CloudRain, Sun, Snowflake } from "lucide-react";
import { useSystem } from "@/contexts/SystemContext";

interface BrazilianSeasonalAnalysisProps {
  data: any[];
  systemType?: 'water' | 'energy';
}

export function BrazilianSeasonalAnalysis({ data, systemType = 'water' }: BrazilianSeasonalAnalysisProps) {
  const { currentSystem } = useSystem();
  
  const getUnit = () => {
    if (systemType === 'energy' || currentSystem === 'energy') return 'KWh';
    return 'm³';
  };

  // Brazilian seasons 2025 with exact dates
  const seasons2025 = {
    verao_2024_2025: {
      name: 'Verão 2024/2025',
      start: new Date(2024, 11, 21, 12, 3), // 21/12/2024 12:03
      end: new Date(2025, 2, 20, 6, 2), // 20/03/2025 06:02
      icon: Sun,
      color: '#f59e0b',
      monthsIncluded: ['Dezembro/2024', 'Janeiro/2025', 'Fevereiro/2025', 'Março/2025']
    },
    outono_2025: {
      name: 'Outono 2025',
      start: new Date(2025, 2, 20, 6, 2), // 20/03/2025 06:02
      end: new Date(2025, 5, 20, 23, 42), // 20/06/2025 23:42
      icon: CloudRain,
      color: '#d97706',
      monthsIncluded: ['Março/2025', 'Abril/2025', 'Maio/2025', 'Junho/2025']
    },
    inverno_2025: {
      name: 'Inverno 2025',
      start: new Date(2025, 5, 20, 23, 42), // 20/06/2025 23:42
      end: new Date(2025, 8, 22, 15, 19), // 22/09/2025 15:19
      icon: Snowflake,
      color: '#3b82f6',
      monthsIncluded: ['Junho/2025', 'Julho/2025', 'Agosto/2025', 'Setembro/2025']
    },
    primavera_2025: {
      name: 'Primavera 2025',
      start: new Date(2025, 8, 22, 15, 19), // 22/09/2025 15:19
      end: new Date(2025, 11, 21, 12, 3), // 21/12/2025 12:03
      icon: Thermometer,
      color: '#10b981',
      monthsIncluded: ['Setembro/2025', 'Outubro/2025', 'Novembro/2025', 'Dezembro/2025']
    },
    verao_2025_2026: {
      name: 'Verão 2025/2026',
      start: new Date(2025, 11, 21, 12, 3), // 21/12/2025 12:03
      end: new Date(2026, 2, 20, 0, 0), // 20/03/2026
      icon: Sun,
      color: '#f59e0b',
      monthsIncluded: ['Dezembro/2025', 'Janeiro/2026', 'Fevereiro/2026', 'Março/2026']
    }
  };

  // Helper to parse mes_ano_referencia
  const parseMesAno = (mesAno: string): Date | null => {
    if (!mesAno) return null;
    const parts = mesAno.split('/');
    if (parts.length !== 2) return null;
    
    const monthNames: Record<string, number> = {
      'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
      'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
      'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
    };
    
    const monthName = parts[0].toLowerCase().trim();
    const year = parseInt(parts[1]);
    const monthIndex = monthNames[monthName];
    
    if (monthIndex === undefined || isNaN(year)) return null;
    return new Date(year, monthIndex, 15); // Use middle of month
  };

  // Group data by Brazilian seasons
  const seasonalData = Object.entries(seasons2025).map(([key, season]) => {
    const seasonRecords = data.filter(record => {
      const recordDate = parseMesAno(record.mes_ano_referencia);
      if (!recordDate) return false;
      
      // Check if record date falls within season period
      return recordDate >= season.start && recordDate < season.end;
    });

    const totalConsumption = seasonRecords.reduce((sum, record) => {
      const consumo = systemType === 'energy' || currentSystem === 'energy'
        ? (record.consumo_kwh || 0)
        : (record.consumo_m3 || 0);
      return sum + parseFloat(consumo || 0);
    }, 0);

    const totalValue = seasonRecords.reduce((sum, record) => {
      return sum + parseFloat(record.valor_gasto || 0);
    }, 0);

    const recordCount = seasonRecords.length;
    const avgConsumption = recordCount > 0 ? totalConsumption / recordCount : 0;
    const avgValue = recordCount > 0 ? totalValue / recordCount : 0;

    return {
      season: season.name,
      icon: season.icon,
      color: season.color,
      consumo: Math.round(avgConsumption * 10) / 10,
      valor: Math.round(avgValue),
      total_consumo: Math.round(totalConsumption * 10) / 10,
      total_valor: Math.round(totalValue),
      recordCount,
      monthsIncluded: season.monthsIncluded,
      efficiency: avgValue > 0 ? avgConsumption / avgValue * 1000 : 0,
    };
  }).filter(s => s.recordCount > 0); // Only show seasons with data

  // Find patterns
  const maxConsumption = Math.max(...seasonalData.map(s => s.consumo));
  const minConsumption = Math.min(...seasonalData.map(s => s.consumo));
  const highestSeason = seasonalData.find(s => s.consumo === maxConsumption);
  const lowestSeason = seasonalData.find(s => s.consumo === minConsumption);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
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
              Consumo médio: <span className="font-medium">{data.consumo.toFixed(1)} {getUnit()}</span>
            </p>
            <p className="text-sm text-success">
              Valor médio: <span className="font-medium">{formatCurrency(data.valor)}</span>
            </p>
            <p className="text-sm text-warning">
              Total período: <span className="font-medium">{data.total_consumo.toFixed(1)} {getUnit()}</span>
            </p>
            <p className="text-sm text-info">
              Total gasto: <span className="font-medium">{formatCurrency(data.total_valor)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Registros: {data.recordCount}
            </p>
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              <p>Meses incluídos:</p>
              <p className="font-mono">{data.monthsIncluded.join(', ')}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (seasonalData.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card border-border shadow-card">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Não há dados disponíveis para análise sazonal
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Análise por Estações do Ano (Brasil 2025)
        </h3>
        <p className="text-sm text-muted-foreground">
          Padrões de consumo baseados nas estações astronômicas do Brasil
        </p>
      </div>

      {/* Key Insights */}
      {highestSeason && lowestSeason && minConsumption > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="flex items-center space-x-2 mb-2">
              <highestSeason.icon className="h-5 w-5 text-destructive" />
              <span className="font-medium text-foreground">Maior Consumo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {highestSeason.season} com média de {highestSeason.consumo.toFixed(1)} {getUnit()}
            </p>
            <Badge variant="destructive" className="mt-2 text-xs">
              +{Math.round(((maxConsumption - minConsumption) / minConsumption) * 100)}% vs menor
            </Badge>
          </div>

          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center space-x-2 mb-2">
              <lowestSeason.icon className="h-5 w-5 text-success" />
              <span className="font-medium text-foreground">Menor Consumo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lowestSeason.season} com média de {lowestSeason.consumo.toFixed(1)} {getUnit()}
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              Mais eficiente
            </Badge>
          </div>
        </div>
      )}
      
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="season"
              className="fill-muted-foreground"
              fontSize={11}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="fill-muted-foreground"
              fontSize={11}
              tickFormatter={(value) => `${value} ${getUnit()}`}
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        {seasonalData.map((season, index) => (
          <div key={index} className="text-center p-3 rounded-lg bg-background/50 border border-border">
            <season.icon 
              className="h-6 w-6 mx-auto mb-2" 
              style={{ color: season.color }}
            />
            <p className="text-xs font-medium text-foreground mb-1">{season.season}</p>
            <p className="text-sm font-semibold" style={{ color: season.color }}>
              {season.consumo.toFixed(1)} {getUnit()}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(season.valor)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {season.recordCount} registros
            </p>
          </div>
        ))}
      </div>

      {/* Efficiency Ranking */}
      {seasonalData.length > 1 && (
        <div>
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
                    {season.efficiency.toFixed(2)} {getUnit()}/R$1k
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
