import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChartIcon } from "lucide-react";

export function ContractsCharts() {
  // Mock data para gráficos
  const monthlyTotalData = [
    { month: 'Jan', total: 112000 },
    { month: 'Fev', total: 112000 },
    { month: 'Mar', total: 112000 },
    { month: 'Abr', total: 112000 },
    { month: 'Mai', total: 112000 },
    { month: 'Jun', total: 112000 },
    { month: 'Jul', total: 112000 },
    { month: 'Ago', total: 112000 },
    { month: 'Set', total: 112000 },
    { month: 'Out', total: 112000 },
    { month: 'Nov', total: 112000 },
    { month: 'Dez', total: 112000 },
  ];

  const annualData = [
    { year: '2022', total: 1200000 },
    { year: '2023', total: 1280000 },
    { year: '2024', total: 1344000 },
    { year: '2025', total: 1344000 },
  ];

  const companyDistribution = [
    { name: 'Licenças', value: 420000, color: '#eab308' },
    { name: 'Adrimak', value: 300000, color: '#3b82f6' },
    { name: 'TIM', value: 264000, color: '#ef4444' },
    { name: 'Empro', value: 216000, color: '#22c55e' },
    { name: 'Sinal BR', value: 144000, color: '#a855f7' },
  ];

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
                  label={(entry) => `${entry.name}: ${((entry.value / 1344000) * 100).toFixed(1)}%`}
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
