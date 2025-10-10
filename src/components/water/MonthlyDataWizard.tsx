import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Textarea } from '@/components/ui/textarea';
import { useSchools } from '@/hooks/useSchools';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MonthlyDataWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialMonth?: string;
  initialSchoolIndex?: number;
}

const macroregiaoOptions = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];

export function MonthlyDataWizard({ open, onOpenChange, onSuccess, initialMonth, initialSchoolIndex }: MonthlyDataWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [step, setStep] = useState<'select-month' | 'fill-data'>('select-month');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentSchoolIndex, setCurrentSchoolIndex] = useState(0);
  const [filledSchools, setFilledSchools] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);

  // Load initial values if provided
  useEffect(() => {
    if (open && initialMonth && initialSchoolIndex !== undefined) {
      setSelectedMonth(initialMonth);
      setCurrentSchoolIndex(initialSchoolIndex);
      setStep('fill-data');
      loadPendingSchools(initialMonth);
    }
  }, [open, initialMonth, initialSchoolIndex]);
  const [formData, setFormData] = useState({
    cadastros: [''],
    hidrometros: [''],
    consumos_m3: [''],
    numeros_dias: [''],
    datas_leitura_anterior: [''],
    datas_leitura_atual: [''],
    datas_vencimento: [''],
    valores_cadastros: [''],
    data_leitura_anterior: '',
    data_leitura_atual: '',
    data_vencimento: '',
    consumo_m3: '',
    numero_dias: '',
    descricao_servicos: '',
    valor_servicos: '',
    ocorrencias_pendencias: ''
  });

  const currentSchool = schools[currentSchoolIndex];
  const totalSchools = schools.length;
  const progress = totalSchools > 0 ? ((currentSchoolIndex + 1) / totalSchools) * 100 : 0;
  const isSchoolAlreadyFilled = filledSchools.has(currentSchoolIndex);

  // Calculate total value from all cadastros
  const valorTotal = formData.valores_cadastros.reduce((sum, valor) => {
    const numericValue = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    return sum + numericValue;
  }, 0);

  // Load existing data if school was already filled
  useEffect(() => {
    const loadExistingData = async () => {
      if (!currentSchool || step !== 'fill-data' || !selectedMonth) return;

      // Cache schools in localStorage for pending list
      localStorage.setItem('cached_schools', JSON.stringify(schools));

      // Check if this school already has data for this month
      const { data: existingRecord, error } = await supabase
        .from('school_records')
        .select('*')
        .eq('user_id', user?.id)
        .eq('nome_escola', currentSchool.nome_escola)
        .eq('mes_ano_referencia', selectedMonth)
        .maybeSingle();

      if (error) {
        console.error('Error loading existing data:', error);
        return;
      }

      if (existingRecord) {
        const record = existingRecord;
        
        console.log('Carregando dados existentes:', record);
        
        // Mark as filled
        setFilledSchools(prev => new Set(prev).add(currentSchoolIndex));

        // Format currency values
        const formatCurrency = (value: number | null) => {
          if (!value) return '';
          return `R$ ${value.toFixed(2).replace('.', ',')}`;
        };

        // Load existing data into form
        let cadastrosParsed: string[] = [''];
        try {
          if (record.cadastro) {
            const parsed = JSON.parse(record.cadastro as string);
            cadastrosParsed = Array.isArray(parsed)
              ? parsed.map((c: any) => c?.toString() || '')
              : [parsed?.toString() || ''];
          }
        } catch {
          cadastrosParsed = [record.cadastro as string].filter(Boolean) as string[];
        }
        const cadastros = cadastrosParsed.length > 0 ? cadastrosParsed : [''];

        const valoresCadastrosRaw = record.valores_cadastros
          ? (Array.isArray(record.valores_cadastros) ? record.valores_cadastros : JSON.parse(record.valores_cadastros as string))
          : [];
        
        // Ensure values array matches cadastros array length
        const valoresFormatted = cadastros.map((_, index) => {
          const valor = valoresCadastrosRaw[index];
          const v = typeof valor === 'string' ? parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) : Number(valor);
          return Number.isFinite(v) && v > 0 ? `R$ ${v.toFixed(2).replace('.', ',')}` : '';
        });

      // Parse hidrometros - JSONB fields come as arrays or strings
      let hidrometrosArray = [''];
      if (record.hidrometros) {
        try {
          // JSONB fields can be already parsed arrays or JSON strings
          hidrometrosArray = Array.isArray(record.hidrometros) 
            ? record.hidrometros 
            : JSON.parse(record.hidrometros as string);
        } catch {
          hidrometrosArray = [''];
        }
      } else if (record.hidrometro) {
        // Fallback to old single hidrometro field
        try {
          hidrometrosArray = Array.isArray(record.hidrometro)
            ? record.hidrometro
            : JSON.parse(record.hidrometro as string);
        } catch {
          hidrometrosArray = [record.hidrometro as string];
        }
      }

      // Parse consumos_m3, numeros_dias - JSONB fields
      let consumosArray = record.consumos_m3 
        ? (Array.isArray(record.consumos_m3) ? record.consumos_m3 : JSON.parse(record.consumos_m3 as string))
        : [''];
      let numerosDiasArray = record.numeros_dias 
        ? (Array.isArray(record.numeros_dias) ? record.numeros_dias : JSON.parse(record.numeros_dias as string))
        : [''];
      
      // Parse datas arrays - JSONB fields
      let datasLeituraAnteriorArray = record.datas_leitura_anterior 
        ? (Array.isArray(record.datas_leitura_anterior) ? record.datas_leitura_anterior : JSON.parse(record.datas_leitura_anterior as string))
        : [''];
      let datasLeituraAtualArray = record.datas_leitura_atual 
        ? (Array.isArray(record.datas_leitura_atual) ? record.datas_leitura_atual : JSON.parse(record.datas_leitura_atual as string))
        : [''];
      let datasVencimentoArray = record.datas_vencimento 
        ? (Array.isArray(record.datas_vencimento) ? record.datas_vencimento : JSON.parse(record.datas_vencimento as string))
        : [''];

      // Normalize all arrays to match cadastros count (at least 1)
      const targetLen = cadastros.length;
      const padTo = (arr: any[], fill = '') => {
        const a = Array.isArray(arr) ? [...arr] : [];
        while (a.length < targetLen) a.push(fill);
        if (a.length > targetLen) a.length = targetLen;
        return a;
      };
      hidrometrosArray = padTo(hidrometrosArray, '');
      consumosArray = padTo(consumosArray, '');
      numerosDiasArray = padTo(numerosDiasArray, '');
      datasLeituraAnteriorArray = padTo(datasLeituraAnteriorArray, '');
      datasLeituraAtualArray = padTo(datasLeituraAtualArray, '');
      datasVencimentoArray = padTo(datasVencimentoArray, '');
        
      setFormData({
        cadastros,
        hidrometros: hidrometrosArray,
        consumos_m3: consumosArray.map((c: any) => c?.toString() || ''),
        numeros_dias: numerosDiasArray.map((n: any) => n?.toString() || ''),
        datas_leitura_anterior: datasLeituraAnteriorArray,
        datas_leitura_atual: datasLeituraAtualArray,
        datas_vencimento: datasVencimentoArray,
        valores_cadastros: valoresFormatted,
        data_leitura_anterior: record.data_leitura_anterior || '',
        data_leitura_atual: record.data_leitura_atual || '',
        data_vencimento: record.data_vencimento || '',
        consumo_m3: record.consumo_m3?.toString() || '',
        numero_dias: record.numero_dias?.toString() || '',
        descricao_servicos: record.descricao_servicos || '',
        valor_servicos: formatCurrency(record.valor_servicos),
        ocorrencias_pendencias: record.ocorrencias_pendencias || ''
      });
      
      console.log('FormData carregado:', {
        cadastros,
        hidrometros: hidrometrosArray,
        consumos_m3: consumosArray,
        valores_cadastros: valoresFormatted
      });
      } else {
        // Reset form with empty data
        setFilledSchools(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentSchoolIndex);
          return newSet;
        });
        setFormData({
          cadastros: [''],
          hidrometros: [''],
          consumos_m3: [''],
          numeros_dias: [''],
          datas_leitura_anterior: [''],
          datas_leitura_atual: [''],
          datas_vencimento: [''],
          valores_cadastros: [''],
          data_leitura_anterior: '',
          data_leitura_atual: '',
          data_vencimento: '',
          consumo_m3: '',
          numero_dias: '',
          descricao_servicos: '',
          valor_servicos: '',
          ocorrencias_pendencias: ''
        });
      }
      
      // Reset editing state when school changes
      setIsEditing(false);
    };

    loadExistingData();
  }, [currentSchoolIndex, currentSchool, step, schools, selectedMonth]);

  const loadPendingSchools = (month: string) => {
    const stored = localStorage.getItem('water_pending_schools');
    if (stored) {
      const pendingData = JSON.parse(stored);
      if (pendingData[month]) {
        // Don't mark as filled if they're in pending list
        const allSchools = new Set<number>();
        schools.forEach((_, idx) => {
          if (!pendingData[month].includes(idx)) {
            allSchools.add(idx);
          }
        });
        setFilledSchools(allSchools);
      }
    }
  };

  const savePendingSchools = (month: string, indices: number[]) => {
    const stored = localStorage.getItem('water_pending_schools');
    const pendingData = stored ? JSON.parse(stored) : {};
    
    if (indices.length === 0) {
      delete pendingData[month];
    } else {
      pendingData[month] = indices;
    }
    
    localStorage.setItem('water_pending_schools', JSON.stringify(pendingData));
  };

  const removePendingSchool = (month: string, schoolIndex: number) => {
    const stored = localStorage.getItem('water_pending_schools');
    if (stored) {
      const pendingData = JSON.parse(stored);
      if (pendingData[month]) {
        pendingData[month] = pendingData[month].filter((idx: number) => idx !== schoolIndex);
        if (pendingData[month].length === 0) {
          delete pendingData[month];
        }
        localStorage.setItem('water_pending_schools', JSON.stringify(pendingData));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleMonthSelect = () => {
    if (!selectedMonth) {
      toast({
        variant: "destructive",
        title: "Selecione um mês",
        description: "Por favor, selecione o mês de referência"
      });
      return;
    }
    
    if (schools.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma escola cadastrada",
        description: "Cadastre escolas antes de iniciar o preenchimento mensal"
      });
      return;
    }
    
    setStep('fill-data');
    setCurrentSchoolIndex(0);
    loadPendingSchools(selectedMonth);
  };

  const handleSaveAndNext = async () => {
    if (!user || !currentSchool) return;

    const submitData: any = { 
      user_id: user.id,
      cadastro: JSON.stringify(formData.cadastros.filter(c => c.trim() !== '')),
      hidrometros: formData.hidrometros, // JSONB field - Supabase handles serialization
      consumos_m3: formData.consumos_m3.map(c => parseFloat(c) || 0), // JSONB field
      numeros_dias: formData.numeros_dias.map(n => parseInt(n) || 0), // JSONB field
      datas_leitura_anterior: formData.datas_leitura_anterior, // JSONB field
      datas_leitura_atual: formData.datas_leitura_atual, // JSONB field
      datas_vencimento: formData.datas_vencimento, // JSONB field
      proprietario: currentSchool.proprietario || '',
      nome_escola: currentSchool.nome_escola,
      endereco_completo: currentSchool.endereco_completo || '',
      numero: currentSchool.numero || '',
      bairro: currentSchool.bairro || '',
      descricao_servicos: formData.descricao_servicos,
      macroregiao: currentSchool.macroregiao || '',
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      mes_ano_referencia: selectedMonth
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

    // Check if record already exists
    const { data: existingRecords } = await supabase
      .from('school_records')
      .select('id')
      .eq('nome_escola', currentSchool.nome_escola)
      .eq('mes_ano_referencia', selectedMonth)
      .limit(1);

    let error;
    
    if (existingRecords && existingRecords.length > 0) {
      // Update existing record
      const result = await supabase
        .from('school_records')
        .update(submitData)
        .eq('id', existingRecords[0].id);
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('school_records')
        .insert([submitData]);
      error = result.error;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar registro",
        description: error.message
      });
      return;
    }

    toast({
      title: "Registro salvo!",
      description: `Dados de ${currentSchool.nome_escola} salvos com sucesso`
    });

    // Mark school as filled and remove from pending
    setFilledSchools(prev => new Set(prev).add(currentSchoolIndex));
    removePendingSchool(selectedMonth, currentSchoolIndex);

    // Move to next school or finish
    if (currentSchoolIndex < schools.length - 1) {
      setCurrentSchoolIndex(prev => prev + 1);
    } else {
      // Finished all schools
      toast({
        title: "Cadastro mensal concluído!",
        description: `Todos os registros do mês ${selectedMonth} foram salvos`
      });
      handleClose();
      onSuccess?.();
    }
  };

  const handleSkipSchool = () => {
    // Add to pending list
    const stored = localStorage.getItem('water_pending_schools');
    const pendingData = stored ? JSON.parse(stored) : {};
    
    if (!pendingData[selectedMonth]) {
      pendingData[selectedMonth] = [];
    }
    
    if (!pendingData[selectedMonth].includes(currentSchoolIndex)) {
      pendingData[selectedMonth].push(currentSchoolIndex);
      localStorage.setItem('water_pending_schools', JSON.stringify(pendingData));
    }

    if (currentSchoolIndex < schools.length - 1) {
      setCurrentSchoolIndex(prev => prev + 1);
      toast({
        title: "Escola pulada",
        description: "Você pode preencher os dados desta escola depois"
      });
    } else {
      toast({
        title: "Última escola",
        description: "Esta é a última escola. Finalize ou preencha os dados."
      });
    }
  };

  const handlePreviousSchool = () => {
    if (currentSchoolIndex > 0) {
      setCurrentSchoolIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setStep('select-month');
    setSelectedMonth('');
    setCurrentSchoolIndex(0);
    setFilledSchools(new Set());
    setIsEditing(false);
    setFormData({
      cadastros: [''],
      hidrometros: [''],
      consumos_m3: [''],
      numeros_dias: [''],
      datas_leitura_anterior: [''],
      datas_leitura_atual: [''],
      datas_vencimento: [''],
      valores_cadastros: [''],
      data_leitura_anterior: '',
      data_leitura_atual: '',
      data_vencimento: '',
      consumo_m3: '',
      numero_dias: '',
      descricao_servicos: '',
      valor_servicos: '',
      ocorrencias_pendencias: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { handleClose(); } else { setStep('select-month'); } onOpenChange(o); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'select-month' ? 'Dados Mensais - Selecionar Mês' : `Dados Mensais - ${currentSchool?.nome_escola}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'select-month' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="month-select">Mês Referência *</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
            <div className="flex justify-end">
              <Button onClick={handleMonthSelect}>Avançar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {isSchoolAlreadyFilled && (
              <Alert className="bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <strong>Escola já preenchida anteriormente</strong> - Você pode editar os dados se necessário.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Escola {currentSchoolIndex + 1} de {totalSchools}</span>
                <span>{Math.round(progress)}% completo</span>
              </div>
              <Progress value={progress} />
            </div>

            {/* School Info (Read-only) */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium text-foreground">Dados da Escola (preenchidos automaticamente)</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Nome:</span> {currentSchool?.nome_escola}</div>
                <div><span className="font-medium">Proprietário:</span> {currentSchool?.proprietario || 'N/A'}</div>
                <div><span className="font-medium">Endereço:</span> {currentSchool?.endereco_completo || 'N/A'}</div>
                <div><span className="font-medium">Número:</span> {currentSchool?.numero || 'N/A'}</div>
                <div><span className="font-medium">Bairro:</span> {currentSchool?.bairro || 'N/A'}</div>
                <div><span className="font-medium">Macroregião:</span> {currentSchool?.macroregiao || 'N/A'}</div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Cadastro(s) e Valores *</Label>
                  {(!isSchoolAlreadyFilled || isEditing) && (
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
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Hidrômetro</Label>
                          <Input
                            value={formData.hidrometros[index] || ''}
                            onChange={(e) => handleHidrometroChange(index, e.target.value)}
                            placeholder="Nº Hidrômetro"
                            disabled={isSchoolAlreadyFilled && !isEditing}
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
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Nº de dias</Label>
                          <Input
                            type="number"
                            value={formData.numeros_dias[index] || ''}
                            onChange={(e) => handleNumeroDiasChange(index, e.target.value)}
                            placeholder="30"
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Data Leitura Anterior</Label>
                          <Input
                            type="date"
                            value={formData.datas_leitura_anterior[index] || ''}
                            onChange={(e) => handleDataLeituraAnteriorChange(index, e.target.value)}
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Data Leitura Atual</Label>
                          <Input
                            type="date"
                            value={formData.datas_leitura_atual[index] || ''}
                            onChange={(e) => handleDataLeituraAtualChange(index, e.target.value)}
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Data de Vencimento</Label>
                          <Input
                            type="date"
                            value={formData.datas_vencimento[index] || ''}
                            onChange={(e) => handleDataVencimentoChange(index, e.target.value)}
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                          <CurrencyInput
                            value={formData.valores_cadastros[index] || ''}
                            onValueChange={(formatted) => handleValorCadastroChange(index, formatted)}
                            placeholder="R$ 0,00"
                            disabled={isSchoolAlreadyFilled && !isEditing}
                          />
                        </div>
                      </div>
                      {formData.cadastros.length > 1 && (!isSchoolAlreadyFilled || isEditing) && (
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
                <Label htmlFor="valor_servicos">Valor dos Serviços (R$)</Label>
                <CurrencyInput
                  id="valor_servicos"
                  value={formData.valor_servicos}
                  onValueChange={(formatted, numeric) => handleInputChange('valor_servicos', formatted)}
                  placeholder="R$ 0,00"
                  disabled={isSchoolAlreadyFilled && !isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao_servicos">Descrição dos Serviços</Label>
                <Textarea
                  id="descricao_servicos"
                  value={formData.descricao_servicos}
                  onChange={(e) => handleInputChange('descricao_servicos', e.target.value)}
                  disabled={isSchoolAlreadyFilled && !isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ocorrencias_pendencias">Verificar Ocorrência</Label>
                <Textarea
                  id="ocorrencias_pendencias"
                  value={formData.ocorrencias_pendencias}
                  onChange={(e) => handleInputChange('ocorrencias_pendencias', e.target.value)}
                  disabled={isSchoolAlreadyFilled && !isEditing}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                {currentSchoolIndex > 0 && (
                  <Button type="button" variant="outline" onClick={handlePreviousSchool}>
                    Voltar
                  </Button>
                )}
                {(!isSchoolAlreadyFilled || isEditing) && (
                  <Button type="button" variant="outline" onClick={handleSkipSchool}>
                    Pular Escola
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {isSchoolAlreadyFilled && !isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                ) : (
                  <Button onClick={handleSaveAndNext}>
                    {currentSchoolIndex < schools.length - 1 ? 'Salvar e Próxima' : 'Salvar e Finalizar'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
