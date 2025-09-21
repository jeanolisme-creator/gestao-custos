import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { EvolutionChart } from "@/components/charts/EvolutionChart";
import { SchoolTypeDistribution } from "@/components/charts/SchoolTypeDistribution";
import { TopSchoolsChart } from "@/components/charts/TopSchoolsChart";
import { ComparisonChart } from "@/components/charts/ComparisonChart";
import { mockData, schoolNames } from "@/utils/mockData";

const chartTypes = [
  { value: 'line', label: 'Linha' },
  { value: 'area', label: 'Área' },
  { value: 'bar', label: 'Barras' },
  { value: 'pie', label: 'Pizza' },
  { value: 'doughnut', label: 'Rosca' },
];

const years = ['2025', '2026', '2027'];

export default function Charts() {
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [chartType, setChartType] = useState<string>("area");

  const applyFilters = () => {
    // This would normally filter the data based on selections
    console.log('Filters applied:', { selectedSchool, selectedYear, chartType });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Módulo de Gráficos
          </h1>
          <p className="text-muted-foreground">
            Análise visual interativa dos dados de consumo e gastos
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gradient-card border-border shadow-card">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Escola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {schoolNames.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de Gráfico</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={applyFilters} className="bg-primary hover:bg-primary-hover">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Chart */}
          <EvolutionChart 
            data={mockData} 
            title="Evolução Mensal de Custos - 2025"
            type={chartType as 'line' | 'area'}
          />

          {/* Distribution Chart */}
          <SchoolTypeDistribution 
            data={mockData} 
            month={undefined} // Show yearly data
          />

          {/* Comparison Chart */}
          <ComparisonChart 
            data={mockData}
            title="Comparativo: Consumo vs Valor"
          />

          {/* Top Schools */}
          <TopSchoolsChart 
            data={mockData}
            month="dezembro"
          />
        </div>

        {/* Additional Analysis Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Análises Adicionais
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seasonal Analysis */}
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Análise Sazonal
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Consumo por período do ano
              </p>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráfico de sazonalidade em desenvolvimento
              </div>
            </Card>

            {/* Efficiency Analysis */}
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Análise de Eficiência
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Consumo por m² de área construída
              </p>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráfico de eficiência em desenvolvimento
              </div>
            </Card>

            {/* Cost Prediction */}
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Projeção de Custos
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Estimativa para os próximos meses
              </p>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráfico de projeção em desenvolvimento
              </div>
            </Card>

            {/* Regional Analysis */}
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Análise Regional
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Distribuição geográfica dos gastos
              </p>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Mapa de calor em desenvolvimento
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}