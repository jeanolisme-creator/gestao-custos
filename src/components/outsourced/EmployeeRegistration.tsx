import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Building2, UserPlus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface SchoolPosition {
  position: string;
  quantity: number;
}

interface School {
  id: string;
  name: string;
  phone: string;
  address: string;
  number: string;
  district: string;
  positions: SchoolPosition[];
}

interface Employee {
  id: string;
  company: string;
  workplace: string;
  positions: string;
  role: string;
  workload: string;
  value: number;
  observations: string;
}

const POSITIONS = [
  "Aux. Apoio Escolar",
  "Apoio Administrativo",
  "Porteiro",
  "Auxiliar de Limpeza",
  "Agente de Higienização",
  "Apoio Ed. Especial",
];

const COMPANIES = ["Produserv", "GF", "Eficience", "Assej"];
const WORKLOADS = ["40h", "44h", "12x36h"];

export function EmployeeRegistration() {
  const [schools, setSchools] = useState<School[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showSchoolDialog, setShowSchoolDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [searchSchool, setSearchSchool] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // School form state
  const [schoolForm, setSchoolForm] = useState({
    name: "",
    phone: "",
    address: "",
    number: "",
    district: "",
  });
  const [schoolPositions, setSchoolPositions] = useState<SchoolPosition[]>([
    { position: "", quantity: 0 }
  ]);

  // Employee form state
  const [employeeForm, setEmployeeForm] = useState({
    company: "",
    customCompany: "",
    workplace: "",
    positions: "",
    customPositions: "",
    role: "",
    customRole: "",
    workload: "",
    customWorkload: "",
    value: "",
    observations: "",
  });

  const handleSearchSchool = (searchTerm: string) => {
    setSearchSchool(searchTerm);
    const found = schools.find(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (found) {
      setSelectedSchool(found);
      setSchoolForm({
        name: found.name,
        phone: found.phone,
        address: found.address,
        number: found.number,
        district: found.district,
      });
      setSchoolPositions(found.positions.length > 0 ? found.positions : [{ position: "", quantity: 0 }]);
    } else {
      setSelectedSchool(null);
      setSchoolForm({
        name: searchTerm,
        phone: "",
        address: "",
        number: "",
        district: "",
      });
      setSchoolPositions([{ position: "", quantity: 0 }]);
    }
  };

  const addSchoolPosition = () => {
    setSchoolPositions([...schoolPositions, { position: "", quantity: 0 }]);
  };

  const removeSchoolPosition = (index: number) => {
    setSchoolPositions(schoolPositions.filter((_, i) => i !== index));
  };

  const updateSchoolPosition = (index: number, field: keyof SchoolPosition, value: string | number) => {
    const updated = [...schoolPositions];
    updated[index] = { ...updated[index], [field]: value };
    setSchoolPositions(updated);
  };

  const handleSaveSchool = () => {
    if (!schoolForm.name) {
      toast.error("Nome da escola é obrigatório");
      return;
    }

    const newSchool: School = {
      id: selectedSchool?.id || Math.random().toString(36).substr(2, 9),
      ...schoolForm,
      positions: schoolPositions.filter(p => p.position && p.quantity > 0),
    };

    if (selectedSchool) {
      setSchools(schools.map(s => s.id === selectedSchool.id ? newSchool : s));
      toast.success("Escola atualizada com sucesso!");
    } else {
      setSchools([...schools, newSchool]);
      toast.success("Escola cadastrada com sucesso!");
    }

    setShowSchoolDialog(false);
    resetSchoolForm();
  };

  const resetSchoolForm = () => {
    setSchoolForm({ name: "", phone: "", address: "", number: "", district: "" });
    setSchoolPositions([{ position: "", quantity: 0 }]);
    setSearchSchool("");
    setSelectedSchool(null);
  };

  const handleSaveEmployee = () => {
    if (!employeeForm.workplace || !employeeForm.value) {
      toast.error("Local de trabalho e valor do posto são obrigatórios");
      return;
    }

    const newEmployee: Employee = {
      id: Math.random().toString(36).substr(2, 9),
      company: employeeForm.company === "Outro" ? employeeForm.customCompany : employeeForm.company,
      workplace: employeeForm.workplace,
      positions: employeeForm.positions === "Outro" ? employeeForm.customPositions : employeeForm.positions,
      role: employeeForm.role === "Outro" ? employeeForm.customRole : employeeForm.role,
      workload: employeeForm.workload === "Outro" ? employeeForm.customWorkload : employeeForm.workload,
      value: parseFloat(employeeForm.value),
      observations: employeeForm.observations,
    };

    setEmployees([...employees, newEmployee]);
    toast.success("Funcionário cadastrado com sucesso!");
    setShowEmployeeDialog(false);
    resetEmployeeForm();
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      company: "",
      customCompany: "",
      workplace: "",
      positions: "",
      customPositions: "",
      role: "",
      customRole: "",
      workload: "",
      customWorkload: "",
      value: "",
      observations: "",
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
    toast.success("Funcionário removido com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Botões de ação */}
      <div className="flex gap-4">
        <Dialog open={showSchoolDialog} onOpenChange={setShowSchoolDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Building2 className="h-4 w-4 mr-2" />
              Cadastrar Escola
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Escola</DialogTitle>
              <DialogDescription>
                Busque uma escola existente ou cadastre uma nova
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Busca de escola */}
              <div className="space-y-2">
                <Label>Buscar Escola</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o nome da escola..."
                    value={searchSchool}
                    onChange={(e) => handleSearchSchool(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Formulário de escola */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nome da Escola *</Label>
                  <Input
                    value={schoolForm.name}
                    onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    value={schoolForm.district}
                    onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Endereço Completo</Label>
                  <Input
                    value={schoolForm.address}
                    onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={schoolForm.number}
                    onChange={(e) => setSchoolForm({ ...schoolForm, number: e.target.value })}
                  />
                </div>
              </div>

              {/* Módulo de funcionários */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Funcionários Terceirizados</Label>
                  <Button onClick={addSchoolPosition} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Cargo
                  </Button>
                </div>

                {schoolPositions.map((pos, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Cargo</Label>
                      <Select
                        value={pos.position}
                        onValueChange={(value) => updateSchoolPosition(index, "position", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {pos.position === "Outro" && (
                      <div className="flex-1 space-y-2">
                        <Label>Especificar Cargo</Label>
                        <Input
                          placeholder="Digite o cargo"
                          value={pos.position}
                          onChange={(e) => updateSchoolPosition(index, "position", e.target.value)}
                        />
                      </div>
                    )}

                    <div className="w-32 space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={pos.quantity}
                        onChange={(e) => updateSchoolPosition(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {schoolPositions.length > 1 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeSchoolPosition(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSchoolDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveSchool} className="bg-cyan-500 hover:bg-cyan-600">
                  Salvar Escola
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário terceirizado
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select
                    value={employeeForm.company}
                    onValueChange={(value) => setEmployeeForm({ ...employeeForm, company: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {employeeForm.company === "Outro" && (
                  <div className="space-y-2">
                    <Label>Especificar Empresa</Label>
                    <Input
                      value={employeeForm.customCompany}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, customCompany: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Local de Trabalho *</Label>
                  <Select
                    value={employeeForm.workplace}
                    onValueChange={(value) => setEmployeeForm({ ...employeeForm, workplace: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a escola" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(s => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Número de Postos de Trabalho</Label>
                  <Select
                    value={employeeForm.positions}
                    onValueChange={(value) => setEmployeeForm({ ...employeeForm, positions: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o posto" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {employeeForm.positions === "Outro" && (
                  <div className="space-y-2">
                    <Label>Especificar Posto</Label>
                    <Input
                      value={employeeForm.customPositions}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, customPositions: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Select
                    value={employeeForm.role}
                    onValueChange={(value) => setEmployeeForm({ ...employeeForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {employeeForm.role === "Outro" && (
                  <div className="space-y-2">
                    <Label>Especificar Cargo</Label>
                    <Input
                      value={employeeForm.customRole}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, customRole: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Carga Horária</Label>
                  <Select
                    value={employeeForm.workload}
                    onValueChange={(value) => setEmployeeForm({ ...employeeForm, workload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a carga horária" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKLOADS.map(w => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {employeeForm.workload === "Outro" && (
                  <div className="space-y-2">
                    <Label>Especificar Carga Horária</Label>
                    <Input
                      value={employeeForm.customWorkload}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, customWorkload: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Valor Posto *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={employeeForm.value}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, value: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={employeeForm.observations}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, observations: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEmployeeDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEmployee} className="bg-cyan-500 hover:bg-cyan-600">
                  Salvar Funcionário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de escolas cadastradas */}
      {schools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Escolas Cadastradas</CardTitle>
            <CardDescription>Total de {schools.length} escola(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schools.map(school => (
                <Card key={school.id} className="border-cyan-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{school.name}</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📞 {school.phone || "Não informado"}</p>
                          <p>📍 {school.address}, {school.number} - {school.district}</p>
                        </div>
                        {school.positions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">Funcionários:</p>
                            <div className="flex flex-wrap gap-2">
                              {school.positions.map((pos, idx) => (
                                <span key={idx} className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                                  {pos.position}: {pos.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de funcionários cadastrados */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funcionários Cadastrados</CardTitle>
            <CardDescription>Total de {employees.length} funcionário(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map(employee => (
                <Card key={employee.id} className="border-cyan-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{employee.company}</h3>
                          <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                            {employee.role}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>🏫 {employee.workplace}</p>
                          <p>💼 {employee.positions}</p>
                          <p>⏰ {employee.workload}</p>
                          <p className="font-semibold text-foreground">
                            💰 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(employee.value)}
                          </p>
                          {employee.observations && (
                            <p className="text-xs italic mt-2">📝 {employee.observations}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteEmployee(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {schools.length === 0 && employees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma escola ou funcionário cadastrado ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Comece cadastrando uma escola ou um funcionário.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
