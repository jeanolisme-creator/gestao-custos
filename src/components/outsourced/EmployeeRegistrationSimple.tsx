import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useOutsourcedEmployees } from "@/hooks/useOutsourcedEmployees";
import { useSchools } from "@/hooks/useSchools";

interface EmployeeForm {
  company: string;
  work_position: string;
  role: string;
  workload: string;
  monthly_salary: number;
  workplace: string;
  school_id: string | null;
  status: string;
  observations: string;
}

const companies = ["Produserv", "GF", "Eficience", "Assej", "Outro"];
const roles = [
  "Apoio Administrativo",
  "Aux. Apoio Escolar",
  "Porteiro",
  "Aux. de limpeza",
  "Agente de Higienização",
  "Apoio Ed. Especial",
  "Outro"
];
const workloads = ["40h", "44h", "12x36h", "Outro"];
const statuses = ["Ativo", "Inativo", "Férias", "Afastado"];

export function EmployeeRegistrationSimple() {
  const { addEmployee } = useOutsourcedEmployees();
  const { schools, loading: schoolsLoading } = useSchools();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeForm>({
    company: "",
    work_position: "",
    role: "",
    workload: "",
    monthly_salary: 0,
    workplace: "",
    school_id: null,
    status: "Ativo",
    observations: "",
  });

  const handleSubmit = async () => {
    if (!formData.company || !formData.work_position || !formData.role || !formData.workload || !formData.status) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await addEmployee(formData);
      setFormData({
        company: "",
        work_position: "",
        role: "",
        workload: "",
        monthly_salary: 0,
        workplace: "",
        school_id: null,
        status: "Ativo",
        observations: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cadastro de Funcionários Terceirizados</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Funcionário Terceirizado</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => setFormData({ ...formData, company: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Posto de Trabalho *</Label>
                <Input
                  value={formData.work_position}
                  onChange={(e) => setFormData({ ...formData, work_position: e.target.value })}
                  placeholder="Ex: Posto de Portaria 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Carga Horária *</Label>
                <Select
                  value={formData.workload}
                  onValueChange={(value) => setFormData({ ...formData, workload: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a carga horária" />
                  </SelectTrigger>
                  <SelectContent>
                    {workloads.map((workload) => (
                      <SelectItem key={workload} value={workload}>
                        {workload}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Salário Mensal</Label>
                <CurrencyInput
                  value={formData.monthly_salary}
                  onValueChange={(value) => setFormData({ ...formData, monthly_salary: value })}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="space-y-2">
                <Label>Escola</Label>
                <Select
                  value={formData.school_id}
                  onValueChange={(value) => {
                    const school = schools.find(s => s.id === value);
                    setFormData({ 
                      ...formData, 
                      school_id: value,
                      workplace: school?.nome_escola || ""
                    });
                  }}
                  disabled={schoolsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.nome_escola}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Local de Trabalho</Label>
                <Input
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                  placeholder="Nome da escola ou local"
                />
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Cadastrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use o botão "Novo Funcionário" para cadastrar funcionários terceirizados.
            Após o cadastro, você pode visualizar, editar e excluir os registros na aba "Relatórios".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
