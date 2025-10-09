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
}

const macroregiaoOptions = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];

export function MonthlyDataWizard({ open, onOpenChange, onSuccess }: MonthlyDataWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [step, setStep] = useState<'select-month' | 'fill-data'>('select-month');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentSchoolIndex, setCurrentSchoolIndex] = useState(0);
  const [filledSchools, setFilledSchools] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    cadastro: '',
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
      // Reset form with current school data
      setFormData({
        cadastro: '',
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
  }, [currentSchoolIndex, currentSchool, step]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
  };

  const handleSaveAndNext = async () => {
    if (!user || !currentSchool) return;

    const submitData: any = { 
      user_id: user.id,
      cadastro: formData.cadastro,
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

    // Mark school as filled
    setFilledSchools(prev => new Set(prev).add(currentSchoolIndex));

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

  const handleClose = () => {
    setStep('select-month');
    setSelectedMonth('');
    setCurrentSchoolIndex(0);
    setFilledSchools(new Set());
    setFormData({
      cadastro: '',
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
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
              <div className="space-y-2">
                <Label htmlFor="cadastro">Cadastro *</Label>
                <Input
                  id="cadastro"
                  value={formData.cadastro}
                  onChange={(e) => handleInputChange('cadastro', e.target.value)}
                  required
                />
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
