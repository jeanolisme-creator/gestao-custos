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
import { SchoolData, schoolNames } from "@/utils/mockData";

interface ChartsProps {
  data: SchoolData[];
}

const chartTypes = [
  { value: 'line', label: 'Linha' },
  { value: 'area', label: 'Área' },
  { value: 'bar', label: 'Barras' },
  { value: 'pie', label: 'Pizza' },
  { value: 'donut', label: 'Rosca' },
];

const years = ['2025', '2026', '2027'];

export default function Charts({ data }: ChartsProps) {
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedChartType, setSelectedChartType] = useState<string>("line");

  const handleApplyFilters = () => {
    // Filter logic will be implemented here
    console.log('Filters applied:', {
      school: selectedSchool,
      year: selectedYear,
      chartType: selectedChartType
    });
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
            Análise detalhada com filtros personalizáveis
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Selecionar Escola
              </label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as escolas" />
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
              <label className="text-sm font-medium text-foreground">
                Selecionar Ano
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
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
              <label className="text-sm font-medium text-foreground">
                Tipo de Gráfico
              </label>
              <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                <SelectTrigger>
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
              <Button onClick={handleApplyFilters} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Chart */}
          <Card className="p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Evolução Mensal de Custos - {selectedYear}
              </h2>
              <p className="text-muted-foreground">
                Comparação com escola selecionada: {selectedSchool === 'all' ? 'Todas' : selectedSchool}
              </p>
            </div>
            <EvolutionChart data={data} />
          </Card>

          {/* Distribution Chart */}
          <Card className="p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Distribuição por Categoria
              </h2>
              <p className="text-muted-foreground">
                Água, Manutenção, Limpeza, Outros
              </p>
            </div>
            <SchoolTypeDistribution data={data} />
          </Card>

          {/* Comparison Chart */}
          <Card className="p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Comparativo: Consumo vs Valor
              </h2>
              <p className="text-muted-foreground">
                Análise combinada de consumo e gastos
              </p>
            </div>
            <ComparisonChart data={data} />
          </Card>

          {/* Top Schools Chart */}
          <Card className="p-6">
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Top 5 Escolas com Maiores Custos
              </h2>
              <p className="text-muted-foreground">
                Ranking das escolas por gastos totais
              </p>
            </div>
            <TopSchoolsChart data={data} />
          </Card>
        </div>

        {/* Additional Analysis */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Análises Complementares
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Tendência Sazonal
                </h3>
                <p className="text-muted-foreground">
                  Padrões de consumo ao longo do ano
                </p>
              </div>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de Sazonalidade</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Eficiência por Escola
                </h3>
                <p className="text-muted-foreground">
                  Relação custo/benefício
                </p>
              </div>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Métricas de Eficiência</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Previsão de Gastos
                </h3>
                <p className="text-muted-foreground">
                  Projeção para próximos meses
                </p>
              </div>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Projeções Futuras</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}