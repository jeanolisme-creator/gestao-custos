import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, X, Building2, Users, AlertTriangle, CheckCircle, Edit, Save, Upload } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSchools } from "@/hooks/useSchools";
import { useOutsourcedEmployees } from "@/hooks/useOutsourcedEmployees";

interface Employee {
  id: string;
  company: string;
  customCompany?: string;
  position: string;
  customPosition?: string;
  quantity: number;
  workload: string;
  customWorkload?: string;
  unitValue: number;
  totalValue: number;
  status: string;
  observations: string;
}

interface SchoolData {
  name: string;
  proprietario: string;
  address: string;
  number: string;
  neighborhood: string;
  macroregiao: string;
  telefone_fixo: string;
  telefone_celular: string;
  tipo_escola: string;
  email: string;
  alunos_creche: number;
  alunos_infantil: number;
  alunos_fundamental_i: number;
  alunos_fundamental_ii: number;
  total_alunos: number;
}

interface PositionQuota {
  position: string;
  total: number;
  occupied: number;
}

interface SchoolQuota {
  schoolName: string;
  positions: PositionQuota[];
}

interface QuotaAlert {
  type: 'excess' | 'vacancy';
  school: string;
  position: string;
  occupied: number;
  total: number;
  available?: number;
}

export function EmployeeRegistration() {
  const { schools, loading } = useSchools();
  const { employees: dbEmployees, addEmployee, updateEmployee, deleteEmployee } = useOutsourcedEmployees();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchSchoolName, setSearchSchoolName] = useState("");
  const [showQuotaSetup, setShowQuotaSetup] = useState(false);
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: "",
    proprietario: "",
    address: "",
    number: "",
    neighborhood: "",
    macroregiao: "",
    telefone_fixo: "",
    telefone_celular: "",
    tipo_escola: "",
    email: "",
    alunos_creche: 0,
    alunos_infantil: 0,
    alunos_fundamental_i: 0,
    alunos_fundamental_ii: 0,
    total_alunos: 0
  });

  const [employees, setEmployees] = useState<Employee[]>([{
    id: '1',
    company: "",
    position: "",
    quantity: 0,
    workload: "",
    unitValue: 0,
    totalValue: 0,
    status: "",
    observations: ""
  }]);

  const [schoolQuotas, setSchoolQuotas] = useState<SchoolQuota[]>([]);
  const [quotaAlerts, setQuotaAlerts] = useState<QuotaAlert[]>([]);
  
  // Quadro de vagas padrão
  const [currentQuota, setCurrentQuota] = useState<PositionQuota[]>([
    { position: "Apoio Administrativo", total: 0, occupied: 0 },
    { position: "Aux. Apoio Escolar", total: 0, occupied: 0 },
    { position: "Porteiro", total: 0, occupied: 0 },
    { position: "Aux. de limpeza", total: 0, occupied: 0 },
    { position: "Agente de Higienização", total: 0, occupied: 0 },
    { position: "Apoio Ed. Especial", total: 0, occupied: 0 },
    { position: "Outro", total: 0, occupied: 0 },
  ]);

  // Verificar se escola já tem funcionários cadastrados no banco de dados
  useEffect(() => {
    if (schoolData.name && dbEmployees) {
      // Verificar se já existem funcionários cadastrados para essa escola no banco
      const schoolEmployees = dbEmployees.filter(emp => emp.workplace === schoolData.name);
      
      // Verificar também no estado local (schoolQuotas)
      const existingQuota = schoolQuotas.find(q => q.schoolName === schoolData.name);
      
      if (schoolEmployees.length > 0 || existingQuota) {
        // Escola já tem funcionários - não mostrar setup, mostrar quadro com dados existentes
        if (existingQuota) {
          setCurrentQuota(existingQuota.positions);
        } else {
          // Calcular quadro baseado nos funcionários cadastrados
          const defaultQuota = [
            { position: "Apoio Administrativo", total: 0, occupied: 0 },
            { position: "Aux. Apoio Escolar", total: 0, occupied: 0 },
            { position: "Porteiro", total: 0, occupied: 0 },
            { position: "Aux. de limpeza", total: 0, occupied: 0 },
            { position: "Agente de Higienização", total: 0, occupied: 0 },
            { position: "Apoio Ed. Especial", total: 0, occupied: 0 },
            { position: "Outro", total: 0, occupied: 0 },
          ];
          
          // Contar quantos funcionários já estão em cada posição
          const quotaWithOccupied = defaultQuota.map(q => {
            const count = schoolEmployees.filter(emp => emp.role === q.position).length;
            return { ...q, occupied: count };
          });
          
          setCurrentQuota(quotaWithOccupied);
        }
        setShowQuotaSetup(false);
      } else {
        // Escola nova - mostrar setup de quadro de vagas
        setShowQuotaSetup(true);
        // Reset para valores padrão
        setCurrentQuota([
          { position: "Apoio Administrativo", total: 0, occupied: 0 },
          { position: "Aux. Apoio Escolar", total: 0, occupied: 0 },
          { position: "Porteiro", total: 0, occupied: 0 },
          { position: "Aux. de limpeza", total: 0, occupied: 0 },
          { position: "Agente de Higienização", total: 0, occupied: 0 },
          { position: "Apoio Ed. Especial", total: 0, occupied: 0 },
          { position: "Outro", total: 0, occupied: 0 },
        ]);
      }
    }
  }, [schoolData.name, schoolQuotas, dbEmployees]);

  const handleSearchSchool = () => {
    if (!searchSchoolName.trim()) {
      toast.error("Digite o nome da escola para buscar");
      return;
    }

    const foundSchool = schools.find(school => 
      school.nome_escola.toLowerCase().includes(searchSchoolName.toLowerCase())
    );

    if (foundSchool) {
      setSchoolData({
        name: foundSchool.nome_escola,
        proprietario: foundSchool.proprietario || "",
        address: foundSchool.endereco_completo || "",
        number: foundSchool.numero || "",
        neighborhood: foundSchool.bairro || "",
        macroregiao: foundSchool.macroregiao || "",
        telefone_fixo: foundSchool.telefone_fixo || "",
        telefone_celular: foundSchool.telefone_celular || "",
        tipo_escola: foundSchool.tipo_escola || "",
        email: foundSchool.email || "",
        alunos_creche: foundSchool.alunos_creche || 0,
        alunos_infantil: foundSchool.alunos_infantil || 0,
        alunos_fundamental_i: foundSchool.alunos_fundamental_i || 0,
        alunos_fundamental_ii: foundSchool.alunos_fundamental_ii || 0,
        total_alunos: foundSchool.total_alunos || 0
      });
      toast.success("Escola encontrada! Dados preenchidos automaticamente.");
    } else {
      toast.info("Escola não encontrada. Preencha os dados manualmente.");
      setSchoolData({
        name: searchSchoolName,
        proprietario: "",
        address: "",
        number: "",
        neighborhood: "",
        macroregiao: "",
        telefone_fixo: "",
        telefone_celular: "",
        tipo_escola: "",
        email: "",
        alunos_creche: 0,
        alunos_infantil: 0,
        alunos_fundamental_i: 0,
        alunos_fundamental_ii: 0,
        total_alunos: 0
      });
    }
  };

  const handleQuotaChange = (position: string, value: number) => {
    setCurrentQuota(currentQuota.map(q => 
      q.position === position ? { ...q, total: value } : q
    ));
  };

  const saveQuotaSetup = () => {
    if (!schoolData.name) {
      toast.error("Selecione uma escola primeiro");
      return;
    }

    const existingIndex = schoolQuotas.findIndex(q => q.schoolName === schoolData.name);
    if (existingIndex >= 0) {
      const updated = [...schoolQuotas];
      updated[existingIndex] = { schoolName: schoolData.name, positions: currentQuota };
      setSchoolQuotas(updated);
    } else {
      setSchoolQuotas([...schoolQuotas, { schoolName: schoolData.name, positions: currentQuota }]);
    }
    
    setShowQuotaSetup(false);
    setIsEditingQuota(false);
    toast.success("Quadro de vagas salvo com sucesso!");
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, {
      id: Date.now().toString(),
      company: "",
      position: "",
      quantity: 0,
      workload: "",
      unitValue: 0,
      totalValue: 0,
      status: "",
      observations: ""
    }]);
  };

  const handleRemoveEmployee = (id: string) => {
    if (employees.length > 1) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleEmployeeChange = (id: string, field: string, value: any) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        const updated = { ...emp, [field]: value };
        
        // Calcular valor total automaticamente
        if (field === 'quantity' || field === 'unitValue') {
          updated.totalValue = updated.quantity * updated.unitValue;
        }
        
        return updated;
      }
      return emp;
    }));
  };

  const handleSave = async () => {
    // Validação básica
    if (!schoolData.name || !schoolData.neighborhood) {
      toast.error("Preencha os campos obrigatórios da escola");
      return;
    }

    const hasInvalidEmployee = employees.some(emp => 
      !emp.company || !emp.position || !emp.workload || !emp.status || emp.quantity === 0
    );

    if (hasInvalidEmployee) {
      toast.error("Preencha todos os campos obrigatórios dos funcionários");
      return;
    }

    // Buscar school_id da escola selecionada
    const selectedSchool = schools.find(s => s.nome_escola === schoolData.name);
    const schoolId = selectedSchool?.id || null;

    // Verificar quadro de vagas
    const newAlerts: QuotaAlert[] = [];
    const updatedQuota = [...currentQuota];

    employees.forEach(emp => {
      const quotaIndex = updatedQuota.findIndex(q => q.position === emp.position);
      if (quotaIndex >= 0) {
        updatedQuota[quotaIndex].occupied += emp.quantity;
        
        // Verificar excesso
        if (updatedQuota[quotaIndex].occupied > updatedQuota[quotaIndex].total) {
          newAlerts.push({
            type: 'excess',
            school: schoolData.name,
            position: emp.position,
            occupied: updatedQuota[quotaIndex].occupied,
            total: updatedQuota[quotaIndex].total
          });
        }
      }
    });

    // Verificar vagas não preenchidas
    updatedQuota.forEach(q => {
      if (q.occupied < q.total) {
        newAlerts.push({
          type: 'vacancy',
          school: schoolData.name,
          position: q.position,
          occupied: q.occupied,
          total: q.total,
          available: q.total - q.occupied
        });
      }
    });

    // Atualizar quadro de vagas da escola
    const schoolQuotaIndex = schoolQuotas.findIndex(sq => sq.schoolName === schoolData.name);
    if (schoolQuotaIndex >= 0) {
      const updated = [...schoolQuotas];
      updated[schoolQuotaIndex].positions = updatedQuota;
      setSchoolQuotas(updated);
    }

    setCurrentQuota(updatedQuota);
    setQuotaAlerts([...quotaAlerts, ...newAlerts]);

    // Mostrar notificações
    if (newAlerts.length > 0) {
      newAlerts.forEach(alert => {
        if (alert.type === 'excess') {
          toast.error(`ATENÇÃO: O cargo de ${alert.position} na Escola ${alert.school} excedeu o limite de vagas. Vagas ocupadas: ${alert.occupied} / Limite: ${alert.total}.`);
        } else {
          toast.info(`INFORMAÇÃO: O cargo de ${alert.position} na Escola ${alert.school} possui ${alert.available} vaga(s) disponível(eis).`);
        }
      });
    }

    // Salvar cada funcionário no banco de dados
    try {
      for (const emp of employees) {
        await addEmployee({
          company: emp.company,
          work_position: `${emp.position} - ${schoolData.name}`,
          role: emp.position,
          workload: emp.workload,
          monthly_salary: emp.totalValue / emp.quantity, // Salário unitário
          workplace: schoolData.name,
          school_id: schoolId,
          status: emp.status,
          observations: emp.observations || null,
        });
      }

      
      // Reset form
      setIsDialogOpen(false);
      setSearchSchoolName("");
      setSchoolData({
        name: "",
        proprietario: "",
        address: "",
        number: "",
        neighborhood: "",
        macroregiao: "",
        telefone_fixo: "",
        telefone_celular: "",
        tipo_escola: "",
        email: "",
        alunos_creche: 0,
        alunos_infantil: 0,
        alunos_fundamental_i: 0,
        alunos_fundamental_ii: 0,
        total_alunos: 0
      });
      setEmployees([{
        id: '1',
        company: "",
        position: "",
        quantity: 0,
        workload: "",
        unitValue: 0,
        totalValue: 0,
        status: "",
        observations: ""
      }]);

      toast.success("Cadastro realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os dados. Tente novamente.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee({...employee});
    setIsEditDialogOpen(true);
  };

  const handleSaveEditEmployee = async () => {
    if (!editingEmployee) return;
    
    try {
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
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      toast.success("Funcionário atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      toast.error("Erro ao atualizar funcionário");
    }
  };

  const handleDeleteEmployee = async (id: string, employeeName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o funcionário ${employeeName}?`)) {
      try {
        await deleteEmployee(id);
        toast.success("Funcionário excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir funcionário:", error);
        toast.error("Erro ao excluir funcionário");
      }
    }
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

        // Process imported data
        const importedRecords = jsonData.map((row, index) => ({
          id: `imported-${Date.now()}-${index}`,
          school: {
            name: row['Nome da Escola'] || row['name'] || '',
            proprietario: row['Proprietário'] || row['proprietario'] || '',
            address: row['Endereço'] || row['address'] || '',
            number: row['Número'] || row['number'] || '',
            neighborhood: row['Bairro'] || row['neighborhood'] || '',
            macroregiao: row['Macrorregião'] || row['macroregiao'] || '',
            telefone_fixo: row['Telefone Fixo'] || row['telefone_fixo'] || '',
            telefone_celular: row['Telefone Celular'] || row['telefone_celular'] || '',
            tipo_escola: row['Tipo de Escola'] || row['tipo_escola'] || '',
            email: row['Email'] || row['email'] || '',
            alunos_creche: parseInt(row['Creche (0-3 anos)'] || row['alunos_creche'] || '0'),
            alunos_infantil: parseInt(row['Infantil/Pré-escola (4-5 anos)'] || row['alunos_infantil'] || '0'),
            alunos_fundamental_i: parseInt(row['Ensino Fundamental I (6-10 anos)'] || row['alunos_fundamental_i'] || '0'),
            alunos_fundamental_ii: parseInt(row['Ensino Fundamental II (11-14 anos)'] || row['alunos_fundamental_ii'] || '0'),
            total_alunos: parseInt(row['Total de Alunos'] || row['total_alunos'] || '0'),
          },
          employees: []
        }));

        toast.success(`${importedRecords.length} registro(s) importado(s) com sucesso!`);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      toast.error('Erro ao importar arquivo');
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header com botões de importação */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cadastro de Funcionários Terceirizados</h2>
        <div className="flex gap-2">
          <input
            type="file"
            id="import-csv"
            accept=".csv"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          <Button 
            onClick={() => document.getElementById('import-csv')?.click()} 
            variant="outline" 
            size="sm"
          >
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
          <Button 
            onClick={() => document.getElementById('import-xlsx')?.click()} 
            variant="outline" 
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar XLSX
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Funcionário
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastro de Funcionário</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configuração do Quadro de Vagas */}
            {showQuotaSetup && schoolData.name && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-5 w-5" />
                    Configuração Inicial do Quadro de Vagas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-amber-700">
                    Este é o primeiro cadastro de funcionário para a escola <strong>{schoolData.name}</strong>. 
                    Configure o quadro de vagas para cada cargo:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentQuota.map((quota) => (
                      <div key={quota.position} className="space-y-2">
                        <Label className="text-sm">{quota.position}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={quota.total}
                          onChange={(e) => handleQuotaChange(quota.position, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button onClick={saveQuotaSetup} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Quadro de Vagas
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quadro de Vagas Atual */}
            {!showQuotaSetup && schoolData.name && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <CheckCircle className="h-5 w-5" />
                      Quadro de Vagas da Escola {schoolData.name}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingQuota(!isEditingQuota)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditingQuota ? "Cancelar" : "Editar"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingQuota ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentQuota.map((quota) => (
                          <div key={quota.position} className="space-y-2">
                            <Label className="text-sm">{quota.position}</Label>
                            <Input
                              type="number"
                              min="0"
                              value={quota.total}
                              onChange={(e) => handleQuotaChange(quota.position, parseInt(e.target.value) || 0)}
                            />
                          </div>
                        ))}
                      </div>
                      <Button onClick={saveQuotaSetup} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cargo</TableHead>
                            <TableHead className="text-center">Total Vagas</TableHead>
                            <TableHead className="text-center">Ocupadas</TableHead>
                            <TableHead className="text-center">Disponíveis</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentQuota.map((quota) => {
                            const available = quota.total - quota.occupied;
                            const isExcess = quota.occupied > quota.total;
                            return (
                              <TableRow key={quota.position}>
                                <TableCell className="font-medium">{quota.position}</TableCell>
                                <TableCell className="text-center">{quota.total}</TableCell>
                                <TableCell className="text-center">{quota.occupied}</TableCell>
                                <TableCell className="text-center">
                                  <span className={isExcess ? "text-red-600 font-bold" : ""}>
                                    {available}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {isExcess ? (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Excedido
                                    </Badge>
                                  ) : available === 0 ? (
                                    <Badge className="text-xs bg-green-600">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completo
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      {available} vaga{available > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Buscar Escola */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="searchSchool">Buscar Escola</Label>
                  <Input
                    id="searchSchool"
                    placeholder="Digite o nome da escola"
                    value={searchSchoolName}
                    onChange={(e) => setSearchSchoolName(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearchSchool} className="mt-auto">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Dados da Escola */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolName">Nome da Escola *</Label>
                  <Input
                    id="schoolName"
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                    placeholder="Nome da escola"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolProprietario">Proprietário</Label>
                  <Input
                    id="schoolProprietario"
                    value={schoolData.proprietario}
                    onChange={(e) => setSchoolData({...schoolData, proprietario: e.target.value})}
                    placeholder="Proprietário"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolAddress">Endereço</Label>
                  <Input
                    id="schoolAddress"
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                    placeholder="Rua, Avenida..."
                  />
                </div>
                <div>
                  <Label htmlFor="schoolNumber">Número</Label>
                  <Input
                    id="schoolNumber"
                    value={schoolData.number}
                    onChange={(e) => setSchoolData({...schoolData, number: e.target.value})}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolNeighborhood">Bairro *</Label>
                  <Input
                    id="schoolNeighborhood"
                    value={schoolData.neighborhood}
                    onChange={(e) => setSchoolData({...schoolData, neighborhood: e.target.value})}
                    placeholder="Centro, Jardim..."
                  />
                </div>
                <div>
                  <Label htmlFor="schoolMacroregiao">Macrorregião</Label>
                  <Select
                    value={schoolData.macroregiao}
                    onValueChange={(value) => setSchoolData({...schoolData, macroregiao: value})}
                  >
                    <SelectTrigger id="schoolMacroregiao">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HB">HB</SelectItem>
                      <SelectItem value="Vila Toninho">Vila Toninho</SelectItem>
                      <SelectItem value="Schmidt">Schmidt</SelectItem>
                      <SelectItem value="Represa">Represa</SelectItem>
                      <SelectItem value="Bosque">Bosque</SelectItem>
                      <SelectItem value="Talhado">Talhado</SelectItem>
                      <SelectItem value="Central">Central</SelectItem>
                      <SelectItem value="Cidade da Criança">Cidade da Criança</SelectItem>
                      <SelectItem value="Pinheirinho">Pinheirinho</SelectItem>
                      <SelectItem value="Ceu">Ceu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schoolTelefoneFixo">Telefone Fixo</Label>
                  <Input
                    id="schoolTelefoneFixo"
                    value={schoolData.telefone_fixo}
                    onChange={(e) => setSchoolData({...schoolData, telefone_fixo: e.target.value})}
                    placeholder="(17) 3333-4444"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolTelefoneCelular">Telefone Celular</Label>
                  <Input
                    id="schoolTelefoneCelular"
                    value={schoolData.telefone_celular}
                    onChange={(e) => setSchoolData({...schoolData, telefone_celular: e.target.value})}
                    placeholder="(17) 99999-8888"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolTipoEscola">Tipo de Escola</Label>
                  <Select
                    value={schoolData.tipo_escola}
                    onValueChange={(value) => setSchoolData({...schoolData, tipo_escola: value})}
                  >
                    <SelectTrigger id="schoolTipoEscola">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMEI">EMEI</SelectItem>
                      <SelectItem value="EMEF">EMEF</SelectItem>
                      <SelectItem value="EMEIF">EMEIF</SelectItem>
                      <SelectItem value="PAR">PAR</SelectItem>
                      <SelectItem value="COMP">COMP</SelectItem>
                      <SelectItem value="SEDE">SEDE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={schoolData.email}
                    onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                    placeholder="escola@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolCreche">Creche (0-3 anos)</Label>
                  <Input
                    id="schoolCreche"
                    type="number"
                    min="0"
                    value={schoolData.alunos_creche}
                    onChange={(e) => setSchoolData({...schoolData, alunos_creche: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolInfantil">Infantil/Pré-escola (4-5 anos)</Label>
                  <Input
                    id="schoolInfantil"
                    type="number"
                    min="0"
                    value={schoolData.alunos_infantil}
                    onChange={(e) => setSchoolData({...schoolData, alunos_infantil: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolFundamentalI">Ensino Fundamental I (6-10 anos)</Label>
                  <Input
                    id="schoolFundamentalI"
                    type="number"
                    min="0"
                    value={schoolData.alunos_fundamental_i}
                    onChange={(e) => setSchoolData({...schoolData, alunos_fundamental_i: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolFundamentalII">Ensino Fundamental II (11-14 anos)</Label>
                  <Input
                    id="schoolFundamentalII"
                    type="number"
                    min="0"
                    value={schoolData.alunos_fundamental_ii}
                    onChange={(e) => setSchoolData({...schoolData, alunos_fundamental_ii: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolTotalAlunos">Total de Alunos</Label>
                  <Input
                    id="schoolTotalAlunos"
                    type="number"
                    value={schoolData.alunos_creche + schoolData.alunos_infantil + schoolData.alunos_fundamental_i + schoolData.alunos_fundamental_ii}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Funcionários Terceirizados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Funcionários Terceirizados</h3>
                <Button onClick={handleAddEmployee} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Funcionário
                </Button>
              </div>

              {employees.map((employee, index) => (
                <Card key={employee.id} className="relative">
                  <CardContent className="pt-6 space-y-4">
                    {employees.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveEmployee(employee.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Empresa *</Label>
                        <Select
                          value={employee.company}
                          onValueChange={(value) => handleEmployeeChange(employee.id, 'company', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Assej">Assej</SelectItem>
                            <SelectItem value="Produserv">Produserv</SelectItem>
                            <SelectItem value="GF">GF</SelectItem>
                            <SelectItem value="Eficience">Eficience</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {employee.company === "outro" && (
                          <Input
                            className="mt-2"
                            placeholder="Digite a empresa"
                            value={employee.customCompany || ""}
                            onChange={(e) => handleEmployeeChange(employee.id, 'customCompany', e.target.value)}
                          />
                        )}
                      </div>

                      <div>
                        <Label>Cargo *</Label>
                        <Select
                          value={employee.position}
                          onValueChange={(value) => handleEmployeeChange(employee.id, 'position', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aux. Apoio Escolar">Aux. Apoio Escolar</SelectItem>
                            <SelectItem value="Apoio Administrativo">Apoio Administrativo</SelectItem>
                            <SelectItem value="Porteiro">Porteiro</SelectItem>
                            <SelectItem value="Aux. de limpeza">Aux. de limpeza</SelectItem>
                            <SelectItem value="Agente de Higienização">Agente de Higienização</SelectItem>
                            <SelectItem value="Apoio Ed. Especial">Apoio Ed. Especial</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {employee.position === "Outro" && (
                          <Input
                            className="mt-2"
                            placeholder="Digite o cargo"
                            value={employee.customPosition || ""}
                            onChange={(e) => handleEmployeeChange(employee.id, 'customPosition', e.target.value)}
                          />
                        )}
                      </div>

                      <div>
                        <Label>Quantidade *</Label>
                        <Select
                          value={employee.quantity.toString()}
                          onValueChange={(value) => handleEmployeeChange(employee.id, 'quantity', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="0" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 21}, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Carga Horária *</Label>
                        <Select
                          value={employee.workload}
                          onValueChange={(value) => handleEmployeeChange(employee.id, 'workload', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="40h">40h</SelectItem>
                            <SelectItem value="44h">44h</SelectItem>
                            <SelectItem value="12x36h">12x36h</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        {employee.workload === "outro" && (
                          <Input
                            className="mt-2"
                            placeholder="Digite a carga horária"
                            value={employee.customWorkload || ""}
                            onChange={(e) => handleEmployeeChange(employee.id, 'customWorkload', e.target.value)}
                          />
                        )}
                      </div>

                      <div>
                        <Label>Valor Unitário (R$) *</Label>
                        <CurrencyInput
                          value={employee.unitValue}
                          onValueChange={(formatted, numeric) => {
                            handleEmployeeChange(employee.id, 'unitValue', numeric);
                          }}
                          placeholder="R$ 0,00"
                        />
                      </div>

                      <div>
                        <Label>Valor Total (R$)</Label>
                        <CurrencyInput
                          value={employee.totalValue}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div>
                        <Label>Situação *</Label>
                        <Select
                          value={employee.status}
                          onValueChange={(value) => handleEmployeeChange(employee.id, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Inativo">Inativo</SelectItem>
                            <SelectItem value="Vago">Vago</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3">
                        <Label>Observações</Label>
                        <Textarea
                          value={employee.observations}
                          onChange={(e) => handleEmployeeChange(employee.id, 'observations', e.target.value)}
                          placeholder="Observações adicionais..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Cadastro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Listagem de funcionários cadastrados por escola */}
      {!dbEmployees || dbEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">Nenhum funcionário cadastrado ainda</p>
            <p className="text-sm text-muted-foreground mt-2">Use o botão acima para fazer o primeiro cadastro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from(new Set(dbEmployees.map(e => e.workplace))).map((schoolName) => {
            const schoolEmployees = dbEmployees.filter(e => e.workplace === schoolName);
            return (
            <Card key={schoolName}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {schoolName}
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {schoolEmployees.length} posto(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Lista de funcionários */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">Funcionários Terceirizados</h4>
                    <div className="space-y-2">
                      {schoolEmployees.map((employee) => (
                        <div key={employee.id} className="bg-blue-50/50 dark:bg-blue-950/30 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-purple-700 dark:text-purple-400">{employee.role}</p>
                              <p className="text-sm text-muted-foreground">{employee.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={employee.status === "Ativo" ? "default" : "secondary"}>
                                {employee.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditEmployee(employee)}
                                className="h-8 w-8"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEmployee(employee.id, employee.work_position)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Carga:</span>
                              <span className="ml-1 font-medium">{employee.workload}</span>
                            </div>
                            <div className="text-right col-span-2">
                              <span className="text-muted-foreground">Salário:</span>
                              <span className="ml-1 font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(employee.monthly_salary)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo financeiro */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                      <span className="font-semibold text-sm">Custo Total Mensal</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(schoolEmployees.reduce((sum, e) => sum + e.monthly_salary, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Edição de Funcionário */}
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
                <Label>Carga Horária</Label>
                <Select
                  value={editingEmployee.workload}
                  onValueChange={(value) => setEditingEmployee({...editingEmployee, workload: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40h">40h</SelectItem>
                    <SelectItem value="44h">44h</SelectItem>
                    <SelectItem value="20h">20h</SelectItem>
                    <SelectItem value="30h">30h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
                <Textarea
                  value={editingEmployee.observations || ""}
                  onChange={(e) => setEditingEmployee({...editingEmployee, observations: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditEmployee}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
