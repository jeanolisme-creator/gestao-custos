import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";

interface CostData {
  escola: string;
  tipo: string;
  custoTotal: number;
  alunos: number;
  custoPorAluno: number;
  servidores: number;
  custoPorServidor: number;
}

const mockCostData: CostData[] = [
  {
    escola: 'EMEF João Silva',
    tipo: 'EMEF',
    custoTotal: 124800,
    alunos: 450,
    custoPorAluno: 277.33,
    servidores: 32,
    custoPorServidor: 3900.00
  },
  {
    escola: 'EMEI Maria Santos',
    tipo: 'EMEI', 
    custoTotal: 58500,
    alunos: 180,
    custoPorAluno: 325.00,
    servidores: 15,
    custoPorServidor: 3900.00
  },
  {
    escola: 'EMEIF Pedro Costa',
    tipo: 'EMEIF',
    custoTotal: 97500,
    alunos: 320,
    custoPorAluno: 304.69,
    servidores: 25,
    custoPorServidor: 3900.00
  },
  {
    escola: 'COMP Ana Lima',
    tipo: 'COMP',
    custoTotal: 85800,
    alunos: 280,
    custoPorAluno: 306.43,
    servidores: 22,
    custoPorServidor: 3900.00
  },
  {
    escola: 'PAR Carlos Souza',
    tipo: 'PAR',
    custoTotal: 46800,
    alunos: 150,
    custoPorAluno: 312.00,
    servidores: 12,
    custoPorServidor: 3900.00
  }
];

const yearlyComparison = [
  { year: '2022', custo: 4200000 },
  { year: '2023', custo: 4500000 },
  { year: '2024', custo: 4850000 }
];

const categoryDistribution = [
  { name: 'Professores', value: 2820400, color: '#3b82f6' },
  { name: 'Diretores', value: 732000, color: '#f59e0b' },
  { name: 'Coordenadores', value: 459000, color: '#ef4444' },
  { name: 'Ag. Administrativos', value: 380000, color: '#10b981' },
  { name: 'Inspetores', value: 246000, color: '#8b5cf6' },
  { name: 'Merendeiras', value: 195000, color: '#06b6d4' }
];

const salaryRanges = [
  'Até R$ 4.500,00',
  'De R$ 4.501,00 até R$ 7.500,00', 
  'De R$ 7.501,00 até R$ 9.500,00',
  'De R$ 9.501,00 até R$ 13.500,00',
  'Personalizado'
];

const years = ['2025', '2026', '2027'];

export function CostAnalysis() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const schools = [...new Set(mockCostData.map(item => item.escola))];
  
  // Filter data based on selections
  const filteredData = mockCostData.filter(record => {
    return selectedSchool === 'all' || record.escola === selectedSchool;
  });

  // Get top 10 schools by cost
  const topSchools = [...filteredData]
    .sort((a, b) => b.custoTotal - a.custoTotal)
    .slice(0, 10)
    .map(school => ({
      nome: school.escola.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, ''),
      custo: school.custoTotal
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análise de Custos</h2>
          <p className="text-muted-foreground">Análise detalhada dos custos de RH por escola e categoria</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Escola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa Salarial</label>
              <Select value={selectedSalaryRange} onValueChange={setSelectedSalaryRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as faixas</SelectItem>
                  {salaryRanges.map(range => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSalaryRange === 'Personalizado' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input placeholder="Valor inicial (R$)" type="number" />
                  <Input placeholder="Valor final (R$)" type="number" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Schools by Cost */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Custos por Escola (Top 10)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSchools} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="nome" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Custo Total']}
                />
                <Bar dataKey="custo" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cost per Student by School */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Custo por Aluno por Escola
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="escola"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Custo/Aluno']}
                />
                <Bar dataKey="custoPorAluno" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribuição de Custos por Categoria
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Yearly Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Comparativo de Custos entre Anos
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Custo Total']}
                />
                <Area 
                  type="monotone" 
                  dataKey="custo" 
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Cost Table */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Consolidado de Custos por Escola</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-center">Nº Alunos</TableHead>
                  <TableHead className="text-right">Custo/Aluno</TableHead>
                  <TableHead className="text-center">Nº Servidores</TableHead>
                  <TableHead className="text-right">Custo/Servidor</TableHead>
                  <TableHead className="text-center">Eficiência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((school, index) => {
                  const efficiency = school.custoPorAluno < 300 ? 'Alta' : 
                                   school.custoPorAluno < 320 ? 'Média' : 'Baixa';
                  const efficiencyColor = efficiency === 'Alta' ? 'default' : 
                                        efficiency === 'Média' ? 'secondary' : 'destructive';

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {school.escola.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{school.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(school.custoTotal)}
                      </TableCell>
                      <TableCell className="text-center">{school.alunos}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(school.custoPorAluno)}
                      </TableCell>
                      <TableCell className="text-center">{school.servidores}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(school.custoPorServidor)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={efficiencyColor}>
                          {efficiency}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}