import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchoolData, schoolNames, aggregateBySchool } from "@/utils/mockData";
import { useSystem } from "@/contexts/SystemContext";
import { generateMockSystemData, aggregateSystemData } from "@/utils/systemData";
import { Search, Calculator, Users, Building2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

interface ConsolidatedCostsProps {
  data: SchoolData[];
}

const months = [
  'todos', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const years = ['2025', '2026', '2027'];

export default function ConsolidatedCosts({ data }: ConsolidatedCostsProps) {
  const { currentSystem, systemConfig } = useSystem();
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedMonth, setSelectedMonth] = useState<string>("dezembro");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Generate system-specific data
  const systemData = generateMockSystemData(currentSystem, 50);
  const monthData = aggregateSystemData(systemData, selectedMonth);
  const yearData = aggregateSystemData(systemData);

  // Mock student data for calculations
  const studentData = [
    { school: "EMEF João Silva", students: 450 },
    { school: "EMEI Maria Santos", students: 180 },
    { school: "EMEIF Pedro Costa", students: 320 },
    { school: "COMP Ana Lima", students: 280 },
    { school: "PAR Carlos Souza", students: 150 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate totals
  const totalMonthCost = monthData.reduce((sum, school) => sum + school.totalValue, 0);
  const totalYearCost = yearData.reduce((sum, school) => sum + school.totalValue, 0);
  const totalStudents = studentData.reduce((sum, s) => sum + s.students, 0);
  const totalSchools = monthData.length;

  // Calculate costs per student
  const costPerStudentMonth = totalMonthCost / totalStudents;
  const costPerStudentYear = totalYearCost / totalStudents;
  const costPerStudentDay = costPerStudentMonth / 30;

  // Calculate costs per school
  const costPerSchoolMonth = totalMonthCost / totalSchools;
  const costPerSchoolYear = totalYearCost / totalSchools;
  const costPerSchoolDay = costPerSchoolMonth / 30;

  // Filter data for table
  const getFilteredData = () => {
    let filtered = monthData;
    
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(school => school.schoolName === selectedSchool);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(school => 
        school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.map(school => {
      const studentInfo = studentData.find(s => s.school.includes(school.schoolName.split(' ')[1])) || { students: 200 };
      return {
        ...school,
        students: studentInfo.students,
        costPerStudent: school.totalValue / studentInfo.students,
        costPerStudentDay: (school.totalValue / studentInfo.students) / 30,
      };
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatório de Custos - {systemConfig.name}
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada de custos por aluno e por escola
          </p>
        </div>

        {/* Cost Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Custo por Aluno Mensal"
            value={formatCurrency(costPerStudentMonth)}
            icon={Users}
            description={`${selectedMonth} ${selectedYear}`}
            variant="primary"
          />
          <MetricCard
            title="Custo por Aluno Anual"
            value={formatCurrency(costPerStudentYear)}
            icon={Users}
            description={`Ano ${selectedYear}`}
            variant="success"
          />
          <MetricCard
            title="Custo por Escola Mês"
            value={formatCurrency(costPerSchoolMonth)}
            icon={Building2}
            description={`${selectedMonth} ${selectedYear}`}
            variant="warning"
          />
          <MetricCard
            title="Custo por Escola Anual"
            value={formatCurrency(costPerSchoolYear)}
            icon={Building2}
            description={`Ano ${selectedYear}`}
            variant="primary"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Custo por Aluno/Dia</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(costPerStudentDay)}
            </p>
            <p className="text-sm text-muted-foreground">Base: {totalStudents} alunos</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Custo por Escola/Dia</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(costPerSchoolDay)}
            </p>
            <p className="text-sm text-muted-foreground">Base: {totalSchools} escolas</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Total de Alunos</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalStudents.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Rede municipal</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ano</label>
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
              <label className="text-sm font-medium text-foreground">Mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Escola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue />
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
              <label className="text-sm font-medium text-foreground">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da escola..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Detalhamento de Custos por Escola
          </h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Nº Alunos</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead>Custo/Aluno Mês</TableHead>
                  <TableHead>Custo/Aluno Dia</TableHead>
                  <TableHead>Custo/Aluno Ano</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((school, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {school.schoolName?.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}
                    </TableCell>
                    <TableCell>{school.students}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(school.totalValue)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(school.costPerStudent)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(school.costPerStudentDay)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(school.costPerStudent * 12)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado encontrado</p>
              <p className="text-sm">Ajuste os filtros para ver os resultados</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}