import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileDown, Filter, Search, Users, DollarSign, TrendingUp, Building2, Upload, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useOutsourcedEmployees } from "@/hooks/useOutsourcedEmployees";
import { CurrencyInput } from "@/components/ui/currency-input";

export function OutsourcedReports() {
  const { employees, loading, deleteEmployee, updateEmployee, addEmployee, refetch } = useOutsourcedEmployees();
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterWorkplace, setFilterWorkplace] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customWorkload, setCustomWorkload] = useState("");

  const filteredEmployees = employees.filter(employee => {
    const matchesCompany = !filterCompany || employee.company === filterCompany;
    const matchesRole = !filterRole || employee.role === filterRole;
    const matchesWorkplace = !filterWorkplace || (employee.workplace && employee.workplace.toLowerCase().includes(filterWorkplace.toLowerCase()));
    const matchesSearch = !searchTerm || 
      employee.work_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.workplace && employee.workplace.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCompany && matchesRole && matchesWorkplace && matchesSearch;
  });

  // Agrupar por escola e cargo (independente da empresa) para mostrar quantidade total e salários
  const groupedData = filteredEmployees.reduce((acc, employee) => {
    const key = `${employee.workplace}-${employee.role}`;
    if (!acc[key]) {
      acc[key] = {
        workplace: employee.workplace,
        role: employee.role,
        quantity: 0,
        individualSalaries: [] as number[],
        totalSalary: 0,
        employees: [],
        companies: new Set<string>()
      };
    }
    acc[key].quantity += 1;
    acc[key].individualSalaries.push(employee.monthly_salary);
    acc[key].totalSalary += employee.monthly_salary;
    acc[key].employees.push(employee);
    acc[key].companies.add(employee.company);
    return acc;
  }, {} as Record<string, any>);

  const aggregatedData = Object.values(groupedData).map(group => ({
    ...group,
    companies: Array.from(group.companies).join(', ')
  }));

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

        // Process and log imported data (would need backend implementation)
        toast.success(`${jsonData.length} registro(s) identificado(s) no arquivo!`);
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
      emp.work_position,
      emp.company,
      emp.role,
      emp.workplace || "",
      emp.workload,
      emp.monthly_salary.toString(),
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
      'Posto de Trabalho': emp.work_position,
      'Empresa': emp.company,
      'Cargo': emp.role,
      'Local de Trabalho': emp.workplace || "",
      'Carga Horária': emp.workload,
      'Salário Mensal': emp.monthly_salary,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Terceirizados");
    XLSX.writeFile(workbook, `relatorio_terceirizados_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast.success("Relatório exportado em XLSX com sucesso!");
  };

  const handleEdit = (employee: any) => {
    const groupCount = employees.filter(
      (e) => e.workplace === employee.workplace && e.role === employee.role && e.company === employee.company
    ).length || 1;
    setEditingEmployee({ ...employee, quantity: groupCount });
    setCustomWorkload("");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee) return;
    
    try {
      const desiredQty = Math.max(1, parseInt((editingEmployee.quantity as any)) || 1);

      // Atualiza o registro atual
      await updateEmployee(editingEmployee.id, {
        company: editingEmployee.company,
        work_position: editingEmployee.work_position,
        role: editingEmployee.role,
        workload: editingEmployee.workload,
        monthly_salary: editingEmployee.monthly_salary,
        workplace: editingEmployee.workplace,
        status: editingEmployee.status,
        observations: editingEmployee.observations,
      });

      // Ajusta a quantidade para o grupo (mesma empresa + cargo + escola)
      const group = employees.filter(
        (e) =>
          e.workplace === editingEmployee.workplace &&
          e.role === editingEmployee.role &&
          e.company === editingEmployee.company
      );

      const currentQty = group.length;

      if (desiredQty > currentQty) {
        const toAdd = desiredQty - currentQty;
        for (let i = 0; i < toAdd; i++) {
          await addEmployee({
            company: editingEmployee.company,
            work_position: editingEmployee.work_position,
            role: editingEmployee.role,
            workload: editingEmployee.workload,
            monthly_salary: editingEmployee.monthly_salary,
            workplace: editingEmployee.workplace,
            school_id: editingEmployee.school_id || null,
            status: editingEmployee.status,
            observations: editingEmployee.observations || null,
          } as any);
        }
      } else if (desiredQty < currentQty) {
        const toRemove = currentQty - desiredQty;
        const candidates = group.filter((e) => e.id !== editingEmployee.id).slice(0, toRemove);
        for (const emp of candidates) {
          await deleteEmployee(emp.id);
        }
      }

      await refetch?.();

      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      toast.success("Funcionários atualizados com sucesso!");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      await deleteEmployee(id);
    }
  };

  const clearFilters = () => {
    setFilterCompany("");
    setFilterRole("");
    setFilterWorkplace("");
    setSearchTerm("");
    toast.success("Filtros limpos");
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

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
              {formatCurrency(filteredEmployees.reduce((sum, e) => sum + e.monthly_salary, 0))}
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
              {formatCurrency(filteredEmployees.reduce((sum, e) => sum + e.monthly_salary * 12, 0))}
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
                  <TableHead className="font-bold text-foreground">Local de Trabalho</TableHead>
                  <TableHead className="font-bold text-foreground">Cargo</TableHead>
                  <TableHead className="font-bold text-foreground">Empresas</TableHead>
                  <TableHead className="text-center font-bold text-foreground">Quantidade</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Salários Individuais</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Salário Total</TableHead>
                  <TableHead className="text-center font-bold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum posto de trabalho encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  aggregatedData.map((group, idx) => (
                    <TableRow 
                      key={`${group.workplace}-${group.role}`}
                      className={idx % 2 === 0 ? "bg-blue-50/30 dark:bg-blue-950/20" : "bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/30"}
                    >
                      <TableCell className="font-semibold text-blue-700 dark:text-blue-400">{group.workplace || "-"}</TableCell>
                      <TableCell className="font-medium text-purple-700 dark:text-purple-400">{group.role}</TableCell>
                      <TableCell className="text-sm text-foreground">{group.companies}</TableCell>
                      <TableCell className="text-center font-bold text-orange-600 dark:text-orange-400">{group.quantity}</TableCell>
                      <TableCell className="text-right">
                        {group.quantity > 1 ? (
                          <div className="text-sm space-y-1">
                            {group.individualSalaries.map((salary: number, idx: number) => (
                              <div key={idx} className="text-muted-foreground">
                                {formatCurrency(salary)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {formatCurrency(group.individualSalaries[0])}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(group.totalSalary)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(group.employees[0])}
                            className="h-8 w-8"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(group.employees[0].id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Excluir"
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

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Funcionário Terceirizado</DialogTitle>
          </DialogHeader>
          
          {editingEmployee && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={editingEmployee.company}
                  onChange={(e) => setEditingEmployee({...editingEmployee, company: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Posto de Trabalho</Label>
                <Input
                  value={editingEmployee.work_position}
                  onChange={(e) => setEditingEmployee({...editingEmployee, work_position: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select
                  value={editingEmployee.role}
                  onValueChange={(value) => setEditingEmployee({...editingEmployee, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apoio Administrativo">Apoio Administrativo</SelectItem>
                    <SelectItem value="Aux. Apoio Escolar">Aux. Apoio Escolar</SelectItem>
                    <SelectItem value="Porteiro">Porteiro</SelectItem>
                    <SelectItem value="Aux. de limpeza">Aux. de limpeza</SelectItem>
                    <SelectItem value="Agente de Higienização">Agente de Higienização</SelectItem>
                    <SelectItem value="Apoio Ed. Especial">Apoio Ed. Especial</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingEmployee.quantity || 1}
                  onChange={(e) => setEditingEmployee({...editingEmployee, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Carga Horária</Label>
                <Select
                  value={editingEmployee.workload === "40h" || editingEmployee.workload === "44h" || editingEmployee.workload === "12x36h" ? editingEmployee.workload : "outro"}
                  onValueChange={(value) => {
                    if (value === "outro") {
                      setCustomWorkload(editingEmployee.workload || "");
                      setEditingEmployee({...editingEmployee, workload: ""});
                    } else {
                      setCustomWorkload("");
                      setEditingEmployee({...editingEmployee, workload: value});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40h">40h</SelectItem>
                    <SelectItem value="44h">44h</SelectItem>
                    <SelectItem value="12x36h">12x36h</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(customWorkload !== "" || (editingEmployee.workload !== "40h" && editingEmployee.workload !== "44h" && editingEmployee.workload !== "12x36h")) && (
                <div className="space-y-2">
                  <Label>Carga Horária Personalizada</Label>
                  <Input
                    placeholder="Digite a carga horária"
                    value={customWorkload || editingEmployee.workload || ""}
                    onChange={(e) => {
                      setCustomWorkload(e.target.value);
                      setEditingEmployee({...editingEmployee, workload: e.target.value});
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Local de Trabalho</Label>
                <Input
                  value={editingEmployee.workplace || ""}
                  onChange={(e) => setEditingEmployee({...editingEmployee, workplace: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Salário Mensal</Label>
                <CurrencyInput
                  value={editingEmployee.monthly_salary}
                  onValueChange={(value) => setEditingEmployee({...editingEmployee, monthly_salary: value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingEmployee.status}
                  onValueChange={(value) => setEditingEmployee({...editingEmployee, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Férias">Férias</SelectItem>
                    <SelectItem value="Afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label>Observações</Label>
                <Input
                  value={editingEmployee.observations || ""}
                  onChange={(e) => setEditingEmployee({...editingEmployee, observations: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}