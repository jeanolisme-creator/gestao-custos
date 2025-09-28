import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'primary';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  variant = 'default',
  className 
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-gradient-success border-success/20 text-success-foreground shadow-lg';
      case 'warning':
        return 'bg-gradient-warning border-warning/20 text-warning-foreground shadow-lg';
      case 'primary':
        return 'bg-gradient-primary border-primary/20 text-primary-foreground shadow-lg';
      default:
        return 'bg-gradient-card border-border hover:border-primary/30 shadow-card hover:shadow-glow transition-all duration-300';
    }
  };

  const getIconStyles = () => {
    if (variant !== 'default') return 'text-current';
    return 'text-primary';
  };

  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:scale-105 cursor-pointer",
      getVariantStyles(),
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 text-center flex-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? 'text-muted-foreground' : 'text-current opacity-90'
          )}>
            {title}
          </p>
          <div className="flex items-baseline justify-center space-x-2">
            <p className={cn(
              "text-2xl font-bold tracking-tight",
              variant === 'default' ? 'text-foreground' : 'text-current'
            )}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>
            {trend && (
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive 
                  ? variant === 'default' 
                    ? 'bg-success-light text-success' 
                    : 'bg-white/20 text-current'
                  : variant === 'default'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-white/20 text-current'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className={cn(
              "text-xs",
              variant === 'default' ? 'text-muted-foreground' : 'text-current opacity-75'
            )}>
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center",
          variant === 'default' 
            ? 'bg-primary/10 text-primary' 
            : 'bg-white/20 text-current'
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}