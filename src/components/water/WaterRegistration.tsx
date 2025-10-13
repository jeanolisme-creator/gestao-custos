import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSchools } from '@/hooks/useSchools';
import { Search, FileText, FileSpreadsheet, Calendar, AlertCircle, Clock } from 'lucide-react';
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
    datas_leitura_anterior: [''],
    datas_leitura_atual: [''],
    datas_vencimento: [''],
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
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [internalEditData, setInternalEditData] = useState<any>(null);

  // Fetch and subscribe to recent records
  const fetchRecentRecords = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('school_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.error('Erro ao carregar registros:', error);
      return;
    }
    console.log('Registros recentes carregados:', data?.length || 0);
    setRecentRecords(data || []);
  }, [user]);

  useEffect(() => {
    fetchRecentRecords();
    if (!user) return;
    const channel = supabase
      .channel('water_recent_records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_records' }, () => {
        fetchRecentRecords();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchRecentRecords]);

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
    const dataToEdit = internalEditData || editData;
    if (dataToEdit) {
      // Parse cadastros if stored as JSON array, otherwise convert to array
      let cadastrosArray = [''];
      try {
        if (dataToEdit.cadastro) {
          const parsed = JSON.parse(dataToEdit.cadastro);
          cadastrosArray = Array.isArray(parsed) ? parsed : [dataToEdit.cadastro];
        }
      } catch {
        cadastrosArray = dataToEdit.cadastro ? [dataToEdit.cadastro] : [''];
      }

      // Parse valores_cadastros
      let valoresArray = [];
      try {
        if (dataToEdit.valores_cadastros) {
          const parsed = JSON.parse(dataToEdit.valores_cadastros as string);
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
      const hidrometrosArray = dataToEdit.hidrometros ? JSON.parse(dataToEdit.hidrometros) : [''];
      
      // Parse consumos_m3 and numeros_dias arrays
      const consumosArray = dataToEdit.consumos_m3 ? JSON.parse(dataToEdit.consumos_m3) : [''];
      const numerosDiasArray = dataToEdit.numeros_dias ? JSON.parse(dataToEdit.numeros_dias) : [''];
      
      // Parse datas arrays
      const datasLeituraAnteriorArray = dataToEdit.datas_leitura_anterior ? JSON.parse(dataToEdit.datas_leitura_anterior) : [''];
      const datasLeituraAtualArray = dataToEdit.datas_leitura_atual ? JSON.parse(dataToEdit.datas_leitura_atual) : [''];
      const datasVencimentoArray = dataToEdit.datas_vencimento ? JSON.parse(dataToEdit.datas_vencimento) : [''];
      
      const valoresFormatted = cadastrosArray.map((_, index) => {
        const valor = valoresArray[index];
        return valor ? formatCurrency(valor) : '';
      });

      const valorServicos = dataToEdit.valor_servicos ? formatCurrency(dataToEdit.valor_servicos) : '';
      
      setFormData({
        mes_referencia: dataToEdit.mes_referencia || dataToEdit.mes_ano_referencia || '',
        cadastros: cadastrosArray,
        hidrometros: hidrometrosArray,
        consumos_m3: consumosArray.map((c: any) => c?.toString() || ''),
        numeros_dias: numerosDiasArray.map((n: any) => n?.toString() || ''),
        datas_leitura_anterior: datasLeituraAnteriorArray,
        datas_leitura_atual: datasLeituraAtualArray,
        datas_vencimento: datasVencimentoArray,
        valores_cadastros: valoresFormatted,
        proprietario: dataToEdit.proprietario || '',
        nome_escola: dataToEdit.nome_escola || '',
        data_leitura_anterior: dataToEdit.data_leitura_anterior || '',
        data_leitura_atual: dataToEdit.data_leitura_atual || '',
        data_vencimento: dataToEdit.data_vencimento || '',
        endereco_completo: dataToEdit.endereco_completo || '',
        numero: dataToEdit.numero || '',
        bairro: dataToEdit.bairro || '',
        consumo_m3: dataToEdit.consumo_m3?.toString() || '',
        numero_dias: dataToEdit.numero_dias?.toString() || '',
        descricao_servicos: dataToEdit.descricao_servicos || '',
        valor_servicos: valorServicos,
        macroregiao: dataToEdit.macroregiao || '',
        ocorrencias_pendencias: dataToEdit.ocorrencias_pendencias || ''
      });
    }
  }, [editData, internalEditData]);

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
      datas_leitura_anterior: [''],
      datas_leitura_atual: [''],
      datas_vencimento: [''],
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
      datas_leitura_anterior: [...prev.datas_leitura_anterior, ''],
      datas_leitura_atual: [...prev.datas_leitura_atual, ''],
      datas_vencimento: [...prev.datas_vencimento, ''],
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
        datas_leitura_anterior: prev.datas_leitura_anterior.filter((_, i) => i !== index),
        datas_leitura_atual: prev.datas_leitura_atual.filter((_, i) => i !== index),
        datas_vencimento: prev.datas_vencimento.filter((_, i) => i !== index),
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

  const handleDataLeituraAnteriorChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      datas_leitura_anterior: prev.datas_leitura_anterior.map((d, i) => i === index ? value : d)
    }));
  };

  const handleDataLeituraAtualChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      datas_leitura_atual: prev.datas_leitura_atual.map((d, i) => i === index ? value : d)
    }));
  };

  const handleDataVencimentoChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      datas_vencimento: prev.datas_vencimento.map((d, i) => i === index ? value : d)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const dataToEdit = internalEditData || editData;

    const submitData: any = { 
      user_id: user.id,
      cadastro: JSON.stringify(formData.cadastros.filter(c => c.trim() !== '')),
      hidrometros: JSON.stringify(formData.hidrometros),
      consumos_m3: JSON.stringify(formData.consumos_m3.map(c => parseFloat(c) || 0)),
      numeros_dias: JSON.stringify(formData.numeros_dias.map(n => parseInt(n) || 0)),
      datas_leitura_anterior: JSON.stringify(formData.datas_leitura_anterior),
      datas_leitura_atual: JSON.stringify(formData.datas_leitura_atual),
      datas_vencimento: JSON.stringify(formData.datas_vencimento),
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
    
    // Preencher campos singulares com o primeiro valor dos arrays
    if (formData.hidrometros[0]) submitData.hidrometro = formData.hidrometros[0];
    if (formData.consumos_m3[0]) submitData.consumo_m3 = parseFloat(formData.consumos_m3[0]) || null;
    if (formData.numeros_dias[0]) submitData.numero_dias = parseInt(formData.numeros_dias[0]) || null;
    if (formData.datas_leitura_anterior[0]) submitData.data_leitura_anterior = formData.datas_leitura_anterior[0];
    if (formData.datas_leitura_atual[0]) submitData.data_leitura_atual = formData.datas_leitura_atual[0];
    if (formData.datas_vencimento[0]) submitData.data_vencimento = formData.datas_vencimento[0];
    
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

    let error;
    if (dataToEdit) {
      const result = await supabase
        .from('school_records')
        .update(submitData)
        .eq('id', dataToEdit.id);
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
        title: dataToEdit ? "Erro ao atualizar registro" : "Erro ao criar registro",
        description: error.message
      });
    } else {
      toast({
        title: dataToEdit ? "Registro atualizado com sucesso!" : "Registro criado com sucesso!",
        description: dataToEdit ? "O registro foi atualizado." : "O novo registro de água foi adicionado."
      });
      resetForm();
      setInternalEditData(null);
      await fetchRecentRecords();
      onSuccess?.();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>
                {viewMode ? "Visualizar Registro" : (internalEditData || editData) ? "Editar Registro" : "Novo Cadastro"} - Gestão de Água
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Cadastro {index + 1}</Label>
                        <Input
                          value={cadastro}
                          onChange={(e) => handleCadastroChange(index, e.target.value)}
                          placeholder={`Nº cadastro ${index + 1}`}
                          required={index === 0}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Hidrômetro</Label>
                        <Input
                          value={formData.hidrometros[index] || ''}
                          onChange={(e) => handleHidrometroChange(index, e.target.value)}
                          placeholder="Nº Hidrômetro"
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-1">
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
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Nº de dias</Label>
                        <Input
                          type="number"
                          value={formData.numeros_dias[index] || ''}
                          onChange={(e) => handleNumeroDiasChange(index, e.target.value)}
                          placeholder="30"
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Data Leitura Anterior</Label>
                        <Input
                          type="date"
                          value={formData.datas_leitura_anterior[index] || ''}
                          onChange={(e) => handleDataLeituraAnteriorChange(index, e.target.value)}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Data Leitura Atual</Label>
                        <Input
                          type="date"
                          value={formData.datas_leitura_atual[index] || ''}
                          onChange={(e) => handleDataLeituraAtualChange(index, e.target.value)}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Data de Vencimento</Label>
                        <Input
                          type="date"
                          value={formData.datas_vencimento[index] || ''}
                          onChange={(e) => handleDataVencimentoChange(index, e.target.value)}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                        <CurrencyInput
                          value={formData.valores_cadastros[index] || ''}
                          onValueChange={(formatted) => handleValorCadastroChange(index, formatted)}
                          placeholder="R$ 0,00"
                          disabled={viewMode}
                        />
                      </div>
                    </div>
                    {!viewMode && formData.cadastros.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveCadastro(index)}
                        className="self-end"
                      >
                        Remover
                      </Button>
                    )}
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
              <Label htmlFor="valor_servicos">Valor dos Serviços (R$)</Label>
              <CurrencyInput
                id="valor_servicos"
                value={formData.valor_servicos}
                onValueChange={(formatted, numeric) => handleInputChange('valor_servicos', formatted)}
                placeholder="R$ 0,00"
                disabled={viewMode}
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

    {/* Seção de Cadastros Recentes */}
    {!viewMode && !editData && (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Todos os Cadastros Realizados ({recentRecords.length})
          </CardTitle>
          <CardDescription>
            Histórico completo de cadastros de água realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2">
              {recentRecords.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{record.nome_escola}</h4>
                        <p className="text-sm text-muted-foreground">{record.endereco_completo}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(parseFloat(record.valor_gasto || 0))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cadastro:</span>
                        <p className="font-medium">{record.cadastro}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mês/Ano:</span>
                        <p className="font-medium">{record.mes_ano_referencia}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consumo:</span>
                        <p className="font-medium">{record.consumo_m3}m³</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data:</span>
                        <p className="font-medium">
                          {new Date(record.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInternalEditData(record);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (window.confirm('Deseja realmente excluir este registro?')) {
                            const { error } = await supabase
                              .from('school_records')
                              .delete()
                              .eq('id', record.id);
                            
                            if (error) {
                              toast({
                                variant: "destructive",
                                title: "Erro ao excluir",
                                description: error.message
                              });
                            } else {
                              toast({
                                title: "Registro excluído com sucesso!"
                              });
                              fetchRecentRecords();
                            }
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )}

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
    </>
  );
}
