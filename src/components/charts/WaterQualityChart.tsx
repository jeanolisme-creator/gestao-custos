import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { schoolNames } from "@/utils/mockData";

interface WaterQualityChartProps {
  data?: any[];
  selectedSchool?: string;
}

export function WaterQualityChart({ 
  data, 
  selectedSchool = schoolNames[0] 
}: WaterQualityChartProps) {
  // Mock water quality indicators
  const qualityData = [
    {
      indicator: 'Consumo Eficiente',
      value: 85,
      fullMark: 100,
    },
    {
      indicator: 'Economia',
      value: 92,
      fullMark: 100,
    },
    {
      indicator: 'Regularidade',
      value: 78,
      fullMark: 100,
    },
    {
      indicator: 'Manutenção',
      value: 88,
      fullMark: 100,
    },
    {
      indicator: 'Sustentabilidade',
      value: 95,
      fullMark: 100,
    },
    {
      indicator: 'Conformidade',
      value: 90,
      fullMark: 100,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-1">
            {data.indicator}
          </p>
          <p className="text-sm text-primary">
            Score: <span className="font-medium">{data.value}/100</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Análise de Performance Hídrica
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedSchool.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={qualityData}>
            <PolarGrid className="opacity-30" />
            <PolarAngleAxis 
              dataKey="indicator" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis 
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name="Performance"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {qualityData.map((item, index) => (
          <div
            key={item.indicator}
            className="flex items-center justify-between p-2 rounded bg-background/50"
          >
            <span className="text-sm text-foreground">{item.indicator}</span>
            <span className={`text-sm font-medium ${
              item.value >= 90 ? 'text-success' :
              item.value >= 80 ? 'text-warning' :
              'text-destructive'
            }`}>
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}