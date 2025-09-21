import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { getSchoolTypeDistribution } from "@/utils/mockData";

interface SchoolTypeDistributionProps {
  data: any[];
  month?: string;
}

export function SchoolTypeDistribution({ data, month }: SchoolTypeDistributionProps) {
  const distribution = getSchoolTypeDistribution(data, month).filter(d => d.count > 0);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--destructive))',
    'hsl(var(--accent))',
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">{data.type}</p>
          <div className="space-y-1">
            <p className="text-sm">
              Quantidade: <span className="font-medium">{data.count} escolas</span>
            </p>
            <p className="text-sm">
              Valor: <span className="font-medium">{formatCurrency(data.value)}</span>
            </p>
            <p className="text-sm">
              Participação: <span className="font-medium">{data.percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Distribuição por Tipo de Escola
        </h3>
        <p className="text-sm text-muted-foreground">
          {month ? `${month.charAt(0).toUpperCase() + month.slice(1)}` : 'Anual'} - Valores e percentuais
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-foreground">
                  {value} ({entry.payload.count})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {distribution.map((item, index) => (
          <div
            key={item.type}
            className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(item.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}