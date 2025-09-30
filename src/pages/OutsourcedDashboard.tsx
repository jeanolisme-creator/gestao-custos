import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutsourcedNavigation } from "@/components/outsourced/OutsourcedNavigation";
import { EmployeeRegistration } from "@/components/outsourced/EmployeeRegistration";
import { OutsourcedCharts } from "@/components/outsourced/OutsourcedCharts";
import { OutsourcedReports } from "@/components/outsourced/OutsourcedReports";
import { DollarSign, Users, AlertTriangle, TrendingUp, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OutsourcedDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Mock data para empresas
  const companies = {
    assej: { monthly: 150000, annual: 1800000 },
    produserv: { monthly: 200000, annual: 2400000 },
    gf: { monthly: 180000, annual: 2160000 },
    eficience: { monthly: 120000, annual: 1440000 },
  };

  // Mock data para cargos
  const positions = [
    { name: 'Aux. Apoio Escolar', quantity: 45, monthly: 67500, color: 'bg-blue-500' },
    { name: 'Apoio Administrativo', quantity: 20, monthly: 35000, color: 'bg-green-500' },
    { name: 'Porteiro', quantity: 30, monthly: 42000, color: 'bg-yellow-500' },
    { name: 'Auxiliar de Limpeza', quantity: 50, monthly: 70000, color: 'bg-red-500' },
    { name: 'Agente de Higienização', quantity: 35, monthly: 52500, color: 'bg-purple-500' },
    { name: 'Apoio Ed. Especial', quantity: 25, monthly: 40000, color: 'bg-pink-500' },
    { name: 'Outro', quantity: 15, monthly: 22500, color: 'bg-gray-500' },
  ];

  // Escolas com falta de funcionários
  const alerts = [
    { school: 'EMEF João Silva', missing: 3, positions: 'Auxiliar de Limpeza' },
    { school: 'EMEI Maria Santos', missing: 2, positions: 'Porteiro' },
    { school: 'EMEIF Carlos Lima', missing: 1, positions: 'Aux. Apoio Escolar' },
  ];

  const totalMonthly = Object.values(companies).reduce((sum, c) => sum + c.monthly, 0);
  const totalAnnual = Object.values(companies).reduce((sum, c) => sum + c.annual, 0);
  const totalEmployees = positions.reduce((sum, p) => sum + p.quantity, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-blue-600 mb-1">Assej</p>
                <p className="text-2xl font-bold text-blue-700 mb-1">45</p>
                <p className="text-sm font-semibold text-blue-600">{formatCurrency(companies.assej.monthly)}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 rounded-full bg-green-500 mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-green-600 mb-1">Produserv</p>
                <p className="text-2xl font-bold text-green-700 mb-1">60</p>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(companies.produserv.monthly)}</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 rounded-full bg-yellow-500 mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-yellow-600 mb-1">GF</p>
                <p className="text-2xl font-bold text-yellow-700 mb-1">50</p>
                <p className="text-sm font-semibold text-yellow-600">{formatCurrency(companies.gf.monthly)}</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <div className="h-12 w-12 rounded-full bg-purple-500 mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-purple-600 mb-1">Eficience</p>
                <p className="text-2xl font-bold text-purple-700 mb-1">35</p>
                <p className="text-sm font-semibold text-purple-600">{formatCurrency(companies.eficience.monthly)}</p>
              </CardContent>
            </Card>
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

      {/* Card de Alertas em linha completa */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-red-100 rounded-lg">
                <Building2 className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{alert.school}</p>
                  <p className="text-xs text-red-600">Faltam {alert.missing} - {alert.positions}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Minicards por cargo */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários por Cargo</CardTitle>
          <CardDescription>Quantidade e valor mensal por função</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {positions.map((position, index) => (
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
        {currentTab === 'employees' && <EmployeeRegistration />}
        {currentTab === 'payroll' && <div className="text-center p-8">Folha de Pagamento - Em desenvolvimento</div>}
        {currentTab === 'costs' && <OutsourcedCharts />}
        {currentTab === 'reports' && <OutsourcedReports />}
        {currentTab === 'settings' && <div className="text-center p-8">Configurações - Em desenvolvimento</div>}
      </div>
    </div>
  );
}
