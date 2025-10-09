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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const chartTypes = [
  { value: 'line', label: 'Linha' },
  { value: 'area', label: 'Área' },
  { value: 'bar', label: 'Barras' },
  { value: 'pie', label: 'Pizza' },
  { value: 'donut', label: 'Rosca' },
];

const years = ['2025', '2026', '2027'];

export function EnergyCharts() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedChartType, setSelectedChartType] = useState<string>("line");
  const [selectedSchoolsForComparison, setSelectedSchoolsForComparison] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const { data: records, error } = await supabase
      .from('energy_records')
      .select('*');

    if (!error && records) {
      console.log('Dados carregados para gráficos:', records.length);
      setData(records);
      setFilteredData(records);
      const uniqueSchools = [...new Set(records.map(r => r.nome_escola))];
      setSchools(uniqueSchools);
    }
  };

  const handleSchoolSelection = (schoolName: string, checked: boolean) => {
    if (checked && selectedSchoolsForComparison.length < 15) {
      setSelectedSchoolsForComparison([...selectedSchoolsForComparison, schoolName]);
    } else if (!checked) {
      setSelectedSchoolsForComparison(selectedSchoolsForComparison.filter(s => s !== schoolName));
    }
  };

  const handleApplyFilters = () => {
    const filtered = data.filter(record => {
      const matchesSchool = selectedSchool === "all" || record.nome_escola === selectedSchool;
      return matchesSchool;
    });
    
    setFilteredData(filtered);
  };

  return (
    <div className="space-y-8">
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
                {schools.map((school) => (
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
              Análise de distribuição de gastos
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
                {schools.slice(0, 15).map((school) => (
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
                      {school}
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
    </div>
  );
}
