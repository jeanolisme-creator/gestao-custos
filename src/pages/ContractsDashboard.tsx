import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractsNavigation } from "@/components/contracts/ContractsNavigation";
import { ContractRegistration } from "@/components/contracts/ContractRegistration";
import { ContractsCharts } from "@/components/contracts/ContractsCharts";
import { ContractsReports } from "@/components/contracts/ContractsReports";
import { DollarSign, TrendingUp, Calendar, Building2, FileText, Wifi, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseCurrency } from "@/utils/currencyMask";

export default function ContractsDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [editingContract, setEditingContract] = useState<any>(null);
  const [monthlyTotals, setMonthlyTotals] = useState<number[]>(Array(12).fill(0));

  const handleEditContract = (contractData: any) => {
    setEditingContract(contractData);
    setCurrentTab('register');
  };

  const handleContractSuccess = () => {
    setEditingContract(null);
    setCurrentTab('reports');
  };

  // Totais por empresa (calculados do banco)
  const [companyTotals, setCompanyTotals] = useState({
    adrimak: { monthly: 0, annual: 0 },
    empro: { monthly: 0, annual: 0 },
    licencas: { monthly: 0, annual: 0 },
    sinalBR: { monthly: 0, annual: 0 },
    tim: { monthly: 0, annual: 0 },
  });

  useEffect(() => {
    const fetchTotals = async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('company_name, annual_value, monthly_value, addendums, start_date, end_date');
      if (error) {
        console.error('Erro ao carregar contratos:', error);
        return;
      }
      const totals = {
        adrimak: { monthly: 0, annual: 0 },
        empro: { monthly: 0, annual: 0 },
        licencas: { monthly: 0, annual: 0 },
        sinalBR: { monthly: 0, annual: 0 },
        tim: { monthly: 0, annual: 0 },
      } as { adrimak: { monthly: number; annual: number }; empro: { monthly: number; annual: number }; licencas: { monthly: number; annual: number }; sinalBR: { monthly: number; annual: number }; tim: { monthly: number; annual: number } };

      const getKey = (name: string) => {
        const n = (name || '').toLowerCase();
        if (n.includes('adrimak')) return 'adrimak';
        if (n.includes('empro')) return 'empro';
        if (n.includes('sinal br') || n.includes('sinalbr') || n.includes('sinal')) return 'sinalBR';
        if (n.includes('tim')) return 'tim';
        if (n.includes('licen')) return 'licencas';
        return null;
      };

      // Calcular valores mensais para cada mês de 2025
      const monthlyValues = Array(12).fill(0);
      const currentYear = 2025;

      const parseAny = (val: any): number => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        const s = String(val).trim();
        if (/[,]/.test(s) && /\d,\d{2}$/.test(s)) {
          return parseFloat(s.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
        }
        const n = Number(s);
        return isFinite(n) ? n : 0;
      };

      data?.forEach((c: any) => {
        const key = getKey(c.company_name);
        if (!key) return;
        
        const addendums = Array.isArray(c.addendums) ? c.addendums : [];
        
        // Determinar valores anual e mensal com base no último aditivo quando existir
        let annual = parseAny(c.annual_value);
        let monthly = parseAny(c.monthly_value) || (annual / 12);
        
        if (addendums.length > 0) {
          const lastAddendum = addendums[addendums.length - 1];
          if (lastAddendum.monthlyValue) {
            monthly = parseAny(lastAddendum.monthlyValue);
            annual = monthly * 12;
          } else if (lastAddendum.finalValue) {
            annual = parseAny(lastAddendum.finalValue);
            monthly = annual / 12;
          } else if (lastAddendum.annualValue) {
            annual = parseAny(lastAddendum.annualValue) || 0;
            monthly = annual / 12;
          }
        }
        
        totals[key].annual += annual;
        totals[key].monthly += monthly;

        // Calcular para cada mês se o contrato estava ativo
        const startDate = c.start_date ? new Date(c.start_date) : null;
        const endDate = c.end_date ? new Date(c.end_date) : null;

        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(currentYear, month, 1);
          const monthEnd = new Date(currentYear, month + 1, 0);

          // Contrato ativo no mês se houver sobreposição entre [start_date, end_date] e [monthStart, monthEnd]
          const startsBeforeOrInMonth = !startDate || startDate <= monthEnd;
          const endsAfterOrInMonth = !endDate || endDate >= monthStart;
          const isActive = startsBeforeOrInMonth && endsAfterOrInMonth;

          if (isActive) {
            monthlyValues[month] += monthly;
          }
        }
      });

      setCompanyTotals(totals);

      // Zerar meses futuros (após o mês atual)
      const now = new Date();
      const currentMonthIndex = now.getFullYear() === currentYear ? now.getMonth() : (now.getFullYear() < currentYear ? -1 : 11);
      if (currentMonthIndex >= 0 && currentMonthIndex < 11) {
        for (let m = currentMonthIndex + 1; m < 12; m++) {
          monthlyValues[m] = 0;
        }
      }

      setMonthlyTotals(monthlyValues);
    };

    fetchTotals();
  }, []);

  const totalMonthly = (Object.values(companyTotals) as Array<{monthly:number; annual:number}>).reduce((sum, c) => sum + c.monthly, 0);
  const totalAnnual = (Object.values(companyTotals) as Array<{monthly:number; annual:number}>).reduce((sum, c) => sum + c.annual, 0);

  // Valores mensais calculados dinamicamente baseados nas datas dos contratos
  const monthlyData = [
    { month: 'Janeiro', total: monthlyTotals[0] },
    { month: 'Fevereiro', total: monthlyTotals[1] },
    { month: 'Março', total: monthlyTotals[2] },
    { month: 'Abril', total: monthlyTotals[3] },
    { month: 'Maio', total: monthlyTotals[4] },
    { month: 'Junho', total: monthlyTotals[5] },
    { month: 'Julho', total: monthlyTotals[6] },
    { month: 'Agosto', total: monthlyTotals[7] },
    { month: 'Setembro', total: monthlyTotals[8] },
    { month: 'Outubro', total: monthlyTotals[9] },
    { month: 'Novembro', total: monthlyTotals[10] },
    { month: 'Dezembro', total: monthlyTotals[11] },
  ];

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
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(companyTotals.adrimak.monthly)}</div>
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
            <div className="text-2xl font-bold text-green-700">{formatCurrency(companyTotals.empro.monthly)}</div>
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
            <div className="text-2xl font-bold text-yellow-700">{formatCurrency(companyTotals.licencas.monthly)}</div>
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
            <div className="text-2xl font-bold text-purple-700">{formatCurrency(companyTotals.sinalBR.monthly)}</div>
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
            <div className="text-2xl font-bold text-pink-700">{formatCurrency(companyTotals.tim.monthly)}</div>
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
            <div className="text-2xl font-bold text-blue-800">{formatCurrency(companyTotals.adrimak.annual)}</div>
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
            <div className="text-2xl font-bold text-green-800">{formatCurrency(companyTotals.empro.annual)}</div>
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
            <div className="text-2xl font-bold text-yellow-800">{formatCurrency(companyTotals.licencas.annual)}</div>
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
            <div className="text-2xl font-bold text-purple-800">{formatCurrency(companyTotals.sinalBR.annual)}</div>
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
            <div className="text-2xl font-bold text-pink-800">{formatCurrency(companyTotals.tim.annual)}</div>
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
        {currentTab === 'register' && (
          <ContractRegistration 
            editData={editingContract} 
            onSuccess={handleContractSuccess}
          />
        )}
        {currentTab === 'costs' && <ContractsCharts />}
        {currentTab === 'reports' && <ContractsReports onEditContract={handleEditContract} />}
        {currentTab === 'settings' && <div className="text-center p-8">Configurações - Em desenvolvimento</div>}
      </div>
    </div>
  );
}
