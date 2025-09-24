import {
  DollarSign,
  Droplets,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Building2,
  Wrench,
  Activity,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { MonthlyMiniCards } from "@/components/dashboard/MonthlyMiniCards";
import { SystemToggleButtons } from "@/components/dashboard/SystemToggleButtons";
import { TopSchoolsChart } from "@/components/charts/TopSchoolsChart";
import { SchoolTypeDistribution } from "@/components/charts/SchoolTypeDistribution";
import { UpcomingDues } from "@/components/charts/UpcomingDues";
import { EvolutionChart } from "@/components/charts/EvolutionChart";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { WaterQualityChart } from "@/components/charts/WaterQualityChart";
import { ConsumptionHeatmap } from "@/components/charts/ConsumptionHeatmap";
import { CostTrendChart } from "@/components/charts/CostTrendChart";
import { EfficiencyMetrics } from "@/components/charts/EfficiencyMetrics";
import { SeasonalAnalysis } from "@/components/charts/SeasonalAnalysis";
import { SchoolData, aggregateBySchool, getMonthlyTotals, getSchoolTypeDistribution, getAlerts } from "@/utils/mockData";
import { useSystem } from "@/contexts/SystemContext";
import { generateMockSystemData, aggregateSystemData, getSystemMonthlyTotals, getSystemAlerts } from "@/utils/systemData";

interface DashboardProps {
  data: SchoolData[];
}

export default function Dashboard({ data }: DashboardProps) {
  const { currentSystem, systemConfig } = useSystem();
  // Generate system-specific data
  const systemData = generateMockSystemData(currentSystem, 50);
  const currentMonth = 'dezembro';
  const monthlyTotals = getSystemMonthlyTotals(systemData);
  const currentMonthData = aggregateSystemData(systemData, currentMonth);
  const yearlyData = aggregateSystemData(systemData);
  const alerts = getSystemAlerts(systemData);
  const schoolTypeDistribution = getSchoolTypeDistribution(data, currentMonth);

  // Calculate metrics
  const currentMonthTotal = currentMonthData.reduce((sum, school) => sum + school.totalValue, 0);
  const yearlyTotal = yearlyData.reduce((sum, school) => sum + school.totalValue, 0);
  const currentMonthConsumption = currentMonthData.reduce((sum, school) => sum + school.totalConsumption, 0);
  const yearlyConsumption = yearlyData.reduce((sum, school) => sum + school.totalConsumption, 0);
  const currentMonthServices = currentMonthData.reduce((sum, school) => sum + school.totalService, 0);
  const yearlyServices = yearlyData.reduce((sum, school) => sum + school.totalService, 0);

  const avgMonthlySpend = yearlyTotal / 12;
  const avgYearlySpend = yearlyTotal;

  // Get upcoming dues
  const upcomingDues = currentMonthData
    .filter(school => school.upcomingDues.length > 0)
    .flatMap(school => school.upcomingDues).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard de Gestão de {systemConfig.name}
            </h1>
            <p className="text-muted-foreground">
              Acompanhamento completo dos gastos com {systemConfig.consumptionLabel.toLowerCase()} das escolas municipais
            </p>
          </div>
          
          {/* System Toggle Buttons */}
          <SystemToggleButtons />
        </div>

        {/* Monthly Mini Cards - Moved to top */}
        <MonthlyMiniCards data={systemData} />

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Gastos no Mês"
            value={formatCurrency(currentMonthTotal)}
            icon={DollarSign}
            description="Dezembro 2025"
            variant="primary"
            trend={{ value: 5.2, isPositive: false }}
          />
          <MetricCard
            title="Total de Gastos no Ano"
            value={formatCurrency(yearlyTotal)}
            icon={TrendingUp}
            description="Janeiro - Dezembro 2025"
            variant="success"
            trend={{ value: 12.8, isPositive: true }}
          />
          <MetricCard
            title="Média de Gastos no Mês"
            value={formatCurrency(avgMonthlySpend)}
            icon={Activity}
            description="Média mensal"
          />
          <MetricCard
            title="Vencimentos Próximos"
            value={upcomingDues}
            icon={Calendar}
            description="Próximos 7 dias"
            variant="warning"
          />
        </div>

        {/* Consumption Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={`${systemConfig.consumptionLabel} Total Mensal`}
            value={`${currentMonthConsumption.toFixed(0)}${systemConfig.unit}`}
            icon={Droplets}
            description="Dezembro 2025"
            variant="primary"
          />
          <MetricCard
            title={`${systemConfig.consumptionLabel} Total Anual`}
            value={`${yearlyConsumption.toFixed(0)}${systemConfig.unit}`}
            icon={Droplets}
            description="Janeiro - Dezembro 2025"
            variant="success"
          />
          <MetricCard
            title="Valor Serviços Mensal"
            value={formatCurrency(currentMonthServices)}
            icon={Wrench}
            description="Dezembro 2025"
          />
          <MetricCard
            title="Valor Serviços Anual"
            value={formatCurrency(yearlyServices)}
            icon={Building2}
            description="Janeiro - Dezembro 2025"
          />
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AlertCard data={data} />
          </div>
          <div className="lg:col-span-1">
            <UpcomingDues data={data} />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSchoolsChart data={systemData} />
          <SchoolTypeDistribution data={data} month="dezembro" />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EvolutionChart data={systemData} />
          <ComparisonChart data={systemData} />
        </div>

        {/* New Analysis Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Análises Avançadas
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WaterQualityChart data={systemData} />
            <ConsumptionHeatmap data={systemData} />
            <CostTrendChart data={systemData} />
            <EfficiencyMetrics data={systemData} />
            <SeasonalAnalysis data={systemData} />
          </div>
        </div>
      </div>
    </div>
  );
}