import { useState } from "react";
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
  Package,
  Building2,
  TrendingUp,
  BookOpen,
  Monitor,
  Wrench,
  Users,
  Shield,
  Utensils,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock Supplies data
const suppliesData = {
  totalItems: 15847,
  totalMonthlyCost: 285000,
  totalSchools: 45,
  costPerSchool: 6333.33,
  
  categoryDistribution: [
    { name: 'Material Pedagógico', value: 4250, percentage: 26.8, color: '#3b82f6', cost: 85000 },
    { name: 'Mobiliário Geral', value: 3180, percentage: 20.1, color: '#10b981', cost: 72000 },
    { name: 'Tecnologia', value: 2840, percentage: 17.9, color: '#f59e0b', cost: 68000 },
    { name: 'Material de Escritório', value: 2375, percentage: 15.0, color: '#ef4444', cost: 35000 },
    { name: 'Equipamentos Cozinha', value: 1650, percentage: 10.4, color: '#8b5cf6', cost: 15000 },
    { name: 'Materiais de Limpeza', value: 1552, percentage: 9.8, color: '#06b6d4', cost: 10000 },
  ],

  educationLevelData: [
    { level: 'Creche (0-3 anos)', items: 3950, cost: 68000, schools: 12 },
    { level: 'Pré-escola (4-5 anos)', items: 4120, cost: 72000, schools: 15 },
    { level: 'Anos Iniciais (6-10 anos)', items: 4580, cost: 85000, schools: 18 },
    { level: 'Anos Finais (11-14 anos)', items: 3197, cost: 60000, schools: 8 },
  ],

  schoolData: [
    { school: 'EMEF João Silva', items: 485, cost: 8500, level: 'Anos Iniciais' },
    { school: 'EMEI Maria Santos', items: 320, cost: 6200, level: 'Pré-escola' },
    { school: 'EMEIF Pedro Costa', items: 420, cost: 7800, level: 'Todos os Níveis' },
    { school: 'COMP Ana Lima', items: 380, cost: 7200, level: 'Anos Finais' },
    { school: 'PAR Carlos Souza', items: 280, cost: 5800, level: 'Creche' },
  ],

  monthlyEvolution: [
    { month: 'Jul', cost: 265000 },
    { month: 'Ago', cost: 270000 },
    { month: 'Set', cost: 275000 },
    { month: 'Out', cost: 278000 },
    { month: 'Nov', cost: 282000 },
    { month: 'Dez', cost: 285000 },
  ],

  topItems: [
    { item: 'Papel A4', quantity: 15000, cost: 22500 },
    { item: 'Cartuchos de Tinta', quantity: 850, cost: 18700 },
    { item: 'Livros Didáticos', quantity: 2400, cost: 48000 },
    { item: 'Mesas Escolares', quantity: 320, cost: 19200 },
    { item: 'Computadores', quantity: 45, cost: 67500 },
  ]
};

export default function SuppliesDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const costVariation = ((suppliesData.monthlyEvolution[5].cost - suppliesData.monthlyEvolution[4].cost) / suppliesData.monthlyEvolution[4].cost) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard de Gestão de Suprimentos
            </h1>
            <p className="text-muted-foreground">
              Controle completo de materiais e equipamentos da rede municipal de ensino
            </p>
          </div>
        </div>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Custo Total Mensal"
            value={formatCurrency(suppliesData.totalMonthlyCost)}
            icon={DollarSign}
            description="Suprimentos e equipamentos"
            variant="primary"
            trend={{ value: costVariation, isPositive: costVariation > 0 }}
          />
          <MetricCard
            title="Total de Itens"
            value={suppliesData.totalItems.toLocaleString()}
            icon={Package}
            description="Estoque ativo"
            variant="success"
          />
          <MetricCard
            title="Custo Médio por Escola"
            value={formatCurrency(suppliesData.costPerSchool)}
            icon={Building2}
            description="Suprimentos/escola/mês"
            variant="warning"
          />
          <MetricCard
            title="Total de Escolas"
            value={suppliesData.totalSchools.toLocaleString()}
            icon={TrendingUp}
            description="Atendidas pela rede"
            variant="primary"
          />
        </div>

        {/* Category Distribution Mini Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {suppliesData.categoryDistribution.map((item, index) => {
            const icons = [BookOpen, Wrench, Monitor, Package, Utensils, Shield];
            const Icon = icons[index];
            
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                  <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(item.cost)}</p>
              </Card>
            );
          })}
        </div>

        {/* Education Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suppliesData.educationLevelData.map((level, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{level.level}</h4>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {level.items} itens • {level.schools} escolas
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(level.cost)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Distribuição de Custos por Categoria
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={suppliesData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cost"
                  >
                    {suppliesData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Custo']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Cost by School Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Custo por Escola (Top 5)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={suppliesData.schoolData}>
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
                    formatter={(value: number) => [formatCurrency(value), 'Custo']}
                  />
                  <Bar dataKey="cost" fill="#3b82f6" />
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
                <LineChart data={suppliesData.monthlyEvolution}>
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

          {/* Items by Education Level */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Itens por Nível de Ensino
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={suppliesData.educationLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="level" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="items" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Summary Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* School Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Resumo por Escola
            </h3>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Escola</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Nível</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliesData.schoolData.map((school, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {school.school.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {school.items} itens
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(school.cost)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {school.level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Top Items */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Itens de Maior Custo
            </h3>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Custo Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliesData.topItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.item}
                      </TableCell>
                      <TableCell>
                        {item.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}