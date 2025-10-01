import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, X, Building2, Users, AlertTriangle, CheckCircle, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock de escolas cadastradas
const mockSchools = [
  {
    id: '1',
    name: 'EMEF João Silva',
    phone: '(17) 3333-4444',
    address: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro'
  },
  {
    id: '2',
    name: 'EMEI Maria Santos',
    phone: '(17) 3333-5555',
    address: 'Av. Principal',
    number: '200',
    neighborhood: 'Jardim Paulista'
  },
  {
    id: '3',
    name: 'EMEIF Carlos Lima',
    phone: '(17) 3333-6666',
    address: 'Rua da Escola',
    number: '300',
    neighborhood: 'Vila Nova'
  }
];

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
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchSchoolName, setSearchSchoolName] = useState("");
  const [showQuotaSetup, setShowQuotaSetup] = useState(false);
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: "",
    phone: "",
    address: "",
    number: "",
    neighborhood: ""
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

  const [registeredEmployees, setRegisteredEmployees] = useState<any[]>([]);
  const [schoolQuotas, setSchoolQuotas] = useState<SchoolQuota[]>([]);
  const [quotaAlerts, setQuotaAlerts] = useState<QuotaAlert[]>([]);
  
  // Quadro de vagas padrão
  const [currentQuota, setCurrentQuota] = useState<PositionQuota[]>([
    { position: "Apoio Administrativo", total: 1, occupied: 0 },
    { position: "Aux. Apoio Escolar", total: 3, occupied: 0 },
    { position: "Porteiro", total: 2, occupied: 0 },
    { position: "Aux. de limpeza", total: 2, occupied: 0 },
    { position: "Agente de Higienização", total: 2, occupied: 0 },
    { position: "Apoio Ed. Especial", total: 3, occupied: 0 },
    { position: "Outro", total: 1, occupied: 0 },
  ]);

  // Verificar se escola já tem quadro de vagas cadastrado
  useEffect(() => {
    if (schoolData.name) {
      const existingQuota = schoolQuotas.find(q => q.schoolName === schoolData.name);
      if (existingQuota) {
        setCurrentQuota(existingQuota.positions);
        setShowQuotaSetup(false);
      } else {
        // Escola nova - mostrar setup de quadro de vagas
        setShowQuotaSetup(true);
        // Reset para valores padrão
        setCurrentQuota([
          { position: "Apoio Administrativo", total: 1, occupied: 0 },
          { position: "Aux. Apoio Escolar", total: 3, occupied: 0 },
          { position: "Porteiro", total: 2, occupied: 0 },
          { position: "Aux. de limpeza", total: 2, occupied: 0 },
          { position: "Agente de Higienização", total: 2, occupied: 0 },
          { position: "Apoio Ed. Especial", total: 3, occupied: 0 },
          { position: "Outro", total: 1, occupied: 0 },
        ]);
      }
    }
  }, [schoolData.name, schoolQuotas]);

  const handleSearchSchool = () => {
    if (!searchSchoolName.trim()) {
      toast.error("Digite o nome da escola para buscar");
      return;
    }

    const foundSchool = mockSchools.find(school => 
      school.name.toLowerCase().includes(searchSchoolName.toLowerCase())
    );

    if (foundSchool) {
      setSchoolData({
        name: foundSchool.name,
        phone: foundSchool.phone,
        address: foundSchool.address,
        number: foundSchool.number,
        neighborhood: foundSchool.neighborhood
      });
      toast.success("Escola encontrada! Dados preenchidos automaticamente.");
    } else {
      toast.info("Escola não encontrada. Preencha os dados manualmente.");
      setSchoolData({
        name: searchSchoolName,
        phone: "",
        address: "",
        number: "",
        neighborhood: ""
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

  const handleSave = () => {
    // Validação básica
    if (!schoolData.name || !schoolData.phone || !schoolData.neighborhood) {
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

    // Salvar dados
    const newRecord = {
      id: Date.now().toString(),
      school: schoolData,
      employees: employees
    };

    setRegisteredEmployees([...registeredEmployees, newRecord]);
    
    // Reset form
    setIsDialogOpen(false);
    setSearchSchoolName("");
    setSchoolData({
      name: "",
      phone: "",
      address: "",
      number: "",
      neighborhood: ""
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
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
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
                  <Label htmlFor="schoolPhone">Telefone *</Label>
                  <Input
                    id="schoolPhone"
                    value={schoolData.phone}
                    onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                    placeholder="(17) 3333-4444"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolAddress">Endereço Completo</Label>
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
                        <Input
                          inputMode="numeric"
                          pattern="\\d*"
                          value={formatCurrency(employee.unitValue)}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            const numeric = Number(digits) / 100;
                            handleEmployeeChange(employee.id, 'unitValue', isNaN(numeric) ? 0 : numeric);
                          }}
                          placeholder="R$ 0,00"
                        />
                      </div>

                      <div>
                        <Label>Valor Total (R$)</Label>
                        <Input
                          value={formatCurrency(employee.totalValue)}
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

      {/* Lista de Funcionários Cadastrados */}
      {registeredEmployees.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Funcionários Cadastrados</h3>
          {registeredEmployees.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {record.school.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {record.school.address}, {record.school.number} - {record.school.neighborhood}
                </p>
                <p className="text-sm text-muted-foreground">
                  Telefone: {record.school.phone}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {record.employees.map((emp: Employee, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        <div>
                          <p className="font-medium">
                            {emp.company === "outro" ? emp.customCompany : emp.company} - {emp.position === "Outro" ? emp.customPosition : emp.position}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {emp.quantity} | Carga: {emp.workload === "outro" ? emp.customWorkload : emp.workload} | Status: {emp.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(emp.totalValue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(emp.unitValue)}/unidade
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {registeredEmployees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Nenhum funcionário cadastrado ainda. Clique em "Cadastrar Funcionário" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
