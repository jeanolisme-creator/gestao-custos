import { useState } from "react";
import { Download, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SchoolData, schoolNames, aggregateBySchool } from "@/utils/mockData";

interface ReportsProps {
  data: SchoolData[];
}

const reportTypes = [
  { value: 'by-school', label: 'Por Nome da Escola' },
  { value: 'by-id', label: 'Por ID Cadastro' },
  { value: 'comparative', label: 'Comparativo entre Escolas' },
  { value: 'temporal', label: 'Evolução Temporal' },
  { value: 'consolidated', label: 'Consolidado Geral' },
];

const months = [
  'todos', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const years = ['2025', '2026', '2027'];

export default function Reports({ data }: ReportsProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedMonth, setSelectedMonth] = useState<string>("todos");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("consolidated");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getReportData = () => {
    let filteredData = data.filter(record => record.ano.toString() === selectedYear);
    
    if (selectedMonth !== 'todos') {
      filteredData = filteredData.filter(record => record.mes === selectedMonth);
    }

    if (reportType === 'by-school' || reportType === 'consolidated') {
      const aggregated = aggregateBySchool(filteredData);
      return aggregated
        .filter(school => 
          selectedSchool === 'all' || school.schoolName === selectedSchool
        )
        .filter(school =>
          searchTerm === '' || school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return filteredData.filter(record =>
      searchTerm === '' || 
      record.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cadastro.includes(searchTerm)
    );
  };

  const reportData = getReportData();

  const exportToCSV = () => {
    // Implementation for CSV export
    console.log('Exporting to CSV...');
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting to PDF...');
  };

  const renderConsolidatedTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Escola</TableHead>
          <TableHead>Cadastros</TableHead>
          <TableHead>Consumo Total (m³)</TableHead>
          <TableHead>Valor Água (R$)</TableHead>
          <TableHead>Valor Serviços (R$)</TableHead>
          <TableHead>Total (R$)</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(reportData as any[]).map((school, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {school.schoolName?.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '') || 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {school.cadastros?.length || 0} cadastros
              </Badge>
            </TableCell>
            <TableCell>{school.totalConsumption?.toFixed(1) || '0.0'}m³</TableCell>
            <TableCell>{formatCurrency((school.totalValue || 0) - (school.totalService || 0))}</TableCell>
            <TableCell>{formatCurrency(school.totalService || 0)}</TableCell>
            <TableCell className="font-semibold">
              {formatCurrency(school.totalValue || 0)}
            </TableCell>
            <TableCell>
              <Badge 
                variant={school.upcomingDues?.length > 0 ? "destructive" : "secondary"}
              >
                {school.upcomingDues?.length > 0 ? "Vencimento próximo" : "Em dia"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDetailedTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cadastro</TableHead>
          <TableHead>Escola</TableHead>
          <TableHead>Endereço</TableHead>
          <TableHead>Mês/Ano</TableHead>
          <TableHead>Consumo (m³)</TableHead>
          <TableHead>Valor (R$)</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Ocorrências</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(reportData as any[]).slice(0, 50).map((record, index) => (
          <TableRow key={index}>
            <TableCell className="font-mono text-sm">{record.cadastro}</TableCell>
            <TableCell className="font-medium">
              {record.unidade?.replace(/^(EMEF|EMEI|EMEIF|COMP|PAR)\s+/, '') || 'N/A'}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {record.endereco || 'N/A'}
            </TableCell>
            <TableCell>{record.referencia}</TableCell>
            <TableCell>{record.consumo?.toFixed(1) || '0.0'}m³</TableCell>
            <TableCell>{formatCurrency((record.valor || 0) + (record.valorServ || 0))}</TableCell>
            <TableCell>{record.vencto}</TableCell>
            <TableCell>
              {record.verificarOcorrencia && (
                <Badge variant="destructive" className="text-xs">
                  {record.verificarOcorrencia}
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Módulo de Relatórios
          </h1>
          <p className="text-muted-foreground">
            Geração e exportação de relatórios detalhados
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gradient-card border-border shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Escola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {schoolNames.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Busca</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar escola ou cadastro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Export Buttons */}
        <div className="flex items-center space-x-4">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Results Summary */}
        <Card className="p-4 bg-gradient-subtle border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {reportType === 'consolidated' || reportType === 'by-school' 
                  ? `${reportData.length} escolas encontradas`
                  : `${reportData.length} registros encontrados`
                }
              </p>
            </div>
            <Badge variant="outline">
              {selectedMonth === 'todos' ? 'Anual' : selectedMonth} - {selectedYear}
            </Badge>
          </div>
        </Card>

        {/* Report Table */}
        <Card className="p-6 bg-gradient-card border-border shadow-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Relatório {reportTypes.find(t => t.value === reportType)?.label}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {reportType === 'consolidated' || reportType === 'by-school' 
              ? renderConsolidatedTable()
              : renderDetailedTable()
            }
          </div>

          {reportData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado encontrado</p>
              <p className="text-sm">Ajuste os filtros para ver os resultados</p>
            </div>
          )}
        </Card>

        {/* Additional Report Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-card border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Relatório de Anomalias</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Identifica consumos fora do padrão
            </p>
            <Button variant="outline" size="sm">
              Gerar Relatório
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-card border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Relatório de Eficiência</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ranking de eficiência no uso da água
            </p>
            <Button variant="outline" size="sm">
              Gerar Relatório
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-card border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-2">Projeção de Gastos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Estimativa para próximos períodos
            </p>
            <Button variant="outline" size="sm">
              Gerar Relatório
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}