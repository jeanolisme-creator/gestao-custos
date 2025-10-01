import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useSchools } from "@/hooks/useSchools";

interface Employee {
  id: string;
  matricula: string;
  nome: string;
  secretaria: string;
  sexo: string;
  rg: string;
  dataNascimento: string;
  idade: number;
  dataAdmissao: string;
  cargaHoraria: number;
  cargaHorariaEfetiva: number;
  vinculo: string;
  localLotacao: string;
  tipoEscola: string;
  cargoEfetivo: string;
  cargoAtual: string;
  salario: number;
  situacao: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    matricula: '2023001',
    nome: 'Maria Silva Santos',
    secretaria: 'Secretaria de Educação',
    sexo: 'Feminino',
    rg: '12.345.678-9',
    dataNascimento: '1985-05-15',
    idade: 38,
    dataAdmissao: '2010-03-01',
    cargaHoraria: 40,
    cargaHorariaEfetiva: 40,
    vinculo: 'Estatutário',
    localLotacao: 'EMEF João Silva',
    tipoEscola: 'EMEF',
    cargoEfetivo: 'Professor',
    cargoAtual: 'Professor',
    salario: 4850,
    situacao: 'Ativo'
  },
  {
    id: '2',
    matricula: '2023002',
    nome: 'João Oliveira Costa',
    secretaria: 'Secretaria de Educação',
    sexo: 'Masculino',
    rg: '98.765.432-1',
    dataNascimento: '1978-10-22',
    idade: 45,
    dataAdmissao: '2005-08-15',
    cargaHoraria: 40,
    cargaHorariaEfetiva: 40,
    vinculo: 'Estatutário',
    localLotacao: 'EMEI Maria Santos',
    tipoEscola: 'EMEI',
    cargoEfetivo: 'Diretor',
    cargoAtual: 'Diretor',
    salario: 8500,
    situacao: 'Ativo'
  }
];

export function EmployeeRegistration() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const { schools, loading: loadingSchools } = useSchools();

  const [formData, setFormData] = useState({
    matricula: '',
    nome: '',
    secretaria: 'Secretaria de Educação',
    sexo: '',
    rg: '',
    dataNascimento: '',
    dataAdmissao: '',
    cargaHoraria: '',
    cargaHorariaEfetiva: '',
    vinculo: '',
    localLotacao: '',
    tipoEscola: '',
    cargoEfetivo: '',
    cargoAtual: '',
    salario: '',
    situacao: 'Ativo'
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.matricula || !formData.nome || !formData.dataNascimento) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    const newEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      matricula: formData.matricula,
      nome: formData.nome,
      secretaria: formData.secretaria,
      sexo: formData.sexo,
      rg: formData.rg,
      dataNascimento: formData.dataNascimento,
      idade: calculateAge(formData.dataNascimento),
      dataAdmissao: formData.dataAdmissao,
      cargaHoraria: parseInt(formData.cargaHoraria) || 0,
      cargaHorariaEfetiva: parseInt(formData.cargaHorariaEfetiva) || 0,
      vinculo: formData.vinculo,
      localLotacao: formData.localLotacao,
      tipoEscola: formData.tipoEscola,
      cargoEfetivo: formData.cargoEfetivo,
      cargoAtual: formData.cargoAtual,
      salario: parseFloat(formData.salario) || 0,
      situacao: formData.situacao
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? newEmployee : emp));
      toast({
        title: "Sucesso",
        description: "Servidor atualizado com sucesso!"
      });
    } else {
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Sucesso",
        description: "Servidor cadastrado com sucesso!"
      });
    }

    resetForm();
    setDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      matricula: '',
      nome: '',
      secretaria: 'Secretaria de Educação',
      sexo: '',
      rg: '',
      dataNascimento: '',
      dataAdmissao: '',
      cargaHoraria: '',
      cargaHorariaEfetiva: '',
      vinculo: '',
      localLotacao: '',
      tipoEscola: '',
      cargoEfetivo: '',
      cargoAtual: '',
      salario: '',
      situacao: 'Ativo'
    });
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      matricula: employee.matricula,
      nome: employee.nome,
      secretaria: employee.secretaria,
      sexo: employee.sexo,
      rg: employee.rg,
      dataNascimento: employee.dataNascimento,
      dataAdmissao: employee.dataAdmissao,
      cargaHoraria: employee.cargaHoraria.toString(),
      cargaHorariaEfetiva: employee.cargaHorariaEfetiva.toString(),
      vinculo: employee.vinculo,
      localLotacao: employee.localLotacao,
      tipoEscola: employee.tipoEscola,
      cargoEfetivo: employee.cargoEfetivo,
      cargoAtual: employee.cargoAtual,
      salario: employee.salario.toString(),
      situacao: employee.situacao
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast({
      title: "Sucesso",
      description: "Servidor removido com sucesso!"
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cadastro de Servidores</h2>
          <p className="text-muted-foreground">Gerencie o cadastro de servidores da secretaria</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Servidor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Editar Servidor' : 'Novo Servidor'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="professional">Dados Profissionais</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula *</Label>
                    <Input
                      id="matricula"
                      value={formData.matricula}
                      onChange={(e) => handleInputChange('matricula', e.target.value)}
                      placeholder="Ex: 2023001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Nome completo do servidor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secretaria">Secretaria</Label>
                    <Select value={formData.secretaria} onValueChange={(value) => handleInputChange('secretaria', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Secretaria de Educação">Secretaria de Educação</SelectItem>
                        <SelectItem value="Sede">Sede</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      placeholder="00.000.000-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idade">Idade</Label>
                    <Input
                      id="idade"
                      type="number"
                      value={formData.dataNascimento ? calculateAge(formData.dataNascimento) : ''}
                      readOnly
                      className="bg-muted"
                      placeholder="Calculado automaticamente"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                    <Input
                      id="dataAdmissao"
                      type="date"
                      value={formData.dataAdmissao}
                      onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargaHoraria">Carga Horária</Label>
                    <Select value={formData.cargaHoraria} onValueChange={(value) => handleInputChange('cargaHoraria', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="120">120 horas</SelectItem>
                        <SelectItem value="160">160 horas</SelectItem>
                        <SelectItem value="175">175 horas</SelectItem>
                        <SelectItem value="200">200 horas</SelectItem>
                        <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.cargaHoraria === 'outro' && (
                      <Input
                        type="number"
                        placeholder="Digite a carga horária"
                        onChange={(e) => handleInputChange('cargaHoraria', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargaHorariaEfetiva">Carga Horária Efetiva</Label>
                    <Select value={formData.cargaHorariaEfetiva} onValueChange={(value) => handleInputChange('cargaHorariaEfetiva', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="120">120 horas</SelectItem>
                        <SelectItem value="160">160 horas</SelectItem>
                        <SelectItem value="175">175 horas</SelectItem>
                        <SelectItem value="200">200 horas</SelectItem>
                        <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.cargaHorariaEfetiva === 'outro' && (
                      <Input
                        type="number"
                        placeholder="Digite a carga horária efetiva"
                        onChange={(e) => handleInputChange('cargaHorariaEfetiva', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vinculo">Vínculo</Label>
                    <Select value={formData.vinculo} onValueChange={(value) => handleInputChange('vinculo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efetivo">Efetivo</SelectItem>
                        <SelectItem value="Temporário">Temporário</SelectItem>
                        <SelectItem value="CLT">CLT</SelectItem>
                        <SelectItem value="Estagiário">Estagiário</SelectItem>
                        <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.vinculo === 'outro' && (
                      <Input
                        placeholder="Digite o vínculo"
                        onChange={(e) => handleInputChange('vinculo', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localLotacao">Local de Lotação</Label>
                    <Select 
                      value={formData.localLotacao} 
                      onValueChange={(value) => handleInputChange('localLotacao', value)}
                      disabled={loadingSchools}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSchools ? "Carregando escolas..." : "Selecione a escola"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SEDE Central">SEDE Central</SelectItem>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.nome_escola}>
                            {school.nome_escola}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoEscola">Tipo de Escola</Label>
                    <Select value={formData.tipoEscola} onValueChange={(value) => handleInputChange('tipoEscola', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMEF">EMEF</SelectItem>
                        <SelectItem value="EMEI">EMEI</SelectItem>
                        <SelectItem value="EMEIF">EMEIF</SelectItem>
                        <SelectItem value="SEDE">SEDE</SelectItem>
                        <SelectItem value="COMP">COMP</SelectItem>
                        <SelectItem value="PAR">PAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargoEfetivo">Cargo Efetivo</Label>
                    <Select value={formData.cargoEfetivo} onValueChange={(value) => handleInputChange('cargoEfetivo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diretor">Diretor</SelectItem>
                        <SelectItem value="Coordenador">Coordenador</SelectItem>
                        <SelectItem value="Agente Administrativo">Agente Administrativo</SelectItem>
                        <SelectItem value="Inspetor de Alunos">Inspetor de Alunos</SelectItem>
                        <SelectItem value="Profissional Readaptado">Profissional Readaptado</SelectItem>
                        <SelectItem value="Merendeira">Merendeira</SelectItem>
                        <SelectItem value="Assistente de Direção">Assistente de Direção</SelectItem>
                        <SelectItem value="Prof. PEB I">Prof. PEB I</SelectItem>
                        <SelectItem value="Prof. PEB II">Prof. PEB II</SelectItem>
                        <SelectItem value="PEB I Temp">PEB I Temp</SelectItem>
                        <SelectItem value="PEB II Temp">PEB II Temp</SelectItem>
                        <SelectItem value="Tec. Contabilidade">Tec. Contabilidade</SelectItem>
                        <SelectItem value="Assessor">Assessor</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Aux. Serv. Gerais">Aux. Serv. Gerais</SelectItem>
                        <SelectItem value="Motorista">Motorista</SelectItem>
                        <SelectItem value="Estagiario">Estagiário</SelectItem>
                        <SelectItem value="Digitador">Digitador</SelectItem>
                        <SelectItem value="Atendente">Atendente</SelectItem>
                        <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.cargoEfetivo === 'outro' && (
                      <Input
                        placeholder="Digite o cargo efetivo"
                        onChange={(e) => handleInputChange('cargoEfetivo', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargoAtual">Cargo Atual</Label>
                    <Select value={formData.cargoAtual} onValueChange={(value) => handleInputChange('cargoAtual', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diretor">Diretor</SelectItem>
                        <SelectItem value="Coordenador">Coordenador</SelectItem>
                        <SelectItem value="Agente Administrativo">Agente Administrativo</SelectItem>
                        <SelectItem value="Inspetor de Alunos">Inspetor de Alunos</SelectItem>
                        <SelectItem value="Profissional Readaptado">Profissional Readaptado</SelectItem>
                        <SelectItem value="Merendeira">Merendeira</SelectItem>
                        <SelectItem value="Assistente de Direção">Assistente de Direção</SelectItem>
                        <SelectItem value="Prof. PEB I">Prof. PEB I</SelectItem>
                        <SelectItem value="Prof. PEB II">Prof. PEB II</SelectItem>
                        <SelectItem value="PEB I Temp">PEB I Temp</SelectItem>
                        <SelectItem value="PEB II Temp">PEB II Temp</SelectItem>
                        <SelectItem value="Tec. Contabilidade">Tec. Contabilidade</SelectItem>
                        <SelectItem value="Assessor">Assessor</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Aux. Serv. Gerais">Aux. Serv. Gerais</SelectItem>
                        <SelectItem value="Motorista">Motorista</SelectItem>
                        <SelectItem value="Estagiario">Estagiário</SelectItem>
                        <SelectItem value="Digitador">Digitador</SelectItem>
                        <SelectItem value="Atendente">Atendente</SelectItem>
                        <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.cargoAtual === 'outro' && (
                      <Input
                        placeholder="Digite o cargo atual"
                        onChange={(e) => handleInputChange('cargoAtual', e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salario">Salário (R$)</Label>
                    <CurrencyInput
                      id="salario"
                      value={formData.salario}
                      onValueChange={(formatted, numeric) => handleInputChange('salario', numeric.toString())}
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="situacao">Situação</Label>
                    <Select value={formData.situacao} onValueChange={(value) => handleInputChange('situacao', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Licença">Licença</SelectItem>
                        <SelectItem value="Aposentado">Aposentado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                {editingEmployee ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servidores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.matricula}</TableCell>
                    <TableCell>{employee.nome}</TableCell>
                    <TableCell>{employee.cargoAtual}</TableCell>
                    <TableCell>{employee.localLotacao}</TableCell>
                    <TableCell>{formatCurrency(employee.salario)}</TableCell>
                    <TableCell>
                      <Badge variant={employee.situacao === 'Ativo' ? 'default' : 'secondary'}>
                        {employee.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}