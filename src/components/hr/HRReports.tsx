import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Building2
} from "lucide-react";

interface ReportData {
  folhaPagamento: any[];
  custosPorEscola: any[];
  custosPorAluno: any[];
  servidoresPorCargo: any[];
  evolucaoCustos: any[];
  consolidadoServidores: any[];
}

const reportTypes = [
  { id: 'folha', name: 'Folha de Pagamento', icon: FileText },
  { id: 'custos-escola', name: 'Custos por Escola', icon: Building2 },
  { id: 'custos-aluno', name: 'Custos por Aluno', icon: Users },
  { id: 'servidores-cargo', name: 'Servidores por Cargo', icon: Users },
  { id: 'evolucao-custos', name: 'Evolução de Custos', icon: TrendingUp },
  { id: 'consolidado', name: 'Consolidado de Servidores', icon: DollarSign }
];

const mockReportData: ReportData = {
  folhaPagamento: [
    { matricula: '2023001', nome: 'Maria Silva Santos', cargo: 'Professor', vencimentos: 4850, descontos: 970, liquido: 3880 },
    { matricula: '2023002', nome: 'João Oliveira Costa', cargo: 'Diretor', vencimentos: 8500, descontos: 1700, liquido: 6800 }
  ],
  custosPorEscola: [
    { escola: 'EMEF João Silva', custoTotal: 124800, alunos: 450, servidores: 32 },
    { escola: 'EMEI Maria Santos', custoTotal: 58500, alunos: 180, servidores: 15 }
  ],
  custosPorAluno: [
    { escola: 'EMEF João Silva', custoPorAluno: 277.33, categoria: 'Baixo' },
    { escola: 'EMEI Maria Santos', custoPorAluno: 325.00, categoria: 'Médio' }
  ],
  servidoresPorCargo: [
    { cargo: 'Professor', quantidade: 724, percentual: 58.1 },
    { cargo: 'Diretor', quantidade: 122, percentual: 9.8 }
  ],
  evolucaoCustos: [
    { mes: 'Janeiro', custo: 4650000 },
    { mes: 'Fevereiro', custo: 4720000 }
  ],
  consolidadoServidores: [
    { matricula: '2023001', nome: 'Maria Silva Santos', cargo: 'Professor', escola: 'EMEF João Silva', salario: 4850, situacao: 'Ativo' }
  ]
};

export function HRReports() {
  const [selectedReportType, setSelectedReportType] = useState('folha');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [generatedReports, setGeneratedReports] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleGenerateReport = () => {
    const reportId = `${selectedReportType}-${Date.now()}`;
    setGeneratedReports(prev => [...prev, reportId]);
    
    console.log('Generating report:', {
      type: selectedReportType,
      period: selectedPeriod,
      startDate,
      endDate
    });
  };

  const handleExportPDF = (reportType: string) => {
    console.log('Exporting to PDF:', reportType);
  };

  const handleExportExcel = (reportType: string) => {
    console.log('Exporting to Excel:', reportType);
  };

  const renderReportTable = (reportType: string) => {
    const data = mockReportData[reportType as keyof ReportData] || [];
    
    switch (reportType) {
      case 'folha':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Vencimentos</TableHead>
                <TableHead className="text-right">Descontos</TableHead>
                <TableHead className="text-right">Líquido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index) => (
                <TableRow key={index}>
                  <TableCell>{row.matricula}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell><Badge variant="outline">{row.cargo}</Badge></TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(row.vencimentos)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(row.descontos)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.liquido)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'custos-escola':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-center">Nº Alunos</TableHead>
                <TableHead className="text-center">Nº Servidores</TableHead>
                <TableHead className="text-right">Custo/Aluno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.escola}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.custoTotal)}</TableCell>
                  <TableCell className="text-center">{row.alunos}</TableCell>
                  <TableCell className="text-center">{row.servidores}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.custoTotal / row.alunos)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'custos-aluno':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Custo por Aluno</TableHead>
                <TableHead className="text-center">Categoria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.escola}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.custoPorAluno)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={row.categoria === 'Baixo' ? 'default' : row.categoria === 'Médio' ? 'secondary' : 'destructive'}>
                      {row.categoria}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'servidores-cargo':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-center">Percentual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.cargo}</TableCell>
                  <TableCell className="text-center">{row.quantidade}</TableCell>
                  <TableCell className="text-center">{row.percentual}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'evolucao-custos':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-center">Variação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index) => {
                const previousCost = index > 0 ? data[index - 1].custo : row.custo;
                const variation = index > 0 ? ((row.custo - previousCost) / previousCost * 100) : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.mes}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.custo)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={variation > 0 ? 'destructive' : variation < 0 ? 'default' : 'secondary'}>
                        {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );

      case 'consolidado':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Escola</TableHead>
                <TableHead className="text-right">Salário</TableHead>
                <TableHead className="text-center">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, index) => (
                <TableRow key={index}>
                  <TableCell>{row.matricula}</TableCell>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell><Badge variant="outline">{row.cargo}</Badge></TableCell>
                  <TableCell>{row.escola}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.salario)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={row.situacao === 'Ativo' ? 'default' : 'secondary'}>
                      {row.situacao}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return <div className="text-center py-8 text-muted-foreground">Selecione um tipo de relatório</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios de RH</h2>
          <p className="text-muted-foreground">Gere e visualize relatórios detalhados do sistema de RH</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generation Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Gerar Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">Janeiro 2024</SelectItem>
                  <SelectItem value="2024-02">Fevereiro 2024</SelectItem>
                  <SelectItem value="2024-03">Março 2024</SelectItem>
                  <SelectItem value="2024-04">Abril 2024</SelectItem>
                  <SelectItem value="2024-05">Maio 2024</SelectItem>
                  <SelectItem value="2024-06">Junho 2024</SelectItem>
                  <SelectItem value="2024-07">Julho 2024</SelectItem>
                  <SelectItem value="2024-08">Agosto 2024</SelectItem>
                  <SelectItem value="2024-09">Setembro 2024</SelectItem>
                  <SelectItem value="2024-10">Outubro 2024</SelectItem>
                  <SelectItem value="2024-11">Novembro 2024</SelectItem>
                  <SelectItem value="2024-12">Dezembro 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button onClick={handleGenerateReport} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        {/* Report Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {reportTypes.find(r => r.id === selectedReportType)?.name || 'Relatório'}
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportPDF(selectedReportType)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportExcel(selectedReportType)}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {renderReportTable(selectedReportType)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports History */}
      {generatedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedReports.map((reportId, index) => (
                <div key={reportId} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {reportTypes.find(r => reportId.includes(r.id))?.name} - {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}