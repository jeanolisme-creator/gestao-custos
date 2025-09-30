import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Filter, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface Employee {
  id: string;
  name: string;
  company: string;
  role: string;
  workplace: string;
  workload: string;
  value: number;
  admissionDate: string;
}

export function OutsourcedReports() {
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterWorkplace, setFilterWorkplace] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Mock data de funcionários
  const mockEmployees: Employee[] = [
    { id: "1", name: "João Silva", company: "Produserv", role: "Aux. Apoio Escolar", workplace: "EMEF João Silva", workload: "40h", value: 1500, admissionDate: "2023-01-15" },
    { id: "2", name: "Maria Santos", company: "GF", role: "Auxiliar de Limpeza", workplace: "EMEI Maria Santos", workload: "44h", value: 1400, admissionDate: "2023-02-20" },
    { id: "3", name: "Pedro Oliveira", company: "Eficience", role: "Porteiro", workplace: "EMEIF Carlos Lima", workload: "12x36h", value: 1600, admissionDate: "2023-03-10" },
    { id: "4", name: "Ana Costa", company: "Assej", role: "Apoio Administrativo", workplace: "EMEF João Silva", workload: "40h", value: 1750, admissionDate: "2023-04-05" },
    { id: "5", name: "Carlos Ferreira", company: "Produserv", role: "Agente de Higienização", workplace: "EMEI Maria Santos", workload: "44h", value: 1500, admissionDate: "2023-05-12" },
    { id: "6", name: "Juliana Alves", company: "GF", role: "Apoio Ed. Especial", workplace: "EMEIF Carlos Lima", workload: "40h", value: 1600, admissionDate: "2023-06-18" },
    { id: "7", name: "Roberto Lima", company: "Eficience", role: "Auxiliar de Limpeza", workplace: "EMEF João Silva", workload: "44h", value: 1400, admissionDate: "2023-07-22" },
    { id: "8", name: "Fernanda Souza", company: "Assej", role: "Aux. Apoio Escolar", workplace: "EMEI Maria Santos", workload: "40h", value: 1500, admissionDate: "2023-08-30" },
  ];

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesCompany = !filterCompany || employee.company === filterCompany;
    const matchesRole = !filterRole || employee.role === filterRole;
    const matchesWorkplace = !filterWorkplace || employee.workplace === filterWorkplace;
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.workplace.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCompany && matchesRole && matchesWorkplace && matchesSearch;
  });

  const companies = Array.from(new Set(mockEmployees.map(e => e.company)));
  const roles = Array.from(new Set(mockEmployees.map(e => e.role)));
  const workplaces = Array.from(new Set(mockEmployees.map(e => e.workplace)));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Empresa", "Cargo", "Local de Trabalho", "Carga Horária", "Valor", "Data de Admissão"];
    const rows = filteredEmployees.map(emp => [
      emp.name,
      emp.company,
      emp.role,
      emp.workplace,
      emp.workload,
      emp.value.toString(),
      emp.admissionDate
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_terceirizados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório exportado em CSV com sucesso!");
  };

  const exportToPDF = () => {
    toast.info("Exportação para PDF em desenvolvimento");
  };

  const clearFilters = () => {
    setFilterCompany("");
    setFilterRole("");
    setFilterWorkplace("");
    setSearchTerm("");
    toast.success("Filtros limpos");
  };

  const totalValue = filteredEmployees.reduce((sum, emp) => sum + emp.value, 0);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Relatório
          </CardTitle>
          <CardDescription>Personalize os dados exibidos no relatório</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, empresa, cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cargos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Local de Trabalho</Label>
              <Select value={filterWorkplace} onValueChange={setFilterWorkplace}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os locais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {workplaces.map(workplace => (
                    <SelectItem key={workplace} value={workplace}>{workplace}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-cyan-700">Total de Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-800">{filteredEmployees.length}</div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-cyan-700">Valor Total Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-800">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-cyan-700">Valor Total Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-800">{formatCurrency(totalValue * 12)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de resultados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatório de Funcionários Terceirizados</CardTitle>
              <CardDescription>
                Exibindo {filteredEmployees.length} de {mockEmployees.length} funcionário(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Local de Trabalho</TableHead>
                  <TableHead>Carga Horária</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Data Admissão</TableHead>
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
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.workplace}</TableCell>
                      <TableCell>{employee.workload}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(employee.value)}
                      </TableCell>
                      <TableCell>{formatDate(employee.admissionDate)}</TableCell>
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
