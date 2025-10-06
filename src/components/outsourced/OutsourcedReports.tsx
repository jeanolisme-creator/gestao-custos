import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Filter, Search, Users, DollarSign, TrendingUp, Building2, Upload, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  workPosition: string;
  company: string;
  role: string;
  workplace: string;
  workload: string;
  monthlySalary: number;
}

export function OutsourcedReports() {
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterWorkplace, setFilterWorkplace] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "1", workPosition: "Posto de Portaria 1", company: "Produserv", role: "Porteiro", workplace: "EMEF João Silva", workload: "40h", monthlySalary: 1500 },
    { id: "2", workPosition: "Posto de Apoio Escolar 1", company: "GF", role: "Aux. Apoio Escolar", workplace: "EMEI Maria Santos", workload: "44h", monthlySalary: 1400 },
    { id: "3", workPosition: "Posto de Portaria 2", company: "Eficience", role: "Porteiro", workplace: "EMEIF Carlos Lima", workload: "12x36h", monthlySalary: 1600 },
    { id: "4", workPosition: "Posto Administrativo 1", company: "Assej", role: "Apoio Administrativo", workplace: "EMEF João Silva", workload: "40h", monthlySalary: 1750 },
    { id: "5", workPosition: "Posto de Higienização 1", company: "Produserv", role: "Agente de Higienização", workplace: "EMEI Maria Santos", workload: "44h", monthlySalary: 1500 },
    { id: "6", workPosition: "Posto Ed. Especial 1", company: "GF", role: "Apoio Ed. Especial", workplace: "EMEIF Carlos Lima", workload: "40h", monthlySalary: 1600 },
    { id: "7", workPosition: "Posto de Limpeza 1", company: "Eficience", role: "Aux. de limpeza", workplace: "EMEF João Silva", workload: "44h", monthlySalary: 1400 },
    { id: "8", workPosition: "Posto de Apoio Escolar 2", company: "Assej", role: "Aux. Apoio Escolar", workplace: "EMEI Maria Santos", workload: "40h", monthlySalary: 1500 },
  ]);

  const filteredEmployees = employees.filter(employee => {
    const matchesCompany = !filterCompany || employee.company === filterCompany;
    const matchesRole = !filterRole || employee.role === filterRole;
    const matchesWorkplace = !filterWorkplace || employee.workplace === filterWorkplace;
    const matchesSearch = !searchTerm || 
      employee.workPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.workplace.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCompany && matchesRole && matchesWorkplace && matchesSearch;
  });

  const companies = Array.from(new Set(employees.map(e => e.company)));
  const roles = Array.from(new Set(employees.map(e => e.role)));
  const workplaces = Array.from(new Set(employees.map(e => e.workplace)));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

        const importedEmployees: Employee[] = jsonData.map((row, index) => ({
          id: `imported-${Date.now()}-${index}`,
          workPosition: row['Posto de Trabalho'] || row['workPosition'] || '',
          company: row['Empresa'] || row['company'] || '',
          role: row['Cargo'] || row['role'] || '',
          workplace: row['Local de Trabalho'] || row['workplace'] || '',
          workload: row['Carga Horária'] || row['workload'] || '',
          monthlySalary: parseFloat(row['Salário Mensal'] || row['monthlySalary'] || '0'),
        }));

        setEmployees([...employees, ...importedEmployees]);
        toast.success(`${importedEmployees.length} posto(s) de trabalho importado(s) com sucesso!`);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      toast.error('Erro ao importar arquivo');
    }
    e.target.value = '';
  };

  const exportToCSV = () => {
    const headers = ["Posto de Trabalho", "Empresa", "Cargo", "Local de Trabalho", "Carga Horária", "Salário Mensal"];
    const rows = filteredEmployees.map(emp => [
      emp.workPosition,
      emp.company,
      emp.role,
      emp.workplace,
      emp.workload,
      emp.monthlySalary.toString(),
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

  const exportToXLSX = () => {
    const data = filteredEmployees.map(emp => ({
      'Posto de Trabalho': emp.workPosition,
      'Empresa': emp.company,
      'Cargo': emp.role,
      'Local de Trabalho': emp.workplace,
      'Carga Horária': emp.workload,
      'Salário Mensal': emp.monthlySalary,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Terceirizados");
    XLSX.writeFile(workbook, `relatorio_terceirizados_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success("Relatório exportado em XLSX com sucesso!");
  };

  const handleEdit = (employee: Employee) => {
    toast.info(`Editar posto: ${employee.workPosition}`);
    // Implementar lógica de edição
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast.success("Posto de trabalho excluído com sucesso!");
  };

  const clearFilters = () => {
    setFilterCompany("");
    setFilterRole("");
    setFilterWorkplace("");
    setSearchTerm("");
    toast.success("Filtros limpos");
  };

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
                  placeholder="Posto, empresa, cargo..."
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
            <input
              type="file"
              id="import-csv"
              accept=".csv"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <Button onClick={() => document.getElementById('import-csv')?.click()} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <input
              type="file"
              id="import-xlsx"
              accept=".xlsx,.xls"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <Button onClick={() => document.getElementById('import-xlsx')?.click()} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar XLSX
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
              Total de Postos
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

      {/* Tabela de resultados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Relatório de Funcionários Terceirizados</CardTitle>
              <CardDescription>
                Exibindo {filteredEmployees.length} de {employees.length} posto(s) de trabalho
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={exportToXLSX} variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar XLSX
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
                  <TableHead className="font-bold text-foreground">Posto de Trabalho</TableHead>
                  <TableHead className="font-bold text-foreground">Empresa</TableHead>
                  <TableHead className="font-bold text-foreground">Cargo</TableHead>
                  <TableHead className="font-bold text-foreground">Local de Trabalho</TableHead>
                  <TableHead className="font-bold text-foreground">Carga Horária</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Salário Mensal</TableHead>
                  <TableHead className="text-center font-bold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum posto de trabalho encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee, idx) => (
                    <TableRow 
                      key={employee.id}
                      className={idx % 2 === 0 ? "bg-blue-50/30 dark:bg-blue-950/20" : "bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"}
                    >
                      <TableCell className="font-semibold text-blue-700 dark:text-blue-400">{employee.workPosition}</TableCell>
                      <TableCell className="text-foreground">{employee.company}</TableCell>
                      <TableCell className="font-medium text-purple-700 dark:text-purple-400">{employee.role}</TableCell>
                      <TableCell className="text-foreground">{employee.workplace}</TableCell>
                      <TableCell className="text-center font-medium">{employee.workload}</TableCell>
                      <TableCell className="text-right font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(employee.monthlySalary)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(employee)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(employee.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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