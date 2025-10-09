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
    data_leitura_anterior: '',
    data_leitura_atual: '',
    valor_gasto: '',
    data_vencimento: '',
    consumo_m3: '',
    numero_dias: '',
    hidrometro: '',
    descricao_servicos: '',
    valor_servicos: '',
    ocorrencias_pendencias: ''
  });

  const currentSchool = schools[currentSchoolIndex];
  const totalSchools = schools.length;
  const progress = totalSchools > 0 ? ((currentSchoolIndex + 1) / totalSchools) * 100 : 0;
  const isSchoolAlreadyFilled = filledSchools.has(currentSchoolIndex);

  useEffect(() => {
    if (currentSchool && step === 'fill-data') {
      // Cache schools in localStorage for pending list
      localStorage.setItem('cached_schools', JSON.stringify(schools));
      
      // Reset form with current school data
      setFormData({
        cadastros: [''],
        data_leitura_anterior: '',
        data_leitura_atual: '',
        valor_gasto: '',
        data_vencimento: '',
        consumo_m3: '',
        numero_dias: '',
        hidrometro: '',
        descricao_servicos: '',
        valor_servicos: '',
        ocorrencias_pendencias: ''
      });
    }
  }, [currentSchoolIndex, currentSchool, step, schools]);

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
      cadastros: [...prev.cadastros, '']
    }));
  };

  const handleRemoveCadastro = (index: number) => {
    if (formData.cadastros.length > 1) {
      setFormData(prev => ({
        ...prev,
        cadastros: prev.cadastros.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCadastroChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      cadastros: prev.cadastros.map((cad, i) => i === index ? value : cad)
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
      proprietario: currentSchool.proprietario || '',
      nome_escola: currentSchool.nome_escola,
      endereco_completo: currentSchool.endereco_completo || '',
      numero: currentSchool.numero || '',
      bairro: currentSchool.bairro || '',
      hidrometro: formData.hidrometro,
      descricao_servicos: formData.descricao_servicos,
      macroregiao: currentSchool.macroregiao || '',
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      mes_ano_referencia: selectedMonth
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

    const { error } = await supabase
      .from('school_records')
      .insert([submitData]);

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
    setFormData({
      cadastros: [''],
      data_leitura_anterior: '',
      data_leitura_atual: '',
      valor_gasto: '',
      data_vencimento: '',
      consumo_m3: '',
      numero_dias: '',
      hidrometro: '',
      descricao_servicos: '',
      valor_servicos: '',
      ocorrencias_pendencias: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                  <Label>Cadastro(s) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCadastro}
                  >
                    <span className="text-xs">+ Adicionar mais um número de cadastro</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.cadastros.map((cadastro, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={cadastro}
                        onChange={(e) => handleCadastroChange(index, e.target.value)}
                        placeholder={`Cadastro ${index + 1}`}
                        required={index === 0}
                      />
                      {formData.cadastros.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveCadastro(index)}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_servicos">Valor dos Serviços (R$)</Label>
                <CurrencyInput
                  id="valor_servicos"
                  value={formData.valor_servicos}
                  onValueChange={(formatted, numeric) => handleInputChange('valor_servicos', formatted)}
                  placeholder="R$ 0,00"
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
                <Button type="button" variant="outline" onClick={handleSkipSchool}>
                  Pular Escola
                </Button>
              </div>
              <div className="flex gap-2">
                {isSchoolAlreadyFilled && (
                  <Button type="button" variant="secondary" onClick={handleSaveAndNext}>
                    Editar
                  </Button>
                )}
                <Button onClick={handleSaveAndNext}>
                  {currentSchoolIndex < schools.length - 1 ? 'Próxima Escola' : 'Finalizar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
