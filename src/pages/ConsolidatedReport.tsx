import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, 
  Zap, 
  Phone, 
  Smartphone,
  Download,
  FileText,
  Sheet,
  TrendingUp,
  TrendingDown,
  Minus,
  Users
} from 'lucide-react';
import { useSystem } from '@/contexts/SystemContext';
import { generateMockSystemData, UnifiedRecord } from '@/utils/systemData';
import { cn } from '@/lib/utils';

const systemIcons = {
  water: { icon: Droplets, color: 'text-water' },
  energy: { icon: Zap, color: 'text-energy' },
  'fixed-line': { icon: Phone, color: 'text-fixed-line' },
  mobile: { icon: Smartphone, color: 'text-mobile' },
};

interface ConsolidatedData {
  schoolName: string;
  water: { value: number; consumption: number };
  energy: { value: number; consumption: number };
  fixedLine: { value: number; consumption: number };
  mobile: { value: number; consumption: number };
  total: number;
  macroregiao?: string;
  tipoEscola?: string;
}

export default function ConsolidatedReport() {
  const { allSystems } = useSystem();
  const [selectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMacroregiao, setSelectedMacroregiao] = useState('all');
  const [selectedTipoEscola, setSelectedTipoEscola] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');

  // Generate mock data for all systems
  const allData: UnifiedRecord[] = [
    ...generateMockSystemData('water', 30),
    ...generateMockSystemData('energy', 30),
    ...generateMockSystemData('fixed-line', 30),
    ...generateMockSystemData('mobile', 30),
  ];

  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const macroregioes = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];
  const tiposEscola = ['EMEF', 'EMEI', 'EMEIF', 'PAR', 'COMP', 'SEDE'];
  
  // Get unique school names for filter
  const availableSchools = [...new Set(allData.map(record => record.nome_escola))].sort();

  // Filter and consolidate data
  const consolidatedData: ConsolidatedData[] = (() => {
    let filteredData = allData;

    if (selectedMonth && selectedMonth !== 'all') {
      filteredData = filteredData.filter(record => 
        record.mes_ano_referencia.toLowerCase().includes(selectedMonth.toLowerCase())
      );
    }

    if (selectedMacroregiao && selectedMacroregiao !== 'all') {
      filteredData = filteredData.filter(record => record.macroregiao === selectedMacroregiao);
    }

    if (selectedTipoEscola && selectedTipoEscola !== 'all') {
      filteredData = filteredData.filter(record => record.tipo_escola === selectedTipoEscola);
    }

    if (selectedSchool && selectedSchool !== 'all') {
      filteredData = filteredData.filter(record => record.nome_escola === selectedSchool);
    }

    // Group by school
    const groupedBySchool = filteredData.reduce((acc, record) => {
      if (!acc[record.nome_escola]) {
        acc[record.nome_escola] = {
          schoolName: record.nome_escola,
          water: { value: 0, consumption: 0 },
          energy: { value: 0, consumption: 0 },
          fixedLine: { value: 0, consumption: 0 },
          mobile: { value: 0, consumption: 0 },
          total: 0,
          macroregiao: record.macroregiao,
          tipoEscola: record.tipo_escola,
        };
      }

      const school = acc[record.nome_escola];
      const value = record.valor_gasto || 0;

      switch (record.system_type) {
        case 'water':
          school.water.value += value;
          school.water.consumption += record.consumo_m3 || 0;
          break;
        case 'energy':
          school.energy.value += value;
          school.energy.consumption += record.consumo_kwh || 0;
          break;
        case 'fixed-line':
          school.fixedLine.value += value;
          break;
        case 'mobile':
          school.mobile.value += value;
          school.mobile.consumption += record.consumo_mb || 0;
          break;
      }

      school.total = school.water.value + school.energy.value + school.fixedLine.value + school.mobile.value;

      return acc;
    }, {} as Record<string, ConsolidatedData>);

    return Object.values(groupedBySchool).sort((a, b) => b.total - a.total);
  })();

  // Calculate totals
  const totals = {
    water: consolidatedData.reduce((sum, school) => sum + school.water.value, 0),
    energy: consolidatedData.reduce((sum, school) => sum + school.energy.value, 0),
    fixedLine: consolidatedData.reduce((sum, school) => sum + school.fixedLine.value, 0),
    mobile: consolidatedData.reduce((sum, school) => sum + school.mobile.value, 0),
  };

  const grandTotal = totals.water + totals.energy + totals.fixedLine + totals.mobile;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPercentage = (value: number) => {
    return grandTotal > 0 ? ((value / grandTotal) * 100) : 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Relatório Geral</h1>
        <p className="text-muted-foreground">
          Visão integrada dos custos de água, energia, telefonia fixa e celulares por escola
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Configure os filtros para análise detalhada</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMacroregiao} onValueChange={setSelectedMacroregiao}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as macrorregiões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as macrorregiões</SelectItem>
              {macroregioes.map(regiao => (
                <SelectItem key={regiao} value={regiao}>{regiao}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTipoEscola} onValueChange={setSelectedTipoEscola}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tiposEscola.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as escolas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as escolas</SelectItem>
              {availableSchools.map(school => (
                <SelectItem key={school} value={school}>
                  {school.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '').slice(0, 30)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Sheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Summary Cards - Reordered */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gestão de RH</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(grandTotal * 0.65)}</p>
                <p className="text-xs text-muted-foreground">
                  Recursos humanos
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Geral</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(grandTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  {consolidatedData.length} escolas
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gestão de RH</p>
              <p className="text-2xl font-bold text-orange-600">R$ 4.850.000</p>
              <p className="text-xs text-muted-foreground">
                Custo mensal total
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Custos por Escola</CardTitle>
          <CardDescription>
            Custos por dia, mês e ano de todas as escolas (água, energia, telefonia fixa e celulares)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Escola</th>
                  <th className="text-left p-3 font-medium">Tipo</th>
                  <th className="text-left p-3 font-medium">Macrorregião</th>
                  <th className="text-left p-3 font-medium">Nº Alunos</th>
                  <th className="text-right p-3 font-medium text-water">Água</th>
                  <th className="text-right p-3 font-medium text-energy">Energia</th>
                  <th className="text-right p-3 font-medium text-fixed-line">Linha Fixa</th>
                  <th className="text-right p-3 font-medium text-mobile">Celular</th>
                  <th className="text-right p-3 font-medium">Total</th>
                     <th className="text-right p-3 font-medium">Custo/Aluno</th>
                   <th className="text-right p-3 font-medium">Custo/Dia</th>
                   <th className="text-right p-3 font-medium">Custo/Mês</th>
                   <th className="text-right p-3 font-medium">Custo/Ano</th>
                   <th className="text-center p-3 font-medium">Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {consolidatedData.map((school, index) => {
                  // Mock student count - in real app, this would come from school data
                  const studentCount = Math.floor(Math.random() * 800) + 200;
                  const costPerStudent = school.total / studentCount;

                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{school.schoolName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{school.tipoEscola}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{school.macroregiao}</Badge>
                      </td>
                      <td className="p-3 font-medium">
                        {studentCount} alunos
                      </td>
                      <td className="p-3 text-right text-water font-medium">
                        {formatCurrency(school.water.value)}
                      </td>
                      <td className="p-3 text-right text-energy font-medium">
                        {formatCurrency(school.energy.value)}
                      </td>
                      <td className="p-3 text-right text-fixed-line font-medium">
                        {formatCurrency(school.fixedLine.value)}
                      </td>
                      <td className="p-3 text-right text-mobile font-medium">
                        {formatCurrency(school.mobile.value)}
                      </td>
                      <td className="p-3 text-right font-bold">
                        {formatCurrency(school.total)}
                      </td>
                       <td className="p-3 text-right font-medium text-primary">
                         {formatCurrency(costPerStudent)}
                       </td>
                       <td className="p-3 text-right font-medium text-secondary">
                         {formatCurrency(school.total / 365)}
                       </td>
                       <td className="p-3 text-right font-medium text-accent">
                         {formatCurrency(school.total / 12)}
                       </td>
                       <td className="p-3 text-right font-medium text-primary">
                         {formatCurrency(school.total)}
                       </td>
                       <td className="p-3">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <div className="flex-1 space-y-1">
                            <div className="flex gap-1">
                              <div 
                                className="h-2 bg-water rounded-sm" 
                                style={{ width: `${(school.water.value / school.total) * 100}%` }}
                              />
                              <div 
                                className="h-2 bg-energy rounded-sm" 
                                style={{ width: `${(school.energy.value / school.total) * 100}%` }}
                              />
                              <div 
                                className="h-2 bg-fixed-line rounded-sm" 
                                style={{ width: `${(school.fixedLine.value / school.total) * 100}%` }}
                              />
                              <div 
                                className="h-2 bg-mobile rounded-sm" 
                                style={{ width: `${(school.mobile.value / school.total) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{((school.water.value / school.total) * 100).toFixed(0)}%</span>
                              <span>{((school.energy.value / school.total) * 100).toFixed(0)}%</span>
                              <span>{((school.fixedLine.value / school.total) * 100).toFixed(0)}%</span>
                              <span>{((school.mobile.value / school.total) * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}