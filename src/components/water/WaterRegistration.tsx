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
import { Search, FileText, FileSpreadsheet, Calendar, AlertCircle } from 'lucide-react';
import { MonthlyDataWizard } from '@/components/water/MonthlyDataWizard';
import { PendingSchools } from '@/components/water/PendingSchools';
import { WaterImport } from '@/components/water/WaterImport';

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
    mes_referencia: '',
    cadastros: [''],
    hidrometros: [''],
    consumos_m3: [''],
    numeros_dias: [''],
    valores_cadastros: [''],
    proprietario: '',
    nome_escola: '',
    data_leitura_anterior: '',
    data_leitura_atual: '',
    data_vencimento: '',
    endereco_completo: '',
    numero: '',
    bairro: '',
    consumo_m3: '',
    numero_dias: '',
    descricao_servicos: '',
    valor_servicos: '',
    macroregiao: '',
    ocorrencias_pendencias: ''
  });

  // Calculate total value from all cadastros
  const valorTotal = formData.valores_cadastros.reduce((sum, valor) => {
    const numericValue = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    return sum + numericValue;
  }, 0);
  
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');
  const [monthlyWizardOpen, setMonthlyWizardOpen] = useState(false);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [pendingMonth, setPendingMonth] = useState<string>();
  const [pendingSchoolIndex, setPendingSchoolIndex] = useState<number>();
  const [hasPendingSchools, setHasPendingSchools] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Check for pending schools
  useEffect(() => {
    const checkPending = () => {
      const stored = localStorage.getItem('water_pending_schools');
      if (stored) {
        const pendingData = JSON.parse(stored);
        const hasPending = Object.keys(pendingData).some(month => pendingData[month].length > 0);
        setHasPendingSchools(hasPending);
      } else {
        setHasPendingSchools(false);
      }
    };
    
    checkPending();
    
    // Check periodically while the component is mounted
    const interval = setInterval(checkPending, 1000);
    return () => clearInterval(interval);
  }, [monthlyWizardOpen, pendingDialogOpen]);

  useEffect(() => {
    if (editData) {
      // Parse cadastros if stored as JSON array, otherwise convert to array
      let cadastrosArray = [''];
      try {
        if (editData.cadastro) {
          const parsed = JSON.parse(editData.cadastro);
          cadastrosArray = Array.isArray(parsed) ? parsed : [editData.cadastro];
        }
      } catch {
        cadastrosArray = editData.cadastro ? [editData.cadastro] : [''];
      }

      // Parse valores_cadastros
      let valoresArray = [];
      try {
        if (editData.valores_cadastros) {
          const parsed = JSON.parse(editData.valores_cadastros as string);
          valoresArray = Array.isArray(parsed) ? parsed : [];
        }
      } catch {
        valoresArray = [];
      }

      // Format currency values
      const formatCurrency = (value: number | null) => {
        if (!value) return '';
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
      };

      // Parse hidrometros from JSON if exists
      const hidrometrosArray = editData.hidrometros ? JSON.parse(editData.hidrometros) : [''];
      
      // Parse consumos_m3 and numeros_dias arrays
      const consumosArray = editData.consumos_m3 ? JSON.parse(editData.consumos_m3) : [''];
      const numerosDiasArray = editData.numeros_dias ? JSON.parse(editData.numeros_dias) : [''];
      
      const valoresFormatted = cadastrosArray.map((_, index) => {
        const valor = valoresArray[index];
        return valor ? formatCurrency(valor) : '';
      });

      const valorServicos = editData.valor_servicos ? formatCurrency(editData.valor_servicos) : '';
      
      setFormData({
        mes_referencia: editData.mes_referencia || '',
        cadastros: cadastrosArray,
        hidrometros: hidrometrosArray,
        consumos_m3: consumosArray.map((c: any) => c?.toString() || ''),
        numeros_dias: numerosDiasArray.map((n: any) => n?.toString() || ''),
        valores_cadastros: valoresFormatted,
        proprietario: editData.proprietario || '',
        nome_escola: editData.nome_escola || '',
        data_leitura_anterior: editData.data_leitura_anterior || '',
        data_leitura_atual: editData.data_leitura_atual || '',
        data_vencimento: editData.data_vencimento || '',
        endereco_completo: editData.endereco_completo || '',
        numero: editData.numero || '',
        bairro: editData.bairro || '',
        consumo_m3: editData.consumo_m3?.toString() || '',
        numero_dias: editData.numero_dias?.toString() || '',
        descricao_servicos: editData.descricao_servicos || '',
        valor_servicos: valorServicos,
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
      mes_referencia: '',
      cadastros: [''],
      hidrometros: [''],
      consumos_m3: [''],
      numeros_dias: [''],
      valores_cadastros: [''],
      proprietario: '',
      nome_escola: '',
      data_leitura_anterior: '',
      data_leitura_atual: '',
      data_vencimento: '',
      endereco_completo: '',
      numero: '',
      bairro: '',
      consumo_m3: '',
      numero_dias: '',
      descricao_servicos: '',
      valor_servicos: '',
      macroregiao: '',
      ocorrencias_pendencias: ''
    });
  };

  const handleAddCadastro = () => {
    setFormData(prev => ({
      ...prev,
      cadastros: [...prev.cadastros, ''],
      hidrometros: [...prev.hidrometros, ''],
      consumos_m3: [...prev.consumos_m3, ''],
      numeros_dias: [...prev.numeros_dias, ''],
      valores_cadastros: [...prev.valores_cadastros, '']
    }));
  };

  const handleRemoveCadastro = (index: number) => {
    if (formData.cadastros.length > 1) {
      setFormData(prev => ({
        ...prev,
        cadastros: prev.cadastros.filter((_, i) => i !== index),
        hidrometros: prev.hidrometros.filter((_, i) => i !== index),
        consumos_m3: prev.consumos_m3.filter((_, i) => i !== index),
        numeros_dias: prev.numeros_dias.filter((_, i) => i !== index),
        valores_cadastros: prev.valores_cadastros.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCadastroChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      cadastros: prev.cadastros.map((cad, i) => i === index ? value : cad)
    }));
  };

  const handleValorCadastroChange = (index: number, formatted: string) => {
    setFormData(prev => ({
      ...prev,
      valores_cadastros: prev.valores_cadastros.map((val, i) => i === index ? formatted : val)
    }));
  };

  const handleHidrometroChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      hidrometros: prev.hidrometros.map((hid, i) => i === index ? value : hid)
    }));
  };

  const handleConsumoChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      consumos_m3: prev.consumos_m3.map((c, i) => i === index ? value : c)
    }));
  };

  const handleNumeroDiasChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      numeros_dias: prev.numeros_dias.map((n, i) => i === index ? value : n)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const submitData: any = { 
      user_id: user.id,
      cadastro: JSON.stringify(formData.cadastros.filter(c => c.trim() !== '')),
      hidrometros: JSON.stringify(formData.hidrometros),
      consumos_m3: JSON.stringify(formData.consumos_m3.map(c => parseFloat(c) || 0)),
      numeros_dias: JSON.stringify(formData.numeros_dias.map(n => parseInt(n) || 0)),
      proprietario: formData.proprietario,
      nome_escola: formData.nome_escola,
      endereco_completo: formData.endereco_completo,
      numero: formData.numero,
      bairro: formData.bairro,
      descricao_servicos: formData.descricao_servicos,
      macroregiao: formData.macroregiao,
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      mes_ano_referencia: formData.mes_referencia || new Date().toISOString().slice(0, 7)
    };
    
    // Convert valores_cadastros to numeric array and store as JSON
    const valoresNumeric = formData.valores_cadastros.map(valor => {
      const numericValue = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
      return numericValue || 0;
    });
    submitData.valores_cadastros = JSON.stringify(valoresNumeric);
    
    // Calculate total from valores_cadastros
    submitData.valor_gasto = valoresNumeric.reduce((sum, val) => sum + val, 0);
    
    // Convert valor_servicos
    if (formData.valor_servicos) {
      const numericValue = parseFloat(formData.valor_servicos.replace(/[R$\s.]/g, '').replace(',', '.'));
      submitData.valor_servicos = numericValue;
    }
    if (formData.consumo_m3) submitData.consumo_m3 = parseFloat(formData.consumo_m3);
    if (formData.numero_dias) submitData.numero_dias = parseInt(formData.numero_dias);
    
    // Date fields
    if (formData.data_vencimento) submitData.data_vencimento = formData.data_vencimento;
    if (formData.data_leitura_anterior) submitData.data_leitura_anterior = formData.data_leitura_anterior;
    if (formData.data_leitura_atual) submitData.data_leitura_atual = formData.data_leitura_atual;

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>
              {viewMode ? "Visualizar Registro" : editData ? "Editar Registro" : "Novo Cadastro"} - Gestão de Água
            </CardTitle>
            <CardDescription>
              {viewMode ? "Detalhes do registro de água" : "Preencha os dados do registro de água"}
            </CardDescription>
          </div>
          {!viewMode && (
            <div className="flex flex-wrap gap-2 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setImportDialogOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setImportDialogOpen(true)}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Importar XLSX
              </Button>
              <Button type="button" onClick={() => setMonthlyWizardOpen(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Dados Mensais
              </Button>
              <Button 
                type="button" 
                variant={hasPendingSchools ? "default" : "secondary"}
                onClick={() => setPendingDialogOpen(true)}
                className={hasPendingSchools ? "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700" : ""}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Pendências
              </Button>
            </div>
          )}
        </div>
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
              <Label htmlFor="mes_referencia">Mês Referência *</Label>
              <Select
                value={formData.mes_referencia}
                onValueChange={(value) => handleInputChange('mes_referencia', value)}
                disabled={viewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Janeiro/2025">Janeiro/2025</SelectItem>
                  <SelectItem value="Fevereiro/2025">Fevereiro/2025</SelectItem>
                  <SelectItem value="Março/2025">Março/2025</SelectItem>
                  <SelectItem value="Abril/2025">Abril/2025</SelectItem>
                  <SelectItem value="Maio/2025">Maio/2025</SelectItem>
                  <SelectItem value="Junho/2025">Junho/2025</SelectItem>
                  <SelectItem value="Julho/2025">Julho/2025</SelectItem>
                  <SelectItem value="Agosto/2025">Agosto/2025</SelectItem>
                  <SelectItem value="Setembro/2025">Setembro/2025</SelectItem>
                  <SelectItem value="Outubro/2025">Outubro/2025</SelectItem>
                  <SelectItem value="Novembro/2025">Novembro/2025</SelectItem>
                  <SelectItem value="Dezembro/2025">Dezembro/2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Cadastro(s) e Valores *</Label>
                {!viewMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCadastro}
                  >
                    <span className="text-xs">+ Adicionar mais um número de cadastro</span>
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {formData.cadastros.map((cadastro, index) => (
                  <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/30">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Cadastro {index + 1}</Label>
                        <Input
                          value={cadastro}
                          onChange={(e) => handleCadastroChange(index, e.target.value)}
                          placeholder={`Número do cadastro ${index + 1}`}
                          required={index === 0}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Hidrômetro</Label>
                        <Input
                          value={formData.hidrometros[index] || ''}
                          onChange={(e) => handleHidrometroChange(index, e.target.value)}
                          placeholder="Nº Hidrômetro"
                          disabled={viewMode}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Consumo (m³)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.consumos_m3[index] || ''}
                          onChange={(e) => handleConsumoChange(index, e.target.value)}
                          placeholder="0.00"
                          disabled={viewMode}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Nº de dias</Label>
                        <Input
                          type="number"
                          value={formData.numeros_dias[index] || ''}
                          onChange={(e) => handleNumeroDiasChange(index, e.target.value)}
                          placeholder="30"
                          disabled={viewMode}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                        <CurrencyInput
                          value={formData.valores_cadastros[index] || ''}
                          onValueChange={(formatted) => handleValorCadastroChange(index, formatted)}
                          placeholder="R$ 0,00"
                          disabled={viewMode}
                        />
                      </div>
                      {!viewMode && formData.cadastros.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveCadastro(index)}
                          className="mt-6"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Valor Total */}
                <div className="flex justify-end items-center gap-2 pt-2 border-t">
                  <Label className="font-semibold">Valor Total:</Label>
                  <span className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(valorTotal)}
                  </span>
                </div>
              </div>
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
      <MonthlyDataWizard
        open={monthlyWizardOpen}
        onOpenChange={(open) => {
          setMonthlyWizardOpen(open);
          if (!open) {
            setPendingMonth(undefined);
            setPendingSchoolIndex(undefined);
          }
        }}
        onSuccess={onSuccess}
        initialMonth={pendingMonth}
        initialSchoolIndex={pendingSchoolIndex}
      />
      <PendingSchools
        open={pendingDialogOpen}
        onOpenChange={setPendingDialogOpen}
        onSelectPending={(month, schoolIndex) => {
          setPendingMonth(month);
          setPendingSchoolIndex(schoolIndex);
          setMonthlyWizardOpen(true);
        }}
      />
      <WaterImport
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={onSuccess}
      />
    </Card>
  );
}
