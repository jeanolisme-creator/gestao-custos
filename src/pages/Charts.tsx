import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedSchoolsForComparison, setSelectedSchoolsForComparison] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<SchoolData[]>(data);

  // Initialize filtered data when component mounts or data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSchoolSelection = (schoolName: string, checked: boolean) => {
    if (checked && selectedSchoolsForComparison.length < 15) {
      setSelectedSchoolsForComparison([...selectedSchoolsForComparison, schoolName]);
    } else if (!checked) {
      setSelectedSchoolsForComparison(selectedSchoolsForComparison.filter(s => s !== schoolName));
    }
  };

  const handleApplyFilters = () => {
    // Apply filters to update the data
    const filtered = data.filter(record => {
      const matchesYear = selectedYear === "2025" || record.ano.toString() === selectedYear;
      const matchesSchool = selectedSchool === "all" || record.unidade === selectedSchool;
      return matchesYear && matchesSchool;
    });
    
    setFilteredData(filtered);
    
    console.log('Filters applied:', {
      school: selectedSchool,
      year: selectedYear,
      chartType: selectedChartType,
      filteredRecords: filtered.length
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Módulos Gráficos
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
            <EvolutionChart data={filteredData} />
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
            <SchoolTypeDistribution data={filteredData} />
          </Card>

          {/* Comparison Chart */}
          <Card className="p-6">
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Comparativo entre Escolas
                </h2>
                <p className="text-muted-foreground">
                  Selecione até 15 escolas para comparar dados ({selectedSchoolsForComparison.length}/15 selecionadas)
                </p>
              </div>
              
              <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {schoolNames.slice(0, 15).map((school) => (
                    <div key={school} className="flex items-center space-x-2">
                      <Checkbox
                        id={school}
                        checked={selectedSchoolsForComparison.includes(school)}
                        onCheckedChange={(checked) => handleSchoolSelection(school, checked as boolean)}
                        disabled={!selectedSchoolsForComparison.includes(school) && selectedSchoolsForComparison.length >= 15}
                      />
                      <label 
                        htmlFor={school} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                      >
                        {school.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 25)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ComparisonChart 
              data={filteredData} 
              selectedSchools={selectedSchoolsForComparison}
              title={`Comparativo: ${selectedSchoolsForComparison.length > 0 ? `${selectedSchoolsForComparison.length} escolas selecionadas` : 'Top 15 escolas'}`}
            />
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
            <TopSchoolsChart data={filteredData} />
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