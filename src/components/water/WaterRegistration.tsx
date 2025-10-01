import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchools } from '@/hooks/useSchools';
import { Search } from 'lucide-react';

const macroregiaoOptions = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];

interface WaterRegistrationProps {
  onSuccess?: () => void;
  editData?: any;
  viewMode?: boolean;
}

export function WaterRegistration({ onSuccess, editData, viewMode = false }: WaterRegistrationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [formData, setFormData] = useState({
    cadastro: '',
    proprietario: '',
    nome_escola: '',
    data_leitura_anterior: '',
    data_leitura_atual: '',
    valor_gasto: '',
    data_vencimento: '',
    endereco_completo: '',
    numero: '',
    bairro: '',
    consumo_m3: '',
    numero_dias: '',
    hidrometro: '',
    descricao_servicos: '',
    valor_servicos: '',
    macroregiao: '',
    ocorrencias_pendencias: ''
  });
  
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        cadastro: editData.cadastro || '',
        proprietario: editData.proprietario || '',
        nome_escola: editData.nome_escola || '',
        data_leitura_anterior: editData.data_leitura_anterior || '',
        data_leitura_atual: editData.data_leitura_atual || '',
        valor_gasto: editData.valor_gasto?.toString() || '',
        data_vencimento: editData.data_vencimento || '',
        endereco_completo: editData.endereco_completo || '',
        numero: editData.numero || '',
        bairro: editData.bairro || '',
        consumo_m3: editData.consumo_m3?.toString() || '',
        numero_dias: editData.numero_dias?.toString() || '',
        hidrometro: editData.hidrometro || '',
        descricao_servicos: editData.descricao_servicos || '',
        valor_servicos: editData.valor_servicos?.toString() || '',
        macroregiao: editData.macroregiao || '',
        ocorrencias_pendencias: editData.ocorrencias_pendencias || ''
      });
    }
  }, [editData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchoolSelect = (school: any) => {
    setFormData(prev => ({
      ...prev,
      proprietario: school.proprietario || '',
      nome_escola: school.nome_escola,
      endereco_completo: school.endereco_completo || '',
      numero: school.numero || '',
      bairro: school.bairro || '',
      macroregiao: school.macroregiao || ''
    }));
    setShowSchoolSearch(false);
    setSearchSchoolTerm('');
  };

  const filteredSchools = schools.filter(school =>
    school.nome_escola.toLowerCase().includes(searchSchoolTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      cadastro: '',
      proprietario: '',
      nome_escola: '',
      data_leitura_anterior: '',
      data_leitura_atual: '',
      valor_gasto: '',
      data_vencimento: '',
      endereco_completo: '',
      numero: '',
      bairro: '',
      consumo_m3: '',
      numero_dias: '',
      hidrometro: '',
      descricao_servicos: '',
      valor_servicos: '',
      macroregiao: '',
      ocorrencias_pendencias: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const submitData: any = { 
      user_id: user.id,
      cadastro: formData.cadastro,
      proprietario: formData.proprietario,
      nome_escola: formData.nome_escola,
      endereco_completo: formData.endereco_completo,
      numero: formData.numero,
      bairro: formData.bairro,
      hidrometro: formData.hidrometro,
      descricao_servicos: formData.descricao_servicos,
      macroregiao: formData.macroregiao,
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      mes_ano_referencia: formData.data_leitura_atual || new Date().toISOString().slice(0, 7)
    };
    
    // Convert numeric fields
    if (formData.valor_gasto) {
      const numericValue = parseFloat(formData.valor_gasto.replace(/[R$\s.]/g, '').replace(',', '.'));
      submitData.valor_gasto = numericValue;
    }
    if (formData.valor_servicos) {
      const numericValue = parseFloat(formData.valor_servicos.replace(/[R$\s.]/g, '').replace(',', '.'));
      submitData.valor_servicos = numericValue;
    }
    if (formData.consumo_m3) submitData.consumo_m3 = parseFloat(formData.consumo_m3);
    if (formData.numero_dias) submitData.numero_dias = parseInt(formData.numero_dias);
    
    // Date fields
    if (formData.data_vencimento) submitData.data_vencimento = formData.data_vencimento;

    let error;
    if (editData) {
      const result = await supabase
        .from('school_records')
        .update(submitData)
        .eq('id', editData.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('school_records')
        .insert([submitData]);
      error = result.error;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: editData ? "Erro ao atualizar registro" : "Erro ao criar registro",
        description: error.message
      });
    } else {
      toast({
        title: editData ? "Registro atualizado com sucesso!" : "Registro criado com sucesso!",
        description: editData ? "O registro foi atualizado." : "O novo registro de água foi adicionado."
      });
      resetForm();
      onSuccess?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {viewMode ? "Visualizar Registro" : editData ? "Editar Registro" : "Novo Cadastro"} - Gestão de Água
        </CardTitle>
        <CardDescription>
          {viewMode ? "Detalhes do registro de água" : "Preencha os dados do registro de água"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School Search */}
          {!viewMode && !editData && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Buscar Escola Cadastrada</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSchoolSearch(!showSchoolSearch)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            
            {showSchoolSearch && (
              <div className="space-y-2">
                <Input
                  placeholder="Digite o nome da escola..."
                  value={searchSchoolTerm}
                  onChange={(e) => setSearchSchoolTerm(e.target.value)}
                />
                {searchSchoolTerm && (
                  <div className="max-h-32 overflow-y-auto border rounded-md">
                    {filteredSchools.map((school) => (
                      <button
                        key={school.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-muted/80 border-b last:border-b-0"
                        onClick={() => handleSchoolSelect(school)}
                      >
                        <p className="font-medium">{school.nome_escola}</p>
                        <p className="text-sm text-muted-foreground">
                          {school.endereco_completo}
                          {school.numero && `, ${school.numero}`}
                          {school.bairro && ` - ${school.bairro}`}
                        </p>
                      </button>
                    ))}
                    {filteredSchools.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Nenhuma escola encontrada</p>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cadastro">Cadastro *</Label>
              <Input
                id="cadastro"
                value={formData.cadastro}
                onChange={(e) => handleInputChange('cadastro', e.target.value)}
                required
                disabled={viewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proprietario">Proprietário</Label>
              <Input
                id="proprietario"
                value={formData.proprietario}
                onChange={(e) => handleInputChange('proprietario', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nome_escola">Nome da Escola *</Label>
              <Input
                id="nome_escola"
                value={formData.nome_escola}
                onChange={(e) => handleInputChange('nome_escola', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco_completo">Endereço Completo</Label>
              <Input
                id="endereco_completo"
                value={formData.endereco_completo}
                onChange={(e) => handleInputChange('endereco_completo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="macroregiao">Macroregião</Label>
              <Select
                value={formData.macroregiao}
                onValueChange={(value) => handleInputChange('macroregiao', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {macroregiaoOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hidrometro">Hidrômetro</Label>
              <Input
                id="hidrometro"
                value={formData.hidrometro}
                onChange={(e) => handleInputChange('hidrometro', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_leitura_anterior">Data Leitura Anterior</Label>
              <Input
                id="data_leitura_anterior"
                type="date"
                value={formData.data_leitura_anterior}
                onChange={(e) => handleInputChange('data_leitura_anterior', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_leitura_atual">Data Leitura Atual</Label>
              <Input
                id="data_leitura_atual"
                type="date"
                value={formData.data_leitura_atual}
                onChange={(e) => handleInputChange('data_leitura_atual', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consumo_m3">Consumo (m³)</Label>
              <Input
                id="consumo_m3"
                type="number"
                step="0.01"
                value={formData.consumo_m3}
                onChange={(e) => handleInputChange('consumo_m3', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_dias">Nº de Dias</Label>
              <Input
                id="numero_dias"
                type="number"
                value={formData.numero_dias}
                onChange={(e) => handleInputChange('numero_dias', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_gasto">Valor (R$)</Label>
              <CurrencyInput
                id="valor_gasto"
                value={formData.valor_gasto}
                onValueChange={(formatted, numeric) => handleInputChange('valor_gasto', formatted)}
                placeholder="R$ 0,00"
                disabled={viewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_servicos">Valor dos Serviços (R$)</Label>
              <CurrencyInput
                id="valor_servicos"
                value={formData.valor_servicos}
                onValueChange={(formatted, numeric) => handleInputChange('valor_servicos', formatted)}
                placeholder="R$ 0,00"
                disabled={viewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao_servicos">Descrição dos Serviços</Label>
              <Textarea
                id="descricao_servicos"
                value={formData.descricao_servicos}
                onChange={(e) => handleInputChange('descricao_servicos', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ocorrencias_pendencias">Verificar Ocorrência</Label>
              <Textarea
                id="ocorrencias_pendencias"
                value={formData.ocorrencias_pendencias}
                onChange={(e) => handleInputChange('ocorrencias_pendencias', e.target.value)}
              />
            </div>
          </div>

          {!viewMode && (
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpar
              </Button>
              <Button type="submit">
                {editData ? "Atualizar Registro" : "Salvar Registro"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
