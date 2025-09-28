import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, Receipt } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

interface PayrollRecord {
  matricula: string;
  nome: string;
  cargo: string;
  escola: string;
  vencimentos: number;
  descontos: number;
  liquido: number;
}

const mockPayrollData: PayrollRecord[] = [
  {
    matricula: '2023001',
    nome: 'Maria Silva Santos',
    cargo: 'Professor',
    escola: 'EMEF João Silva',
    vencimentos: 4850.00,
    descontos: 970.00,
    liquido: 3880.00
  },
  {
    matricula: '2023002',
    nome: 'João Oliveira Costa',
    cargo: 'Diretor',
    escola: 'EMEI Maria Santos',
    vencimentos: 8500.00,
    descontos: 1700.00,
    liquido: 6800.00
  },
  {
    matricula: '2023003',
    nome: 'Ana Paula Lima',
    cargo: 'Coordenador',
    escola: 'EMEIF Pedro Costa',
    vencimentos: 5200.00,
    descontos: 1040.00,
    liquido: 4160.00
  },
  {
    matricula: '2023004',
    nome: 'Carlos Eduardo Silva',
    cargo: 'Agente Administrativo',
    escola: 'COMP Ana Lima',
    vencimentos: 3200.00,
    descontos: 640.00,
    liquido: 2560.00
  },
  {
    matricula: '2023005',
    nome: 'Fernanda Santos',
    cargo: 'Inspetor de Alunos',
    escola: 'PAR Carlos Souza',
    vencimentos: 2800.00,
    descontos: 560.00,
    liquido: 2240.00
  }
];

const schools = [
  'EMEF João Silva',
  'EMEI Maria Santos',
  'EMEIF Pedro Costa',
  'COMP Ana Lima',
  'PAR Carlos Souza'
];

const positions = [
  'Professor',
  'Diretor', 
  'Coordenador',
  'Agente Administrativo',
  'Inspetor de Alunos',
  'Merendeira'
];

const months = [
  { value: '2025-01', label: 'Janeiro 2025' },
  { value: '2025-02', label: 'Fevereiro 2025' },
  { value: '2025-03', label: 'Março 2025' },
  { value: '2025-04', label: 'Abril 2025' },
  { value: '2025-05', label: 'Maio 2025' },
  { value: '2025-06', label: 'Junho 2025' },
  { value: '2025-07', label: 'Julho 2025' },
  { value: '2025-08', label: 'Agosto 2025' },
  { value: '2025-09', label: 'Setembro 2025' },
  { value: '2025-10', label: 'Outubro 2025' },
  { value: '2025-11', label: 'Novembro 2025' },
  { value: '2025-12', label: 'Dezembro 2025' },
];

export function PayrollManagement() {
  const [selectedMonth, setSelectedMonth] = useState('2025-12');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>(mockPayrollData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter data based on selections
  const filteredData = payrollData.filter(record => {
    const schoolMatch = selectedSchool === 'all' || record.escola === selectedSchool;
    const positionMatch = selectedPosition === 'all' || record.cargo === selectedPosition;
    return schoolMatch && positionMatch;
  });

  // Calculate totals
  const totals = filteredData.reduce((acc, record) => {
    acc.vencimentos += record.vencimentos;
    acc.descontos += record.descontos;
    acc.liquido += record.liquido;
    return acc;
  }, { vencimentos: 0, descontos: 0, liquido: 0 });

  const handleGeneratePayroll = () => {
    // Mock function - in real app would trigger payroll generation
    console.log('Generating payroll for:', {
      month: selectedMonth,
      school: selectedSchool,
      position: selectedPosition
    });
  };

  const handleExportExcel = () => {
    // Mock function - in real app would export to Excel
    console.log('Exporting to Excel...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Folha de Pagamento</h2>
          <p className="text-muted-foreground">Gerencie a folha de pagamento dos servidores</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mês de Competência</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Escola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {schools.map(school => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={handleGeneratePayroll} className="flex-1">
                <Receipt className="mr-2 h-4 w-4" />
                Gerar Folha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total de Vencimentos"
          value={formatCurrency(totals.vencimentos)}
          icon={Receipt}
          description="Soma dos vencimentos"
          variant="success"
        />
        <MetricCard
          title="Total de Descontos"
          value={formatCurrency(totals.descontos)}
          icon={Receipt}
          description="Soma dos descontos"
          variant="warning"
        />
        <MetricCard
          title="Líquido a Pagar"
          value={formatCurrency(totals.liquido)}
          icon={Receipt}
          description="Valor líquido total"
          variant="primary"
        />
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Folha Detalhada - {months.find(m => m.value === selectedMonth)?.label}</CardTitle>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-right">Vencimentos</TableHead>
                  <TableHead className="text-right">Descontos</TableHead>
                  <TableHead className="text-right">Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{record.matricula}</TableCell>
                    <TableCell>{record.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.cargo}</Badge>
                    </TableCell>
                    <TableCell>{record.escola.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '')}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(record.vencimentos)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {formatCurrency(record.descontos)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(record.liquido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}