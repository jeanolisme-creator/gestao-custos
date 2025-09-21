import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award,
  Target,
  TrendingUp,
  Droplets,
  DollarSign,
  Calendar,
  ThermometerSun,
  Leaf
} from "lucide-react";
import { aggregateBySchool } from "@/utils/mockData";

interface EfficiencyMetricsProps {
  data: any[];
}

export function EfficiencyMetrics({ data }: EfficiencyMetricsProps) {
  const schools = aggregateBySchool(data);
  
  // Calculate efficiency metrics
  const totalConsumption = schools.reduce((sum, s) => sum + s.totalConsumption, 0);
  const totalValue = schools.reduce((sum, s) => sum + s.totalValue, 0);
  const avgEfficiency = totalValue > 0 ? (totalConsumption / totalValue) * 1000 : 0; // m³ per R$ 1000
  
  // Efficiency rankings
  const efficiencyRanking = schools
    .map(school => ({
      ...school,
      efficiency: school.totalValue > 0 ? school.totalConsumption / school.totalValue : 0,
      costPerM3: school.totalConsumption > 0 ? school.totalValue / school.totalConsumption : 0,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);

  const topEfficient = efficiencyRanking.slice(0, 3);
  const leastEfficient = efficiencyRanking.slice(-3).reverse();

  const metrics = [
    {
      title: "Eficiência Média",
      value: `${avgEfficiency.toFixed(2)} m³/R$1k`,
      progress: 75,
      icon: Target,
      description: "Consumo por mil reais gastos",
      color: "primary"
    },
    {
      title: "Economia Potencial",
      value: "R$ 45.200",
      progress: 60,
      icon: DollarSign,
      description: "Economia estimada com otimização",
      color: "success"
    },
    {
      title: "Meta de Sustentabilidade",
      value: "82%",
      progress: 82,
      icon: Leaf,
      description: "Progresso da meta anual",
      color: "success"
    },
    {
      title: "Índice de Qualidade",
      value: "8.7/10",
      progress: 87,
      icon: Award,
      description: "Qualidade geral do sistema",
      color: "primary"
    }
  ];

  const getColorClass = (color: string) => {
    switch (color) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'destructive': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Métricas de Eficiência Hídrica
        </h3>
        <p className="text-sm text-muted-foreground">
          Indicadores de performance e sustentabilidade
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <metric.icon className={`h-5 w-5 ${getColorClass(metric.color)}`} />
                <span className="font-medium text-foreground">{metric.title}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {metric.value}
              </Badge>
            </div>
            <Progress value={metric.progress} className="mb-2" />
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Efficient */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2 text-success" />
            Escolas Mais Eficientes
          </h4>
          <div className="space-y-2">
            {topEfficient.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    #{index + 1} {school.schoolName.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 20)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {school.totalConsumption.toFixed(1)}m³ • {formatCurrency(school.totalValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">
                    R$ {school.costPerM3.toFixed(2)}/m³
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Efficient */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-warning" />
            Oportunidades de Melhoria
          </h4>
          <div className="space-y-2">
            {leastEfficient.map((school, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {school.schoolName.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 20)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {school.totalConsumption.toFixed(1)}m³ • {formatCurrency(school.totalValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-warning">
                    R$ {school.costPerM3.toFixed(2)}/m³
                  </p>
                  <Badge variant="outline" className="text-xs">
                    +{((school.costPerM3 / topEfficient[0].costPerM3 - 1) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-lg bg-background/30">
          <Droplets className="h-6 w-6 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Total Consumo</p>
          <p className="text-sm font-semibold text-foreground">
            {totalConsumption.toFixed(0)}m³
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/30">
          <DollarSign className="h-6 w-6 mx-auto mb-1 text-success" />
          <p className="text-xs text-muted-foreground">Total Gastos</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/30">
          <Calendar className="h-6 w-6 mx-auto mb-1 text-warning" />
          <p className="text-xs text-muted-foreground">Escolas Ativas</p>
          <p className="text-sm font-semibold text-foreground">
            {schools.length}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg bg-background/30">
          <ThermometerSun className="h-6 w-6 mx-auto mb-1 text-destructive" />
          <p className="text-xs text-muted-foreground">Alertas</p>   
          <p className="text-sm font-semibold text-foreground">
            {Math.floor(schools.length * 0.15)}
          </p>
        </div>
      </div>
    </Card>
  );
}