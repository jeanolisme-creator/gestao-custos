import { Card } from "@/components/ui/card";
import { getMonthlyTotals } from "@/utils/mockData";

interface ConsumptionHeatmapProps {
  data: any[];
}

export function ConsumptionHeatmap({ data }: ConsumptionHeatmapProps) {
  const monthlyData = getMonthlyTotals(data);
  
  // Calculate intensity levels (0-4) based on consumption
  const maxConsumption = Math.max(...monthlyData.map(m => m.totalConsumption));
  const minConsumption = Math.min(...monthlyData.map(m => m.totalConsumption));
  
  const getIntensity = (consumption: number) => {
    const normalized = (consumption - minConsumption) / (maxConsumption - minConsumption);
    return Math.floor(normalized * 4);
  };

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-primary/10 text-primary',
      'bg-primary/25 text-primary', 
      'bg-primary/50 text-primary-foreground',
      'bg-primary/75 text-primary-foreground',
      'bg-primary text-primary-foreground'
    ];
    return colors[intensity] || colors[0];
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Create a grid representation (simulating daily data)
  const gridData = [];
  for (let week = 0; week < 7; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      const monthIndex = Math.floor((week * 7 + day) / 6) % 12;
      const month = monthlyData[monthIndex];
      const dailyConsumption = month.totalConsumption / 30; // Average daily
      const variation = (Math.random() - 0.5) * 0.4;
      const value = dailyConsumption * (1 + variation);
      
      weekData.push({
        value: Math.max(0, value),
        intensity: getIntensity(value),
        month: month.month,
        day: day,
        week: week
      });
    }
    gridData.push(weekData);
  }

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Mapa de Calor - Consumo Diário
        </h3>
        <p className="text-sm text-muted-foreground">
          Intensidade de consumo ao longo do ano
        </p>
      </div>
      
      <div className="space-y-2">
        {/* Weekday labels */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div></div>
          {weekdays.map(day => (
            <div key={day} className="text-xs text-center text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        {gridData.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-8 gap-1">
            <div className="text-xs text-muted-foreground flex items-center justify-end pr-2">
              S{weekIndex + 1}
            </div>
            {week.map((cell, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  h-6 w-full rounded-sm cursor-pointer transition-all duration-200 hover:scale-110
                  flex items-center justify-center text-xs font-medium
                  ${getIntensityColor(cell.intensity)}
                `}
                title={`${cell.value.toFixed(1)}m³ - ${cell.month}`}
              >
                {cell.intensity > 2 ? Math.round(cell.value) : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Menor</span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map(intensity => (
            <div
              key={intensity}
              className={`h-3 w-3 rounded-sm ${getIntensityColor(intensity).split(' ')[0]}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Maior</span>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Padrões de consumo identificados: picos em {monthlyData
            .sort((a, b) => b.totalConsumption - a.totalConsumption)
            .slice(0, 2)
            .map(m => m.month)
            .join(' e ')}
        </p>
      </div>
    </Card>
  );
}