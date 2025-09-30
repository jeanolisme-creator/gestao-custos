import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

export function OutsourcedCharts() {
  // Mock data para valor mensal por empresa
  const monthlyData = [
    { month: "Jan", Produserv: 200000, GF: 180000, Eficience: 120000, Assej: 150000 },
    { month: "Fev", Produserv: 205000, GF: 185000, Eficience: 125000, Assej: 155000 },
    { month: "Mar", Produserv: 210000, GF: 190000, Eficience: 130000, Assej: 160000 },
    { month: "Abr", Produserv: 200000, GF: 180000, Eficience: 120000, Assej: 150000 },
    { month: "Mai", Produserv: 215000, GF: 195000, Eficience: 135000, Assej: 165000 },
    { month: "Jun", Produserv: 220000, GF: 200000, Eficience: 140000, Assej: 170000 },
  ];

  // Mock data para valor anual por empresa
  const annualData = [
    { year: "2021", Produserv: 2200000, GF: 2000000, Eficience: 1300000, Assej: 1600000 },
    { year: "2022", Produserv: 2300000, GF: 2100000, Eficience: 1400000, Assej: 1700000 },
    { year: "2023", Produserv: 2400000, GF: 2160000, Eficience: 1440000, Assej: 1800000 },
    { year: "2024", Produserv: 2500000, GF: 2250000, Eficience: 1500000, Assej: 1900000 },
  ];

  // Mock data para distribuição de funcionários por empresa
  const employeeDistribution = [
    { name: "Produserv", value: 85, color: "#22c55e" },
    { name: "GF", value: 72, color: "#eab308" },
    { name: "Eficience", value: 48, color: "#a855f7" },
    { name: "Assej", value: 60, color: "#3b82f6" },
  ];

  const chartConfig = {
    Produserv: {
      label: "Produserv",
      color: "hsl(var(--chart-1))",
    },
    GF: {
      label: "GF",
      color: "hsl(var(--chart-2))",
    },
    Eficience: {
      label: "Eficience",
      color: "hsl(var(--chart-3))",
    },
    Assej: {
      label: "Assej",
      color: "hsl(var(--chart-4))",
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Gráficos de valores mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Valor Total por Empresa - Mensal</CardTitle>
          <CardDescription>Evolução mensal dos valores por empresa terceirizada</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="Produserv" fill="#22c55e" />
                <Bar dataKey="GF" fill="#eab308" />
                <Bar dataKey="Eficience" fill="#a855f7" />
                <Bar dataKey="Assej" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de tendência mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência Mensal por Empresa</CardTitle>
          <CardDescription>Linha do tempo dos gastos mensais</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="Produserv" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="GF" stroke="#eab308" strokeWidth={2} />
                <Line type="monotone" dataKey="Eficience" stroke="#a855f7" strokeWidth={2} />
                <Line type="monotone" dataKey="Assej" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráficos de valores anuais */}
      <Card>
        <CardHeader>
          <CardTitle>Valor Total por Empresa - Anual</CardTitle>
          <CardDescription>Comparativo anual dos valores por empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="Produserv" fill="#22c55e" />
                <Bar dataKey="GF" fill="#eab308" />
                <Bar dataKey="Eficience" fill="#a855f7" />
                <Bar dataKey="Assej" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribuição de funcionários por empresa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Funcionários por Empresa</CardTitle>
            <CardDescription>Proporção de funcionários por empresa terceirizada</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {employeeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quantidade de Funcionários</CardTitle>
            <CardDescription>Total de funcionários por empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#06b6d4">
                    {employeeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {employeeDistribution.map((company) => (
          <Card key={company.name} className="border-2" style={{ borderColor: company.color }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.value}</div>
              <p className="text-xs text-muted-foreground mt-1">funcionários terceirizados</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
