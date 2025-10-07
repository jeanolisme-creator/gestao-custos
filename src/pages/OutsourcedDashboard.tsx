import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutsourcedNavigation } from "@/components/outsourced/OutsourcedNavigation";
import { EmployeeRegistrationSimple } from "@/components/outsourced/EmployeeRegistrationSimple";
import { OutsourcedCharts } from "@/components/outsourced/OutsourcedCharts";
import { OutsourcedReports } from "@/components/outsourced/OutsourcedReports";
import { DollarSign, Users, AlertTriangle, TrendingUp, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOutsourcedEmployees } from "@/hooks/useOutsourcedEmployees";

export default function OutsourcedDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { employees, loading } = useOutsourcedEmployees();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calcular dados reais
  const companies = employees.reduce((acc, emp) => {
    if (!acc[emp.company]) {
      acc[emp.company] = { monthly: 0, count: 0 };
    }
    acc[emp.company].monthly += emp.monthly_salary;
    acc[emp.company].count += 1;
    return acc;
  }, {} as Record<string, { monthly: number; count: number }>);

  const positions = employees.reduce((acc, emp) => {
    if (!acc[emp.role]) {
      acc[emp.role] = { quantity: 0, monthly: 0 };
    }
    acc[emp.role].quantity += 1;
    acc[emp.role].monthly += emp.monthly_salary;
    return acc;
  }, {} as Record<string, { quantity: number; monthly: number }>);

  const totalMonthly = employees.reduce((sum, emp) => sum + emp.monthly_salary, 0);
  const totalAnnual = totalMonthly * 12;
  const totalEmployees = employees.length;

  const positionsArray = Object.entries(positions).map(([name, data], index) => ({
    name,
    quantity: data.quantity,
    monthly: data.monthly,
    color: ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-500'][index % 7]
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center p-8">Carregando...</div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Seção Número de funcionários por empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Número de Funcionários por Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(companies).map(([company, data], idx) => {
              const colors = [
                { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600', bold: 'text-blue-700' },
                { border: 'border-green-200', bg: 'bg-green-50', icon: 'bg-green-500', text: 'text-green-600', bold: 'text-green-700' },
                { border: 'border-yellow-200', bg: 'bg-yellow-50', icon: 'bg-yellow-500', text: 'text-yellow-600', bold: 'text-yellow-700' },
                { border: 'border-purple-200', bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600', bold: 'text-purple-700' },
              ];
              const color = colors[idx % colors.length];
              
              return (
                <Card key={company} className={`${color.border} ${color.bg}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`h-12 w-12 rounded-full ${color.icon} mx-auto mb-2 flex items-center justify-center`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <p className={`text-sm font-medium ${color.text} mb-1`}>{company}</p>
                    <p className={`text-2xl font-bold ${color.bold} mb-1`}>{data.count}</p>
                    <p className={`text-sm font-semibold ${color.text}`}>{formatCurrency(data.monthly)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Custo Total Mensal e Anual em uma linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-cyan-700">
              <DollarSign className="h-5 w-5" />
              Custo Total Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-cyan-800">{formatCurrency(totalMonthly)}</div>
            <p className="text-sm text-cyan-600 mt-2">Total de funcionários: {totalEmployees}</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-300 bg-cyan-100">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-cyan-800">
              <TrendingUp className="h-5 w-5" />
              Custo Total Anual
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-cyan-900">{formatCurrency(totalAnnual)}</div>
            <p className="text-sm text-cyan-700 mt-2">Projeção anual completa</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Alertas removido temporariamente - será implementado com lógica real */}

      {/* Minicards por cargo */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários por Cargo</CardTitle>
          <CardDescription>Quantidade e valor mensal por função</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {positionsArray.map((position, index) => (
              <Card key={index} className={`border-2 ${position.color.replace('bg-', 'border-')}`}>
                <CardContent className="p-4 text-center">
                  <div className={`h-12 w-12 rounded-full ${position.color} mx-auto mb-2 flex items-center justify-center`}>
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-foreground mb-1">{position.name}</p>
                  <Badge variant="secondary" className="mb-1">{position.quantity}</Badge>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(position.monthly)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Terceirizados</h1>
          <p className="text-muted-foreground">
            Controle completo dos funcionários terceirizados da rede municipal
          </p>
        </div>

        <OutsourcedNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

        {currentTab === 'dashboard' && renderDashboard()}
        {currentTab === 'employees' && <EmployeeRegistrationSimple />}
        {currentTab === 'payroll' && <div className="text-center p-8">Folha de Pagamento - Em desenvolvimento</div>}
        {currentTab === 'costs' && <OutsourcedCharts />}
        {currentTab === 'reports' && <OutsourcedReports />}
        {currentTab === 'settings' && <div className="text-center p-8">Configurações - Em desenvolvimento</div>}
      </div>
    </div>
  );
}
