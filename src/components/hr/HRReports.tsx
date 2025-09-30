import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  Filter,
  FileDown
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Employee {
  id: string;
  name: string;
  company: string;
  position: string;
  school: string;
  workload: string;
  monthlySalary: number;
  status: string;
}

export function HRReports() {
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data de funcionários terceirizados
  const mockEmployees: Employee[] = [
    {
      id: "1",
      name: "João Silva Santos",
      company: "Assej",
      position: "Aux. Apoio Escolar",
      school: "EMEF João Silva",
      workload: "40h",
      monthlySalary: 1500,
      status: "Ativo"
    },
    {
      id: "2",
      name: "Maria Oliveira Costa",
      company: "Produserv",
      position: "Porteiro",
      school: "EMEI Maria Santos",
      workload: "44h",
      monthlySalary: 1400,
      status: "Ativo"
    },
    {
      id: "3",
      name: "Carlos Eduardo Lima",
      company: "GF",
      position: "Auxiliar de Limpeza",
      school: "EMEIF Carlos Lima",
      workload: "12x36h",
      monthlySalary: 1400,
      status: "Ativo"
    },
    {
      id: "4",
      name: "Ana Paula Souza",
      company: "Eficience",
      position: "Agente de Higienização",
      school: "EMEF João Silva",
      workload: "40h",
      monthlySalary: 1500,
      status: "Ativo"
    },
    {
      id: "5",
      name: "Pedro Henrique Alves",
      company: "Assej",
      position: "Apoio Ed. Especial",
      school: "EMEI Maria Santos",
      workload: "44h",
      monthlySalary: 1600,
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

  // Filtrar funcionários
  const filteredEmployees = mockEmployees.filter(employee => {
    if (filterCompany !== "all" && employee.company !== filterCompany) return false;
    if (filterPosition !== "all" && employee.position !== filterPosition) return false;
    if (filterStatus !== "all" && employee.status !== filterStatus) return false;
    if (searchTerm && !employee.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !employee.school.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ["Nome", "Empresa", "Cargo", "Escola", "Carga Horária", "Salário Mensal", "Status"];
    const csvData = filteredEmployees.map(employee => [
      employee.name,
      employee.company,
      employee.position,
      employee.school,
      employee.workload,
      employee.monthlySalary,
      employee.status
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_terceirizados_${format(new Date(), "yyyy-MM-dd")}.csv`);
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
    setFilterPosition("all");
    setFilterStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm("");
    toast.success("Filtros limpos!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Relatórios de Funcionários Terceirizados</h2>
        <p className="text-muted-foreground">Filtre e exporte relatórios dos funcionários terceirizados</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-violet-500" />
            Filtro de Relatório
          </CardTitle>
          <CardDescription>Configure os filtros para personalizar o relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Nome ou escola..."
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
                  <SelectItem value="Assej">Assej</SelectItem>
                  <SelectItem value="Produserv">Produserv</SelectItem>
                  <SelectItem value="GF">GF</SelectItem>
                  <SelectItem value="Eficience">Eficience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Aux. Apoio Escolar">Aux. Apoio Escolar</SelectItem>
                  <SelectItem value="Apoio Administrativo">Apoio Administrativo</SelectItem>
                  <SelectItem value="Porteiro">Porteiro</SelectItem>
                  <SelectItem value="Auxiliar de Limpeza">Auxiliar de Limpeza</SelectItem>
                  <SelectItem value="Agente de Higienização">Agente de Higienização</SelectItem>
                  <SelectItem value="Apoio Ed. Especial">Apoio Ed. Especial</SelectItem>
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
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Vago">Vago</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Resumo dos resultados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              Total de Funcionários
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-blue-700">{filteredEmployees.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center justify-center gap-2">
              <DollarSign className="h-4 w-4" />
              Custo Total Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(filteredEmployees.reduce((sum, e) => sum + e.monthlySalary, 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Custo Total Anual
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(filteredEmployees.reduce((sum, e) => sum + e.monthlySalary * 12, 0))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Empresas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-yellow-700">
              {Array.from(new Set(filteredEmployees.map(e => e.company))).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relatório de Funcionários Terceirizados */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Funcionários Terceirizados</CardTitle>
          <CardDescription>
            {filteredEmployees.length} funcionário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-center">Carga Horária</TableHead>
                  <TableHead className="text-right">Salário Mensal</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum funcionário encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.company}</TableCell>
                      <TableCell><Badge variant="outline">{employee.position}</Badge></TableCell>
                      <TableCell className="text-sm">{employee.school}</TableCell>
                      <TableCell className="text-center">{employee.workload}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(employee.monthlySalary)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={employee.status === "Ativo" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
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
