import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileDown, Filter, Calendar as CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Contract {
  id: string;
  number: string;
  company: string;
  cnpj: string;
  empenho: string;
  object: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  annualValue: number;
  status: 'Ativo' | 'Vencido' | 'Próximo ao Vencimento';
}

export function ContractsReports() {
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data de contratos
  const mockContracts: Contract[] = [
    {
      id: "1",
      number: "001/2024",
      company: "Adrimak",
      cnpj: "12.345.678/0001-90",
      empenho: "EMP-2024-001",
      object: "Serviços de manutenção predial",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyValue: 25000,
      annualValue: 300000,
      status: "Ativo"
    },
    {
      id: "2",
      number: "002/2024",
      company: "Empro",
      cnpj: "23.456.789/0001-01",
      empenho: "EMP-2024-002",
      object: "Serviços de limpeza e conservação",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyValue: 18000,
      annualValue: 216000,
      status: "Ativo"
    },
    {
      id: "3",
      number: "003/2024",
      company: "Licenças",
      cnpj: "34.567.890/0001-12",
      empenho: "EMP-2024-003",
      object: "Licenças de software",
      startDate: "2024-01-01",
      endDate: "2025-11-30",
      monthlyValue: 35000,
      annualValue: 420000,
      status: "Próximo ao Vencimento"
    },
    {
      id: "4",
      number: "004/2024",
      company: "Sinal BR",
      cnpj: "45.678.901/0001-23",
      empenho: "EMP-2024-004",
      object: "Serviços de internet",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyValue: 12000,
      annualValue: 144000,
      status: "Ativo"
    },
    {
      id: "5",
      number: "005/2024",
      company: "TIM",
      cnpj: "56.789.012/0001-34",
      empenho: "EMP-2024-005",
      object: "Serviços de telefonia móvel",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      monthlyValue: 22000,
      annualValue: 264000,
      status: "Ativo"
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  // Filtrar contratos
  const filteredContracts = mockContracts.filter(contract => {
    if (filterCompany !== "all" && contract.company !== filterCompany) return false;
    if (filterStatus !== "all" && contract.status !== filterStatus) return false;
    if (searchTerm && !contract.number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !contract.company.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (startDate) {
      const contractStart = new Date(contract.startDate);
      if (contractStart < startDate) return false;
    }
    
    if (endDate) {
      const contractEnd = new Date(contract.endDate);
      if (contractEnd > endDate) return false;
    }
    
    return true;
  });

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ["Número", "Empresa", "CNPJ", "Empenho", "Objeto", "Data Inicial", "Data Final", "Valor Mensal", "Valor Anual", "Status"];
    const csvData = filteredContracts.map(contract => [
      contract.number,
      contract.company,
      contract.cnpj,
      contract.empenho,
      contract.object,
      formatDate(contract.startDate),
      formatDate(contract.endDate),
      contract.monthlyValue,
      contract.annualValue,
      contract.status
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_contratos_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório exportado com sucesso!");
  };

  // Exportar para PDF (simulado)
  const exportToPDF = () => {
    toast.success("Funcionalidade de exportação para PDF será implementada em breve!");
  };

  const clearFilters = () => {
    setFilterCompany("all");
    setFilterStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm("");
    toast.success("Filtros limpos!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "text-green-600 bg-green-50 border-green-200";
      case "Vencido":
        return "text-red-600 bg-red-50 border-red-200";
      case "Próximo ao Vencimento":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Relatórios de Contratos</h2>
        <p className="text-muted-foreground">Filtre e exporte relatórios personalizados dos contratos</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-violet-500" />
            Filtros
          </CardTitle>
          <CardDescription>Configure os filtros para personalizar o relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Número ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Adrimak">Adrimak</SelectItem>
                  <SelectItem value="Empro">Empro</SelectItem>
                  <SelectItem value="Licenças">Licenças</SelectItem>
                  <SelectItem value="Sinal BR">Sinal BR</SelectItem>
                  <SelectItem value="TIM">TIM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período de Vigência</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yy") : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={exportToCSV} className="ml-auto">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de resumo dos contratos encontrados */}
      <div className="flex justify-center">
        <Card className="border-blue-200 bg-blue-50 w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-700">
              Contratos Encontrados
            </CardTitle>
            <div className="mt-4 space-y-2">
              <p className="text-5xl font-bold text-blue-800">
                {filteredContracts.length}
              </p>
              <CardDescription className="text-lg font-semibold text-blue-600">
                Valor Total: {formatCurrency(filteredContracts.reduce((sum, c) => sum + c.annualValue, 0))}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead className="text-right">Valor Mensal</TableHead>
                  <TableHead className="text-right">Valor Anual</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.number}</TableCell>
                      <TableCell>{contract.company}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.cnpj}</TableCell>
                      <TableCell className="max-w-xs truncate">{contract.object}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(contract.monthlyValue)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(contract.annualValue)}
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded-md text-xs font-medium border", getStatusColor(contract.status))}>
                          {contract.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
