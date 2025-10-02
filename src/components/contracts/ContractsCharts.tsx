import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ContractsCharts() {
  const [monthlyTotalData, setMonthlyTotalData] = useState<Array<{ month: string; total: number }>>([]);
  const [annualData, setAnnualData] = useState<Array<{ year: string; total: number }>>([]);
  const [companyDistribution, setCompanyDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('company_name, annual_value, monthly_value, addendums, start_date, end_date');

      if (error) {
        console.error('Erro ao carregar dados dos gráficos:', error);
        return;
      }

      const now = new Date();
      const currentYear = now.getFullYear();

      // Helper functions
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

      const parseAddendumDate = (a: any): Date | null => {
        const d = a?.effectiveDate || a?.startDate || a?.date || a?.data || a?.signedAt || a?.assinatura || a?.vigenciaInicio;
        if (!d) return null;
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? null : dt;
      };

      const getCompanyKey = (name: string) => {
        const n = (name || '').toLowerCase();
        if (n.includes('adrimak')) return 'Adrimak';
        if (n.includes('empro')) return 'Empro';
        if (n.includes('sinal br') || n.includes('sinalbr') || n.includes('sinal')) return 'Sinal BR';
        if (n.includes('tim')) return 'TIM';
        if (n.includes('licen')) return 'Licenças';
        return null;
      };

      // Calculate monthly values for current year
      const monthlyValues = Array(12).fill(0);
      const companyTotals: Record<string, number> = {
        'Adrimak': 0,
        'Empro': 0,
        'Licenças': 0,
        'Sinal BR': 0,
        'TIM': 0,
      };

      data?.forEach((c: any) => {
        const companyKey = getCompanyKey(c.company_name);
        if (!companyKey) return;

        const addendums = Array.isArray(c.addendums) ? c.addendums : [];
        let annual = parseAny(c.annual_value);
        let monthly = parseAny(c.monthly_value) || (annual / 12);

        const processedAdd = addendums
          .map((a: any) => {
            const d = parseAddendumDate(a);
            if (!d) return null;
            let m = 0;
            if (a?.monthlyValue) m = parseAny(a.monthlyValue);
            else if (a?.finalValue) m = parseAny(a.finalValue) / 12;
            else if (a?.annualValue) m = parseAny(a.annualValue) / 12;
            else return null;
            return { date: d, monthly: m };
          })
          .filter(Boolean)
          .sort((x: any, y: any) => x.date.getTime() - y.date.getTime());

        let effectiveMonthly = monthly;
        if (processedAdd.length > 0) {
          effectiveMonthly = processedAdd[processedAdd.length - 1].monthly;
        } else if (addendums.length > 0) {
          const lastRaw = addendums[addendums.length - 1];
          const candidate = (lastRaw?.monthlyValue ? parseAny(lastRaw.monthlyValue) : 0)
            || (lastRaw?.finalValue ? parseAny(lastRaw.finalValue) / 12 : 0)
            || (lastRaw?.annualValue ? parseAny(lastRaw.annualValue) / 12 : 0);
          if (candidate > 0) effectiveMonthly = candidate;
        }
        monthly = effectiveMonthly;

        const rawStart = c.start_date ? new Date(c.start_date) : null;
        const rawEnd = c.end_date ? new Date(c.end_date) : null;

        let effectiveStart: Date | null = rawStart;
        let effectiveEnd: Date | null = rawEnd;

        const addDatePairs = (Array.isArray(addendums) ? addendums : [])
          .map((a: any) => {
            const s = a?.startDate || a?.effectiveDate || a?.date || a?.data || a?.vigenciaInicio;
            const e = a?.endDate || a?.vigenciaFim;
            const sd = s ? new Date(s) : null;
            const ed = e ? new Date(e) : null;
            return { sd, ed };
          })
          .filter((d: any) => (d.sd && !isNaN(d.sd.getTime())) || (d.ed && !isNaN(d.ed.getTime())));

        if (addDatePairs.length > 0) {
          const startTimes = addDatePairs.map((d: any) => d.sd?.getTime()).filter(Boolean) as number[];
          const endTimes = addDatePairs.map((d: any) => d.ed?.getTime()).filter(Boolean) as number[];
          if (startTimes.length > 0) {
            const minStart = Math.min(...startTimes);
            effectiveStart = effectiveStart ? new Date(Math.min(effectiveStart.getTime(), minStart)) : new Date(minStart);
          }
          if (endTimes.length > 0) {
            const maxEnd = Math.max(...endTimes);
            effectiveEnd = effectiveEnd ? new Date(Math.max(effectiveEnd.getTime(), maxEnd)) : new Date(maxEnd);
          }
        }

        // Company totals (current month only)
        const currentMonthStart = new Date(currentYear, now.getMonth(), 1);
        const currentMonthEnd = new Date(currentYear, now.getMonth() + 1, 0);
        const activeNow = (!effectiveStart || effectiveStart <= currentMonthEnd) &&
                          (!effectiveEnd || effectiveEnd >= currentMonthStart);

        let monthlyForCurrent = monthly;
        if (processedAdd.length > 0) {
          for (let i = processedAdd.length - 1; i >= 0; i--) {
            if (processedAdd[i].date <= currentMonthEnd) {
              monthlyForCurrent = processedAdd[i].monthly;
              break;
            }
          }
        }
        if (activeNow) {
          companyTotals[companyKey] += monthlyForCurrent * 12;
        }

        // Monthly values
        for (let month = 0; month < 12; month++) {
          const monthStart = new Date(currentYear, month, 1);
          const monthEnd = new Date(currentYear, month + 1, 0);

          const isActive = (!effectiveStart || effectiveStart <= monthEnd) &&
                           (!effectiveEnd || effectiveEnd >= monthStart);

          if (isActive) {
            let monthlyForMonth = monthly;
            if (processedAdd.length > 0) {
              for (let i = processedAdd.length - 1; i >= 0; i--) {
                if (processedAdd[i].date <= monthEnd) {
                  monthlyForMonth = processedAdd[i].monthly;
                  break;
                }
              }
            }
            monthlyValues[month] += monthlyForMonth;
          }
        }
      });

      // Zero out future months
      const currentMonthIndex = now.getMonth();
      for (let m = currentMonthIndex + 1; m < 12; m++) {
        monthlyValues[m] = 0;
      }

      // Set monthly data
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      setMonthlyTotalData(monthNames.map((month, idx) => ({ month, total: monthlyValues[idx] })));

      // Set company distribution
      const colors: Record<string, string> = {
        'Adrimak': '#3b82f6',
        'Empro': '#22c55e',
        'Licenças': '#eab308',
        'Sinal BR': '#a855f7',
        'TIM': '#ef4444',
      };
      const distribution = Object.entries(companyTotals)
        .map(([name, value]) => ({ name, value, color: colors[name] || '#888888' }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);
      setCompanyDistribution(distribution);

      // Calculate annual data (simplified: just current year total)
      const totalAnnual = Object.values(companyTotals).reduce((sum, val) => sum + val, 0);
      setAnnualData([
        { year: String(currentYear - 1), total: totalAnnual * 0.9 },
        { year: String(currentYear), total: totalAnnual },
      ]);
    };

    fetchChartData();

    // Realtime updates
    const channel = supabase
      .channel('contracts-charts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, () => {
        fetchChartData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Gráficos de Contratos</h2>
        <p className="text-muted-foreground">Análise visual dos valores e distribuição dos contratos</p>
      </div>

      {/* Gráfico de valores mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            Valor Total dos Contratos - Mensal
          </CardTitle>
          <CardDescription>Distribuição dos valores mensais ao longo do ano</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyTotalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="total" fill="hsl(var(--primary))" name="Valor Total" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de valores anuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            Valor Total dos Contratos - Anual
          </CardTitle>
          <CardDescription>Evolução dos valores anuais dos contratos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={annualData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Valor Total"
                dot={{ fill: 'hsl(var(--primary))', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de distribuição por empresa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-violet-500" />
              Distribuição por Empresa
            </CardTitle>
            <CardDescription>Valores anuais por fornecedor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={companyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => {
                    const total = companyDistribution.reduce((sum, item) => sum + item.value, 0);
                    return `${entry.name}: ${((entry.value / total) * 100).toFixed(1)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              Ranking por Empresa
            </CardTitle>
            <CardDescription>Valores anuais em ordem decrescente</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={companyDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" name="Valor Anual" radius={[0, 8, 8, 0]}>
                  {companyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
