import { useState } from 'react';
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

export function EnergyRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [formData, setFormData] = useState({
    cadastro_cliente: '',
    proprietario: '',
    nome_escola: '',
    data_leitura_anterior: '',
    data_leitura_atual: '',
    valor_gasto: '',
    data_vencimento: '',
    endereco: '',
    numero: '',
    bairro: '',
    consumo_kwh: '',
    numero_dias: '',
    tipo_instalacao: '',
    relogio: '',
    demanda_kwh: '',
    utilizado: '',
    mes_ano_referencia: '',
    macroregiao: '',
    ocorrencias_pendencias: ''
  });
  
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');

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
      endereco: school.endereco_completo || '',
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
      cadastro_cliente: '',
      proprietario: '',
      nome_escola: '',
      data_leitura_anterior: '',
      data_leitura_atual: '',
      valor_gasto: '',
      data_vencimento: '',
      endereco: '',
      numero: '',
      bairro: '',
      consumo_kwh: '',
      numero_dias: '',
      tipo_instalacao: '',
      relogio: '',
      demanda_kwh: '',
      utilizado: '',
      mes_ano_referencia: '',
      macroregiao: '',
      ocorrencias_pendencias: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const submitData: any = { 
      user_id: user.id,
      cadastro_cliente: formData.cadastro_cliente,
      proprietario: formData.proprietario,
      nome_escola: formData.nome_escola,
      endereco: formData.endereco,
      numero: formData.numero,
      bairro: formData.bairro,
      tipo_instalacao: formData.tipo_instalacao,
      relogio: formData.relogio,
      utilizado: formData.utilizado,
      mes_ano_referencia: formData.mes_ano_referencia || new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      macroregiao: formData.macroregiao,
      ocorrencias_pendencias: formData.ocorrencias_pendencias
    };
    
    // Convert numeric fields
    if (formData.valor_gasto) submitData.valor_gasto = parseFloat(formData.valor_gasto);
    if (formData.consumo_kwh) submitData.consumo_kwh = parseFloat(formData.consumo_kwh);
    if (formData.demanda_kwh) submitData.demanda_kwh = parseFloat(formData.demanda_kwh);
    if (formData.numero_dias) submitData.numero_dias = parseInt(formData.numero_dias);
    
    // Date fields
    if (formData.data_vencimento) submitData.data_vencimento = formData.data_vencimento;

    const { error } = await supabase
      .from('energy_records')
      .insert([submitData]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar registro",
        description: error.message
      });
    } else {
      toast({
        title: "Registro criado com sucesso!",
        description: "O novo registro de energia foi adicionado."
      });
      resetForm();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Cadastro - Gestão de Energia</CardTitle>
        <CardDescription>Preencha os dados do registro de energia</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School Search */}
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

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cadastro_cliente">Cadastro Cliente *</Label>
              <Input
                id="cadastro_cliente"
                value={formData.cadastro_cliente}
                onChange={(e) => handleInputChange('cadastro_cliente', e.target.value)}
                required
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
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
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
              <Label htmlFor="tipo_instalacao">Tipo de Instalação</Label>
              <Input
                id="tipo_instalacao"
                value={formData.tipo_instalacao}
                onChange={(e) => handleInputChange('tipo_instalacao', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relogio">Medidor</Label>
              <Input
                id="relogio"
                value={formData.relogio}
                onChange={(e) => handleInputChange('relogio', e.target.value)}
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
              <Label htmlFor="consumo_kwh">Consumo (kWh)</Label>
              <Input
                id="consumo_kwh"
                type="number"
                step="0.01"
                value={formData.consumo_kwh}
                onChange={(e) => handleInputChange('consumo_kwh', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demanda_kwh">Demanda (kWh)</Label>
              <Input
                id="demanda_kwh"
                type="number"
                step="0.01"
                value={formData.demanda_kwh}
                onChange={(e) => handleInputChange('demanda_kwh', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utilizado">Utilizado</Label>
              <Input
                id="utilizado"
                value={formData.utilizado}
                onChange={(e) => handleInputChange('utilizado', e.target.value)}
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
                onValueChange={(formatted, numeric) => handleInputChange('valor_gasto', numeric.toString())}
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

            <div className="space-y-2">
              <Label htmlFor="mes_ano_referencia">Mês/Ano Referência</Label>
              <Input
                id="mes_ano_referencia"
                placeholder="Ex: Janeiro 2025"
                value={formData.mes_ano_referencia}
                onChange={(e) => handleInputChange('mes_ano_referencia', e.target.value)}
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Limpar
            </Button>
            <Button type="submit">
              Salvar Registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
