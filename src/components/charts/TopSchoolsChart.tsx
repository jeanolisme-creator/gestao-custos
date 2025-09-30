import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { aggregateBySchool } from "@/utils/mockData";
import { aggregateSystemData, UnifiedRecord } from "@/utils/systemData";
import { useSystem } from "@/contexts/SystemContext";

interface TopSchoolsChartProps {
  data: any[];
  month?: string;
}

export function TopSchoolsChart({ data, month = 'dezembro' }: TopSchoolsChartProps) {
  const { currentSystem } = useSystem();
  
  const getUnit = () => {
    switch (currentSystem) {
      case 'energy': return 'KWh';
      case 'fixed-line': return 'plano';
      default: return 'm³';
    }
  };
  // Check if data is unified system data or old school data
  const isSystemData = data.length > 0 && 'system_type' in data[0];
  
  const schools = isSystemData 
    ? aggregateSystemData(data as UnifiedRecord[])
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 15)
        .map(school => ({
          name: (school.schoolName || 'Escola').replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 20),
          fullName: school.schoolName || 'Escola',
          consumo: Math.round((school.totalConsumption || 0) * 10) / 10,
          valor: Math.round(school.totalValue || 0),
        }))
    : aggregateBySchool(data, month)
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 15)
        .map(school => ({
          name: school.schoolName.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 20),
          fullName: school.schoolName,
          consumo: Math.round(school.totalConsumption * 10) / 10,
          valor: Math.round(school.totalValue),
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
          <p className="font-medium text-popover-foreground mb-2">{data.fullName}</p>
          <div className="space-y-1">
            <p className="text-sm text-primary">
              Consumo: <span className="font-medium">{data.consumo}{getUnit()}</span>
            </p>
            <p className="text-sm text-success">
              Valor: <span className="font-medium">{formatCurrency(data.valor)}</span>
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
        <h3 className="text-lg font-semibold text-foreground">
          15 Maiores Gastos/Consumo - {month.charAt(0).toUpperCase() + month.slice(1)}
        </h3>
        <p className="text-sm text-muted-foreground">
          Barras: consumo ({getUnit()}) • Linha: valor gasto (R$)
        </p>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={schools}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={11}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              className="fill-muted-foreground"
              fontSize={11}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="fill-muted-foreground"
              fontSize={11}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="consumo"
              fill="hsl(var(--primary))"
              name={`Consumo (${getUnit()})`}
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="valor"
              stroke="hsl(var(--success))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
              name="Valor (R$)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}