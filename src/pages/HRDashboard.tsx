import { useState } from "react";
import { HRNavigation } from "@/components/hr/HRNavigation";
import { EmployeeRegistration } from "@/components/hr/EmployeeRegistration";
import { PayrollManagement } from "@/components/hr/PayrollManagement";
import { CostAnalysis } from "@/components/hr/CostAnalysis";
import { HRReports } from "@/components/hr/HRReports";
import { HRSettings } from "@/components/hr/HRSettings";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  UserCheck,
  GraduationCap,
  Shield,
  Briefcase,
  Eye,
  Utensils,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock HR data
const hrData = {
  totalEmployees: 1247,
  totalMonthlyCost: 4850000,
  totalStudents: 12450,
  costPerStudent: 389.56,
  
  employeeDistribution: [
    { name: 'Professores', value: 724, percentage: 58.1, color: '#3b82f6' },
    { name: 'Agentes Administrativos', value: 152, percentage: 12.2, color: '#10b981' },
    { name: 'Diretores', value: 122, percentage: 9.8, color: '#f59e0b' },
    { name: 'Coordenadores', value: 102, percentage: 8.2, color: '#ef4444' },
    { name: 'Inspetores de Alunos', value: 82, percentage: 6.6, color: '#8b5cf6' },
    { name: 'Merendeiras', value: 65, percentage: 5.1, color: '#06b6d4' },
  ],

  schoolData: [
    { school: 'EMEF João Silva', students: 450, employees: 32, totalCost: 124800, costPerStudent: 277.33 },
    { school: 'EMEI Maria Santos', students: 180, employees: 15, totalCost: 58500, costPerStudent: 325.00 },
    { school: 'EMEIF Pedro Costa', students: 320, employees: 25, totalCost: 97500, costPerStudent: 304.69 },
    { school: 'COMP Ana Lima', students: 280, employees: 22, totalCost: 85800, costPerStudent: 306.43 },
    { school: 'PAR Carlos Souza', students: 150, employees: 12, totalCost: 46800, costPerStudent: 312.00 },
  ],

  monthlyEvolution: [
    { month: 'Jul', cost: 4650000 },
    { month: 'Ago', cost: 4720000 },
    { month: 'Set', cost: 4780000 },
    { month: 'Out', cost: 4810000 },
    { month: 'Nov', cost: 4825000 },
    { month: 'Dez', cost: 4850000 },
  ],

  costByRole: [
    { role: 'Professores', cost: 2820400 },
    { role: 'Diretores', cost: 732000 },
    { role: 'Coordenadores', cost: 459000 },
    { role: 'Ag. Administrativos', cost: 380000 },
    { role: 'Inspetores', cost: 246000 },
    { role: 'Merendeiras', cost: 195000 },
  ]
};

export default function HRDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const costVariation = ((hrData.monthlyEvolution[5].cost - hrData.monthlyEvolution[4].cost) / hrData.monthlyEvolution[4].cost) * 100;

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'employees':
        return <EmployeeRegistration />;
      case 'payroll':
        return <PayrollManagement />;
      case 'costs':
        return <CostAnalysis />;
      case 'reports':
        return <HRReports />;
      case 'settings':
        return <HRSettings />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard de Gestão de RH
            </h1>
            <p className="text-muted-foreground">
              Análise completa de recursos humanos e custos da secretaria de educação
            </p>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Custo Total Mensal"
            value={formatCurrency(hrData.totalMonthlyCost)}
            icon={DollarSign}
            description="Folha de pagamento"
            variant="primary"
            trend={{ value: costVariation, isPositive: costVariation > 0 }}
          />
          <MetricCard
            title="Total de Alunos"
            value={hrData.totalStudents.toLocaleString()}
            icon={GraduationCap}
            description="Rede municipal"
            variant="success"
          />
          <MetricCard
            title="Custo Médio por Aluno"
            value={formatCurrency(hrData.costPerStudent)}
            icon={Users}
            description="RH por aluno/mês"
            variant="warning"
          />
          <MetricCard
            title="Total de Profissionais"
            value={hrData.totalEmployees.toLocaleString()}
            icon={UserCheck}
            description="Ativos na rede"
            variant="primary"
          />
        </div>

        {/* Employee Distribution Mini Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { name: 'Prof. PEB I', value: 324, color: '#3b82f6', icon: GraduationCap },
            { name: 'Prof. PEB II', value: 280, color: '#10b981', icon: GraduationCap },
            { name: 'PEB I Temp', value: 68, color: '#f59e0b', icon: UserCheck },
            { name: 'PEB II Temp', value: 52, color: '#ef4444', icon: UserCheck },
            { name: 'Tec. Contabilidade', value: 28, color: '#8b5cf6', icon: Briefcase },
            { name: 'Assessor', value: 18, color: '#06b6d4', icon: Shield },
            { name: 'Assistente de Direção', value: 45, color: '#84cc16', icon: Users },
            { name: 'Supervisor', value: 32, color: '#f97316', icon: Eye },
            { name: 'Aux. Serv. Gerais', value: 156, color: '#ec4899', icon: Building2 },
            { name: 'Motorista', value: 42, color: '#14b8a6', icon: TrendingUp },
            { name: 'Estagiário', value: 89, color: '#8b5cf6', icon: GraduationCap },
            { name: 'Digitador', value: 24, color: '#f59e0b', icon: Briefcase },
            { name: 'Atendente', value: 36, color: '#ef4444', icon: Utensils },
          ].map((item, index) => (
            <Card key={index} className="p-3 text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <item.icon className="h-3 w-3" style={{ color: item.color }} />
                <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Distribuição de Custos por Cargo
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hrData.employeeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hrData.employeeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Cost by School Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Custo por Aluno por Escola (Top 5)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrData.schoolData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="school" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Custo/Aluno']}
                  />
                  <Bar dataKey="costPerStudent" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Evolution Line Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Evolução de Custos (Últimos 6 Meses)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hrData.monthlyEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Custo Total']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Distribution by Role Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Distribuição de Profissionais por Escola
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrData.schoolData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="school" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="employees" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Summary Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Resumo de Custos por Escola
          </h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead>Nº Alunos</TableHead>
                  <TableHead>Nº Profissionais</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead>Custo/Aluno</TableHead>
                  <TableHead>Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hrData.schoolData.map((school, index) => {
                  const variation = (Math.random() - 0.5) * 20; // Mock variation
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {school.school.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}
                      </TableCell>
                      <TableCell>{school.students}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {school.employees} funcionários
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(school.totalCost)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(school.costPerStudent)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={variation > 0 ? "destructive" : "default"}
                          className={variation > 0 ? "" : "bg-green-100 text-green-800"}
                        >
                          {variation > 0 ? "+" : ""}{variation.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <HRNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
        {renderCurrentTab()}
      </div>
    </div>
  );
}