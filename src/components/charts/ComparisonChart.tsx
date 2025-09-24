import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { aggregateBySchool } from "@/utils/mockData";
import { aggregateSystemData, UnifiedRecord } from "@/utils/systemData";

interface ComparisonChartProps {
  data: any[];
  title?: string;
  selectedSchools?: string[];
}

export function ComparisonChart({ 
  data, 
  title = "Comparativo entre Escolas",
  selectedSchools = []
}: ComparisonChartProps) {
  // Check if data is unified system data or old school data
  const isSystemData = data.length > 0 && 'system_type' in data[0];
  
  let schools: any[] = [];
  
  if (isSystemData) {
    // Use system data aggregation
    const aggregatedData = aggregateSystemData(data as UnifiedRecord[]);
    schools = selectedSchools.length > 0
      ? aggregatedData.filter(school => 
          selectedSchools.includes(school.schoolName)
        )
      : aggregatedData
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 5);
  } else {
    // Use legacy data aggregation
    schools = selectedSchools.length > 0
      ? aggregateBySchool(data).filter(school => 
          selectedSchools.includes(school.schoolName)
        )
      : aggregateBySchool(data)
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 5);
  }

  const chartData = schools.map(school => ({
    name: school.schoolName.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 15),
    fullName: school.schoolName,
    consumo: Math.round((school.totalConsumption || 0) * 10) / 10,
    agua: Math.round((school.totalValue - (school.totalService || 0)) * 100) / 100,
    servicos: Math.round((school.totalService || 0) * 100) / 100,
    total: Math.round(school.totalValue * 100) / 100,
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
              Água: <span className="font-medium">{formatCurrency(data.agua)}</span>
            </p>
            <p className="text-sm text-warning">
              Serviços: <span className="font-medium">{formatCurrency(data.servicos)}</span>
            </p>
            <p className="text-sm text-success">
              Total: <span className="font-medium">{formatCurrency(data.total)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Consumo: <span className="font-medium">{data.consumo}m³</span>
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
          Comparação de gastos por categoria
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
              className="fill-muted-foreground"
              fontSize={11}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="agua"
              stackId="a"
              fill="hsl(var(--primary))"
              name="Água"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="servicos"
              stackId="a"
              fill="hsl(var(--warning))"
              name="Serviços"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}