import { Card } from "@/components/ui/card";
import { getMonthlyTotals } from "@/utils/mockData";
import { cn } from "@/lib/utils";

interface MonthlyMiniCardsProps {
  data: any[];
}

export function MonthlyMiniCards({ data }: MonthlyMiniCardsProps) {
  const monthlyTotals = getMonthlyTotals(data);
  const currentMonth = 11; // December (0-indexed)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Gastos Mensais - 2025
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-12 gap-3">
        {monthlyTotals.map((month, index) => (
          <Card
            key={month.month}
            className={cn(
              "p-4 transition-all duration-300 hover:scale-105 cursor-pointer",
              index === currentMonth
                ? "bg-gradient-primary border-primary/30 text-primary-foreground shadow-glow"
                : "bg-gradient-card border-border hover:border-primary/30 shadow-card"
            )}
          >
            <div className="text-center space-y-2">
              <p className={cn(
                "text-xs font-medium uppercase tracking-wide",
                index === currentMonth ? "text-current opacity-90" : "text-muted-foreground"
              )}>
                {month.month.slice(0, 3)}
              </p>
              <p className={cn(
                "text-sm font-bold",
                index === currentMonth ? "text-current" : "text-foreground"
              )}>
                {formatCurrency(month.totalValue)}
              </p>
              <div className={cn(
                "text-xs space-y-1",
                index === currentMonth ? "text-current opacity-75" : "text-muted-foreground"
              )}>
                <p>{month.totalConsumption.toFixed(0)}m³</p>
                <p>{month.schoolCount} escolas</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}