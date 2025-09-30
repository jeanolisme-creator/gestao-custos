import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractsNavigation } from "@/components/contracts/ContractsNavigation";
import { ContractRegistration } from "@/components/contracts/ContractRegistration";
import { ContractsCharts } from "@/components/contracts/ContractsCharts";
import { ContractsReports } from "@/components/contracts/ContractsReports";
import { DollarSign, TrendingUp, Calendar, Building2, FileText, Wifi, Phone } from "lucide-react";

export default function ContractsDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Mock data para contratos
  const contracts = {
    adrimak: { monthly: 25000, annual: 300000 },
    empro: { monthly: 18000, annual: 216000 },
    licencas: { monthly: 35000, annual: 420000 },
    sinalBR: { monthly: 12000, annual: 144000 },
    tim: { monthly: 22000, annual: 264000 },
  };

  // Mock data mensal
  const monthlyData = [
    { month: 'Janeiro', total: 112000 },
    { month: 'Fevereiro', total: 112000 },
    { month: 'Março', total: 112000 },
    { month: 'Abril', total: 112000 },
    { month: 'Maio', total: 112000 },
    { month: 'Junho', total: 112000 },
    { month: 'Julho', total: 112000 },
    { month: 'Agosto', total: 112000 },
    { month: 'Setembro', total: 112000 },
    { month: 'Outubro', total: 112000 },
    { month: 'Novembro', total: 112000 },
    { month: 'Dezembro', total: 112000 },
  ];

  const totalMonthly = Object.values(contracts).reduce((sum, c) => sum + c.monthly, 0);
  const totalAnnual = Object.values(contracts).reduce((sum, c) => sum + c.annual, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Cards principais mensais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Valor Mensal Adrimak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(contracts.adrimak.monthly)}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Valor Mensal Empro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-700">{formatCurrency(contracts.empro.monthly)}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              Valor Mensal Licenças
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-yellow-700">{formatCurrency(contracts.licencas.monthly)}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center justify-center gap-2">
              <Wifi className="h-4 w-4" />
              Valor Mensal Sinal BR
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-purple-700">{formatCurrency(contracts.sinalBR.monthly)}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-pink-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-pink-600 flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              Valor Mensal TIM
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-pink-700">{formatCurrency(contracts.tim.monthly)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cards principais anuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-blue-300 bg-blue-100">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Valor Anual Adrimak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(contracts.adrimak.annual)}</div>
          </CardContent>
        </Card>

        <Card className="border-green-300 bg-green-100">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Valor Anual Empro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-800">{formatCurrency(contracts.empro.annual)}</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-300 bg-yellow-100">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-yellow-700 flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              Valor Anual Licenças
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-yellow-800">{formatCurrency(contracts.licencas.annual)}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-300 bg-purple-100">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center justify-center gap-2">
              <Wifi className="h-4 w-4" />
              Valor Anual Sinal BR
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(contracts.sinalBR.annual)}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-300 bg-pink-100">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-pink-700 flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              Valor Anual TIM
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-pink-800">{formatCurrency(contracts.tim.annual)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Card de totais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-violet-200 bg-violet-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-violet-700">
              <DollarSign className="h-5 w-5" />
              Custo Total Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-violet-800">{formatCurrency(totalMonthly)}</div>
            <p className="text-sm text-violet-600 mt-2">Soma de todos os contratos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-violet-300 bg-violet-100">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-violet-800">
              <TrendingUp className="h-5 w-5" />
              Custo Total Anual
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-violet-900">{formatCurrency(totalAnnual)}</div>
            <p className="text-sm text-violet-700 mt-2">Projeção anual completa</p>
          </CardContent>
        </Card>
      </div>

      {/* Minicards mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Valores por Mês
          </CardTitle>
          <CardDescription>Soma de todos os contratos mês a mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {monthlyData.map((data, index) => (
              <Card key={index} className="border-violet-200 bg-violet-50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs font-medium text-violet-600 mb-1">{data.month}</p>
                  <p className="text-sm font-bold text-violet-800">{formatCurrency(data.total)}</p>
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground">
            Controle completo dos contratos e fornecedores da rede municipal
          </p>
        </div>

        <ContractsNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

        {currentTab === 'dashboard' && renderDashboard()}
        {currentTab === 'register' && <ContractRegistration />}
        {currentTab === 'costs' && <ContractsCharts />}
        {currentTab === 'reports' && <ContractsReports />}
        {currentTab === 'settings' && <div className="text-center p-8">Configurações - Em desenvolvimento</div>}
      </div>
    </div>
  );
}
