import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Save, Calculator, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SchoolData {
  nome_escola: string;
  endereco_completo?: string;
  numero?: string;
  bairro?: string;
  macroregiao?: string;
}

interface FormData {
  nome_escola: string;
  endereco_completo: string;
  numero: string;
  bairro: string;
  macroregiao: string;
  telefone: string;
  email: string;
  alunos_creche: number;
  alunos_infantil: number;
  alunos_fundamental_i: number;
  alunos_fundamental_ii: number;
  alunos_por_turma: number;
}

const MACROREGIOES = [
  'HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 
  'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'
];

export function SchoolRegistration() {
  const [formData, setFormData] = useState<FormData>({
    nome_escola: '',
    endereco_completo: '',
    numero: '',
    bairro: '',
    macroregiao: '',
    telefone: '',
    email: '',
    alunos_creche: 0,
    alunos_infantil: 0,
    alunos_fundamental_i: 0,
    alunos_fundamental_ii: 0,
    alunos_por_turma: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [existingSchools, setExistingSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingSchools();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = existingSchools.filter(school =>
        school.nome_escola.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [searchTerm, existingSchools]);

  const fetchExistingSchools = async () => {
    try {
      setLoading(true);
      
      // Fetch from all existing school tables
      const [waterData, energyData, fixedLineData, mobileData] = await Promise.all([
        supabase.from('school_records').select('nome_escola, endereco_completo').limit(100),
        supabase.from('energy_records').select('nome_escola, endereco, numero, bairro, macroregiao').limit(100),
        supabase.from('fixed_line_records').select('nome_escola, endereco, numero, bairro, macroregiao').limit(100),
        supabase.from('mobile_records').select('nome_escola, endereco, numero, bairro, macroregiao').limit(100)
      ]);

      // Combine and deduplicate schools
      const allSchools: SchoolData[] = [];
      
      // Process water records
      if (waterData.data) {
        waterData.data.forEach(record => {
          if (record.nome_escola && !allSchools.find(s => s.nome_escola === record.nome_escola)) {
            allSchools.push({
              nome_escola: record.nome_escola,
              endereco_completo: record.endereco_completo || undefined,
            });
          }
        });
      }

      // Process energy, fixed line, and mobile records
      [energyData.data, fixedLineData.data, mobileData.data].forEach(data => {
        if (data) {
          data.forEach(record => {
            if (record.nome_escola && !allSchools.find(s => s.nome_escola === record.nome_escola)) {
              allSchools.push({
                nome_escola: record.nome_escola,
                endereco_completo: record.endereco || undefined,
                numero: record.numero || undefined,
                bairro: record.bairro || undefined,
                macroregiao: record.macroregiao || undefined,
              });
            }
          });
        }
      });

      setExistingSchools(allSchools);
    } catch (error: any) {
      console.error('Error fetching existing schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchoolSelect = (school: SchoolData) => {
    setFormData(prev => ({
      ...prev,
      nome_escola: school.nome_escola,
      endereco_completo: school.endereco_completo || '',
      numero: school.numero || '',
      bairro: school.bairro || '',
      macroregiao: school.macroregiao || '',
    }));
    setSearchTerm('');
    setFilteredSchools([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_escola.trim()) {
      toast({
        title: "Nome da escola obrigatório",
        description: "Por favor, preencha o nome da escola.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Usuário não autenticado",
          description: "Faça login para cadastrar escolas.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('school_demand_records')
        .insert([{
          ...formData,
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Escola cadastrada com sucesso!",
        description: `${formData.nome_escola} foi cadastrada no sistema.`,
        variant: "default",
      });

      // Reset form
      setFormData({
        nome_escola: '',
        endereco_completo: '',
        numero: '',
        bairro: '',
        macroregiao: '',
        telefone: '',
        email: '',
        alunos_creche: 0,
        alunos_infantil: 0,
        alunos_fundamental_i: 0,
        alunos_fundamental_ii: 0,
        alunos_por_turma: 0,
      });

    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar escola",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalAlunos = formData.alunos_creche + formData.alunos_infantil + 
                     formData.alunos_fundamental_i + formData.alunos_fundamental_ii;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Cadastro de Escola
              </h1>
              <p className="text-muted-foreground">
                Cadastre uma nova escola ou use dados de escolas já existentes
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* School Search */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-school-demand" />
                Buscar Escola Existente
              </CardTitle>
              <CardDescription>
                Digite o nome de uma escola para carregar dados automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Digite o nome da escola..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
              </div>
              
              {filteredSchools.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {filteredSchools.map((school, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                      onClick={() => handleSchoolSelect(school)}
                    >
                      <div className="font-medium">{school.nome_escola}</div>
                      {school.endereco_completo && (
                        <div className="text-sm text-muted-foreground">
                          {school.endereco_completo}
                          {school.numero && `, ${school.numero}`}
                          {school.bairro && ` - ${school.bairro}`}
                        </div>
                      )}
                      {school.macroregiao && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {school.macroregiao}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* School Information */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-school-demand" />
                Dados Gerais da Escola
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_escola">Nome da Escola *</Label>
                  <Input
                    id="nome_escola"
                    value={formData.nome_escola}
                    onChange={(e) => handleInputChange('nome_escola', e.target.value)}
                    placeholder="Digite o nome da escola"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="escola@exemplo.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco_completo">Endereço Completo</Label>
                  <Input
                    id="endereco_completo"
                    value={formData.endereco_completo}
                    onChange={(e) => handleInputChange('endereco_completo', e.target.value)}
                    placeholder="Rua, Avenida..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    placeholder="Nome do bairro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="macroregiao">Macrorregião</Label>
                <Select
                  value={formData.macroregiao}
                  onValueChange={(value) => handleInputChange('macroregiao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a macrorregião" />
                  </SelectTrigger>
                  <SelectContent>
                    {MACROREGIOES.map((regiao) => (
                      <SelectItem key={regiao} value={regiao}>
                        {regiao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student Numbers */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-school-demand" />
                Número de Alunos por Faixa Etária
              </CardTitle>
              <CardDescription>
                Informe a quantidade de alunos em cada faixa etária
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alunos_creche">
                    Creche: 0 a 3 anos
                  </Label>
                  <Input
                    id="alunos_creche"
                    type="number"
                    min="0"
                    value={formData.alunos_creche}
                    onChange={(e) => handleInputChange('alunos_creche', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alunos_infantil">
                    Infantil/Pré-escola: 4 a 5 anos
                  </Label>
                  <Input
                    id="alunos_infantil"
                    type="number"
                    min="0"
                    value={formData.alunos_infantil}
                    onChange={(e) => handleInputChange('alunos_infantil', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alunos_fundamental_i">
                    Ensino Fundamental I: 6 a 10 anos
                  </Label>
                  <Input
                    id="alunos_fundamental_i"
                    type="number"
                    min="0"
                    value={formData.alunos_fundamental_i}
                    onChange={(e) => handleInputChange('alunos_fundamental_i', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alunos_fundamental_ii">
                    Ensino Fundamental II: 11 a 14 anos
                  </Label>
                  <Input
                    id="alunos_fundamental_ii"
                    type="number"
                    min="0"
                    value={formData.alunos_fundamental_ii}
                    onChange={(e) => handleInputChange('alunos_fundamental_ii', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alunos_por_turma">
                    Número de alunos por turma
                  </Label>
                  <Input
                    id="alunos_por_turma"
                    type="number"
                    min="0"
                    value={formData.alunos_por_turma}
                    onChange={(e) => handleInputChange('alunos_por_turma', parseInt(e.target.value) || 0)}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total de alunos</Label>
                  <div className="text-2xl font-bold text-school-demand p-2">
                    {totalAlunos.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="bg-school-demand text-white hover:bg-school-demand/90"
            >
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cadastrar Escola
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}