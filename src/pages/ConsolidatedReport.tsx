import { useState } from 'react';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
  Users,
  Package,
  DollarSign,
  BarChart3,
  Search
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

// Mock schools data for detailed cost report
const mockSchools = [
  { nome: 'EMEF João Silva', custoTotal: 45000, totalAlunos: 320 },
  { nome: 'EMEI Maria Santos', custoTotal: 32000, totalAlunos: 180 },
  { nome: 'EMEIF Pedro Costa', custoTotal: 38000, totalAlunos: 250 },
  { nome: 'PAR Central', custoTotal: 28000, totalAlunos: 150 },
  { nome: 'COMP Norte', custoTotal: 42000, totalAlunos: 290 },
];

export default function ConsolidatedReport() {
  const { allSystems } = useSystem();
  const [selectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMacroregiao, setSelectedMacroregiao] = useState('all');
  const [selectedTipoEscola, setSelectedTipoEscola] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState(mockSchools);
  const [searchTerm2, setSearchTerm2] = useState('');
  const [filteredConsolidatedData, setFilteredConsolidatedData] = useState<ConsolidatedData[]>([]);

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

  // Update filtered consolidated data when consolidatedData changes
  React.useEffect(() => {
    setFilteredConsolidatedData(consolidatedData);
  }, [consolidatedData]);

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

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredSchools(mockSchools);
      return;
    }
    
    const filtered = mockSchools.filter(school =>
      school.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSchools(filtered);
  };

  const handleSearch2 = () => {
    if (searchTerm2.trim() === '') {
      setFilteredConsolidatedData(consolidatedData);
      return;
    }
    
    const filtered = consolidatedData.filter(school =>
      school.schoolName.toLowerCase().includes(searchTerm2.toLowerCase())
    );
    setFilteredConsolidatedData(filtered);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gestão de RH</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(grandTotal * 0.65)}</p>
                <p className="text-xs text-muted-foreground">
                  Recursos humanos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-water/20 bg-water/5">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Droplets className="h-8 w-8 text-water" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Água</p>
                <p className="text-2xl font-bold text-water">{formatCurrency(totals.water)}</p>
                <p className="text-xs text-muted-foreground">
                  {getPercentage(totals.water).toFixed(1)}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-energy/20 bg-energy/5">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Zap className="h-8 w-8 text-energy" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Energia</p>
                <p className="text-2xl font-bold text-energy">{formatCurrency(totals.energy)}</p>
                <p className="text-xs text-muted-foreground">
                  {getPercentage(totals.energy).toFixed(1)}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-fixed-line/20 bg-fixed-line/5">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-8 w-8 text-fixed-line" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Linha Fixa</p>
                <p className="text-2xl font-bold text-fixed-line">{formatCurrency(totals.fixedLine)}</p>
                <p className="text-xs text-muted-foreground">
                  {getPercentage(totals.fixedLine).toFixed(1)}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-mobile/20 bg-mobile/5">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Smartphone className="h-8 w-8 text-mobile" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Celular</p>
                <p className="text-2xl font-bold text-mobile">{formatCurrency(totals.mobile)}</p>
                <p className="text-xs text-muted-foreground">
                  {getPercentage(totals.mobile).toFixed(1)}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Geral</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(grandTotal + (grandTotal * 0.65))}</p>
                <p className="text-xs text-muted-foreground">
                  {consolidatedData.length} escolas + RH
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Cost Analysis Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatório de Custos Escola/Aluno
          </CardTitle>
          <CardDescription>
            Análise de custos detalhada por escola (dia, mês e ano) e custo por aluno
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input 
                placeholder="Buscar escola..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <th className="border border-border p-3 text-left font-semibold text-primary">Escola</th>
                    <th className="border border-border p-3 text-center font-semibold text-blue-600">Custo/Dia</th>
                    <th className="border border-border p-3 text-center font-semibold text-green-600">Custo/Mês</th>
                    <th className="border border-border p-3 text-center font-semibold text-purple-600">Custo/Ano</th>
                    <th className="border border-border p-3 text-center font-semibold text-orange-600">Custo/Aluno Dia</th>
                    <th className="border border-border p-3 text-center font-semibold text-red-600">Custo/Aluno Mês</th>
                    <th className="border border-border p-3 text-center font-semibold text-indigo-600">Custo/Aluno Ano</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.slice(0, 10).map((school, index) => (
                    <tr key={index} className="hover:bg-muted/50 transition-colors duration-200 border-b border-border/50">
                      <td className="border border-border p-3 font-medium text-foreground">{school.nome}</td>
                      <td className="border border-border p-3 text-center font-medium text-blue-600 bg-blue-50">
                        R$ {(school.custoTotal / 365).toFixed(2)}
                      </td>
                      <td className="border border-border p-3 text-center font-medium text-green-600 bg-green-50">
                        R$ {(school.custoTotal / 12).toFixed(2)}
                      </td>
                      <td className="border border-border p-3 text-center font-medium text-purple-600 bg-purple-50">
                        R$ {school.custoTotal.toFixed(2)}
                      </td>
                      <td className="border border-border p-3 text-center font-medium text-orange-600 bg-orange-50">
                        R$ {(school.custoTotal / 365 / school.totalAlunos).toFixed(2)}
                      </td>
                      <td className="border border-border p-3 text-center font-medium text-red-600 bg-red-50">
                        R$ {(school.custoTotal / 12 / school.totalAlunos).toFixed(2)}
                      </td>
                      <td className="border border-border p-3 text-center font-medium text-indigo-600 bg-indigo-50">
                        R$ {(school.custoTotal / school.totalAlunos).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Custos por Escola</CardTitle>
          <CardDescription>
            Custos por dia, mês e ano de todas as escolas (água, energia, telefonia fixa, celulares e RH)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input 
                placeholder="Buscar escola..." 
                className="max-w-sm"
                value={searchTerm2}
                onChange={(e) => setSearchTerm2(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch2()}
              />
              <Button onClick={handleSearch2}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <th className="border border-border p-3 text-left font-semibold text-primary">Escola</th>
                    <th className="border border-border p-3 text-center font-semibold text-blue-600">Tipo</th>
                    <th className="border border-border p-3 text-center font-semibold text-green-600">Macrorregião</th>
                    <th className="border border-border p-3 text-center font-semibold text-purple-600">Nº Alunos</th>
                    <th className="border border-border p-3 text-center font-semibold text-water">Água</th>
                    <th className="border border-border p-3 text-center font-semibold text-energy">Energia</th>
                    <th className="border border-border p-3 text-center font-semibold text-fixed-line">Linha Fixa</th>
                    <th className="border border-border p-3 text-center font-semibold text-mobile">Celular</th>
                    <th className="border border-border p-3 text-center font-semibold text-orange-600">RH</th>
                    <th className="border border-border p-3 text-center font-semibold text-primary">Total</th>
                    <th className="border border-border p-3 text-center font-semibold text-secondary">Custo/Aluno</th>
                    <th className="border border-border p-3 text-center font-semibold text-accent">Custo/Dia</th>
                    <th className="border border-border p-3 text-center font-semibold text-destructive">Custo/Mês</th>
                    <th className="border border-border p-3 text-center font-semibold text-primary">Custo/Ano</th>
                    <th className="border border-border p-3 text-center font-semibold text-muted-foreground">Distribuição</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsolidatedData.map((school, index) => {
                    // Mock student count - in real app, this would come from school data
                    const studentCount = Math.floor(Math.random() * 800) + 200;
                    const hrCost = school.total * 0.65; // 65% para RH
                    const totalWithHR = school.total + hrCost;
                    const costPerStudent = totalWithHR / studentCount;

                    return (
                      <tr key={index} className="hover:bg-muted/50 transition-colors duration-200 border-b border-border/50">
                        <td className="border border-border p-3 font-medium text-foreground">{school.schoolName}</td>
                        <td className="border border-border p-3 text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{school.tipoEscola}</Badge>
                        </td>
                        <td className="border border-border p-3 text-center">
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">{school.macroregiao}</Badge>
                        </td>
                        <td className="border border-border p-3 text-center font-medium text-purple-600 bg-purple-50">
                          {studentCount}
                        </td>
                        <td className="border border-border p-3 text-center text-water font-medium bg-water/5">
                          {formatCurrency(school.water.value)}
                        </td>
                        <td className="border border-border p-3 text-center text-energy font-medium bg-energy/5">
                          {formatCurrency(school.energy.value)}
                        </td>
                        <td className="border border-border p-3 text-center text-fixed-line font-medium bg-fixed-line/5">
                          {formatCurrency(school.fixedLine.value)}
                        </td>
                        <td className="border border-border p-3 text-center text-mobile font-medium bg-mobile/5">
                          {formatCurrency(school.mobile.value)}
                        </td>
                        <td className="border border-border p-3 text-center font-medium text-orange-600 bg-orange-50">
                          {formatCurrency(hrCost)}
                        </td>
                        <td className="border border-border p-3 text-center font-bold text-primary bg-primary/5">
                          {formatCurrency(totalWithHR)}
                        </td>
                        <td className="border border-border p-3 text-center font-medium text-secondary bg-secondary/5">
                          {formatCurrency(costPerStudent)}
                        </td>
                        <td className="border border-border p-3 text-center font-medium text-accent bg-accent/5">
                          {formatCurrency(totalWithHR / 365)}
                        </td>
                        <td className="border border-border p-3 text-center font-medium text-destructive bg-destructive/5">
                          {formatCurrency(totalWithHR / 12)}
                        </td>
                        <td className="border border-border p-3 text-center font-medium text-primary bg-primary/5">
                          {formatCurrency(totalWithHR)}
                        </td>
                        <td className="border border-border p-3 text-center">
                          <div className="flex items-center justify-center gap-2 min-w-[200px]">
                            <div className="flex-1 space-y-1">
                              <div className="flex gap-1 rounded-lg overflow-hidden">
                                <div 
                                  className="h-3 bg-water rounded-sm" 
                                  style={{ width: `${(school.water.value / totalWithHR) * 100}%` }}
                                />
                                <div 
                                  className="h-3 bg-energy rounded-sm" 
                                  style={{ width: `${(school.energy.value / totalWithHR) * 100}%` }}
                                />
                                <div 
                                  className="h-3 bg-fixed-line rounded-sm" 
                                  style={{ width: `${(school.fixedLine.value / totalWithHR) * 100}%` }}
                                />
                                <div 
                                  className="h-3 bg-mobile rounded-sm" 
                                  style={{ width: `${(school.mobile.value / totalWithHR) * 100}%` }}
                                />
                                <div 
                                  className="h-3 bg-orange-500 rounded-sm" 
                                  style={{ width: `${(hrCost / totalWithHR) * 100}%` }}
                                />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}