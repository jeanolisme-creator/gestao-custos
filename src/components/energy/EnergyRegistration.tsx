import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MonthlyDataWizard } from './MonthlyDataWizard';
import { PendingSchools } from './PendingSchools';

const macroregiaoOptions = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];

const monthOptions = [
  'Janeiro/2025', 'Fevereiro/2025', 'Março/2025', 'Abril/2025', 'Maio/2025', 'Junho/2025',
  'Julho/2025', 'Agosto/2025', 'Setembro/2025', 'Outubro/2025', 'Novembro/2025', 'Dezembro/2025',
  'Janeiro/2026', 'Fevereiro/2026', 'Março/2026', 'Abril/2026', 'Maio/2026', 'Junho/2026',
  'Julho/2026', 'Agosto/2026', 'Setembro/2026', 'Outubro/2026', 'Novembro/2026', 'Dezembro/2026',
  'Janeiro/2027', 'Fevereiro/2027', 'Março/2027', 'Abril/2027', 'Maio/2027', 'Junho/2027',
  'Julho/2027', 'Agosto/2027', 'Setembro/2027', 'Outubro/2027', 'Novembro/2027', 'Dezembro/2027'
];

interface EnergyRegistrationProps {
  onSuccess?: () => void;
  editData?: any;
  viewMode?: boolean;
}

export function EnergyRegistration({ onSuccess, editData, viewMode = false }: EnergyRegistrationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [cadastros, setCadastros] = useState<Array<{
    cadastro: string;
    medidor: string;
    consumo_kwh: string;
    numero_dias: string;
    utilizado: string;
    demanda_kwh: string;
    tipo_instalacao: string;
    data_leitura_anterior: string;
    data_leitura_atual: string;
    data_vencimento: string;
    valor: string;
  }>>([{
    cadastro: '',
    medidor: '',
    consumo_kwh: '',
    numero_dias: '',
    utilizado: '',
    demanda_kwh: '',
    tipo_instalacao: '',
    data_leitura_anterior: '',
    data_leitura_atual: '',
    data_vencimento: '',
    valor: ''
  }]);

  const [formData, setFormData] = useState({
    mes_referencia: '',
    proprietario: '',
    nome_escola: '',
    endereco: '',
    numero: '',
    bairro: '',
    macroregiao: '',
    descricao_servicos: '',
    ocorrencias_pendencias: ''
  });
  
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  // Monthly Wizard & Pending controls
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [selectedMonthWizard, setSelectedMonthWizard] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('energy_records')
        .select('*', { count: 'exact', head: true })
        .eq('cadastro_cliente', 'PENDENTE');
      if (error) throw error;
      setPendingCount(count || 0);
    } catch (e) {
      console.error('Erro ao carregar pendências:', e);
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  const fetchRecentRecords = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('energy_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      console.log('Dados reais carregados do energy_records:', data?.length || 0);
      setRecentRecords(data || []);
    } catch (error) {
      console.error('Error fetching recent records:', error);
      setRecentRecords([]);
    }
  }, []);

  useEffect(() => {
    fetchRecentRecords();

    const channel = supabase
      .channel('energy_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'energy_records'
        },
        () => {
          fetchRecentRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecentRecords]);

  useEffect(() => {
    if (editData) {
      setFormData({
        mes_referencia: editData.mes_ano_referencia || '',
        proprietario: editData.proprietario || '',
        nome_escola: editData.nome_escola || '',
        endereco: editData.endereco || '',
        numero: editData.numero || '',
        bairro: editData.bairro || '',
        macroregiao: editData.macroregiao || '',
        descricao_servicos: editData.descricao_servicos || '',
        ocorrencias_pendencias: editData.ocorrencias_pendencias || ''
      });
      
      setCadastros([{
        cadastro: editData.cadastro_cliente || '',
        medidor: editData.relogio || '',
        consumo_kwh: editData.consumo_kwh?.toString() || '',
        numero_dias: editData.numero_dias?.toString() || '',
        utilizado: editData.responsavel || '',
        demanda_kwh: editData.demanda_kwh?.toString() || '',
        tipo_instalacao: editData.tipo_instalacao || '',
        data_leitura_anterior: editData.data_leitura_anterior || '',
        data_leitura_atual: editData.data_leitura_atual || '',
        data_vencimento: editData.data_vencimento || '',
        valor: editData.valor_gasto?.toString() || ''
      }]);
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
      endereco: school.endereco_completo || '',
      numero: school.numero || '',
      bairro: school.bairro || '',
      macroregiao: school.macroregiao || ''
    }));
    setSearchSchoolTerm('');
  };

  const filteredSchools = schools.filter(school =>
    school.nome_escola.toLowerCase().includes(searchSchoolTerm.toLowerCase())
  );

  const addCadastro = () => {
    setCadastros([...cadastros, {
      cadastro: '',
      medidor: '',
      consumo_kwh: '',
      numero_dias: '',
      utilizado: '',
      demanda_kwh: '',
      tipo_instalacao: '',
      data_leitura_anterior: '',
      data_leitura_atual: '',
      data_vencimento: '',
      valor: ''
    }]);
  };

  const removeCadastro = (index: number) => {
    if (cadastros.length > 1) {
      setCadastros(cadastros.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return cadastros.reduce((total, cad) => {
      const valor = parseFloat(cad.valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
      return total + valor;
    }, 0);
  };

  const resetForm = () => {
    setFormData({
      mes_referencia: '',
      proprietario: '',
      nome_escola: '',
      endereco: '',
      numero: '',
      bairro: '',
      macroregiao: '',
      descricao_servicos: '',
      ocorrencias_pendencias: ''
    });
    setCadastros([{
      cadastro: '',
      medidor: '',
      consumo_kwh: '',
      numero_dias: '',
      utilizado: '',
      demanda_kwh: '',
      tipo_instalacao: '',
      data_leitura_anterior: '',
      data_leitura_atual: '',
      data_vencimento: '',
      valor: ''
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const valorTotal = calculateTotal();
    
    const submitData: any = { 
      user_id: user.id,
      cadastro_cliente: cadastros[0].cadastro,
      proprietario: formData.proprietario,
      nome_escola: formData.nome_escola,
      endereco: formData.endereco,
      numero: formData.numero,
      bairro: formData.bairro,
      tipo_instalacao: cadastros[0].tipo_instalacao,
      relogio: cadastros[0].medidor,
      responsavel: cadastros[0].utilizado,
      mes_ano_referencia: formData.mes_referencia,
      macroregiao: formData.macroregiao,
      descricao_servicos: formData.descricao_servicos,
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      valor_gasto: valorTotal
    };
    
    // Convert numeric fields
    if (cadastros[0].consumo_kwh) submitData.consumo_kwh = parseFloat(cadastros[0].consumo_kwh);
    if (cadastros[0].demanda_kwh) submitData.demanda_kwh = parseFloat(cadastros[0].demanda_kwh);
    if (cadastros[0].numero_dias) submitData.numero_dias = parseInt(cadastros[0].numero_dias);
    
    // Date fields
    if (cadastros[0].data_vencimento) submitData.data_vencimento = cadastros[0].data_vencimento;
    if (cadastros[0].data_leitura_anterior) submitData.data_leitura_anterior = cadastros[0].data_leitura_anterior;
    if (cadastros[0].data_leitura_atual) submitData.data_leitura_atual = cadastros[0].data_leitura_atual;

    let error;
    if (editData) {
      const result = await supabase
        .from('energy_records')
        .update(submitData)
        .eq('id', editData.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('energy_records')
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
        description: editData ? "O registro foi atualizado." : "O novo registro de energia foi adicionado."
      });
      resetForm();
      fetchRecentRecords();
      onSuccess?.();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
          <div>
            <CardTitle>
              {viewMode ? "Visualizar Registro" : editData ? "Editar Registro" : "Novo Cadastro"} - Gestão de Energia
            </CardTitle>
            <CardDescription>
              {viewMode ? "Detalhes do registro de energia" : "Preencha os dados do registro de energia"}
            </CardDescription>
          </div>
          {!viewMode && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <Button
                type="button"
                variant={pendingCount > 0 ? "default" : "secondary"}
                className={pendingCount > 0 ? "bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning-hover))]" : undefined}
                onClick={() => setPendingDialogOpen(true)}
              >
                Pendências{pendingCount > 0 ? ` (${pendingCount})` : ''}
              </Button>
              <Button
                type="button"
                onClick={() => setMonthDialogOpen(true)}
                className="bg-[hsl(var(--water-primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--water-primary))]/90"
              >
                Dados Mensais
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Search - Always visible */}
            {!viewMode && !editData && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-medium text-foreground">Buscar Escola Cadastrada</h4>
                <Input
                  placeholder="Digite o nome da escola para buscar..."
                  value={searchSchoolTerm}
                  onChange={(e) => setSearchSchoolTerm(e.target.value)}
                />
                {searchSchoolTerm && filteredSchools.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-md bg-background">
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
                  </div>
                )}
                {searchSchoolTerm && filteredSchools.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma escola encontrada</p>
                )}
              </div>
            )}

            {/* Mês Referência */}
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
                  {monthOptions.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dados da Escola */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nome_escola">Nome da Escola *</Label>
                <Input
                  id="nome_escola"
                  value={formData.nome_escola}
                  onChange={(e) => handleInputChange('nome_escola', e.target.value)}
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
                  disabled={viewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  disabled={viewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  disabled={viewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  disabled={viewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="macroregiao">Macrorregião</Label>
                <Select
                  value={formData.macroregiao}
                  onValueChange={(value) => handleInputChange('macroregiao', value)}
                  disabled={viewMode}
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
            </div>

            {/* Cadastros */}
            {cadastros.map((cadastro, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Cadastro {index + 1}</h4>
                  {!viewMode && cadastros.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCadastro(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Cadastro *</Label>
                    <Input
                      value={cadastro.cadastro}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].cadastro = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      required
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Medidor</Label>
                    <Input
                      value={cadastro.medidor}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].medidor = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Consumo (kWh)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cadastro.consumo_kwh}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].consumo_kwh = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nº de Dias</Label>
                    <Input
                      type="number"
                      value={cadastro.numero_dias}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].numero_dias = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Utilizado</Label>
                    <Input
                      value={cadastro.utilizado}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].utilizado = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Demanda (kWh)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={cadastro.demanda_kwh}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].demanda_kwh = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Instalação</Label>
                    <Input
                      value={cadastro.tipo_instalacao}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].tipo_instalacao = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Leitura Anterior</Label>
                    <Input
                      type="date"
                      value={cadastro.data_leitura_anterior}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].data_leitura_anterior = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Leitura Atual</Label>
                    <Input
                      type="date"
                      value={cadastro.data_leitura_atual}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].data_leitura_atual = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Vencimento</Label>
                    <Input
                      type="date"
                      value={cadastro.data_vencimento}
                      onChange={(e) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].data_vencimento = e.target.value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Valor (R$) *</Label>
                    <CurrencyInput
                      value={cadastro.valor}
                      onValueChange={(value) => {
                        const newCadastros = [...cadastros];
                        newCadastros[index].valor = value;
                        setCadastros(newCadastros);
                      }}
                      disabled={viewMode}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {!viewMode && (
              <Button type="button" variant="outline" onClick={addCadastro}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar mais um número de cadastro
              </Button>
            )}

            {/* Valor Total */}
            {cadastros.length > 1 && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <Label className="text-lg font-bold">Valor Total</Label>
                <p className="text-2xl font-bold text-primary">
                  {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}

            {/* Outros Campos */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descricao_servicos">Descrição dos Serviços</Label>
                <Textarea
                  id="descricao_servicos"
                  value={formData.descricao_servicos}
                  onChange={(e) => handleInputChange('descricao_servicos', e.target.value)}
                  disabled={viewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ocorrencias_pendencias">Ocorrências / Pendências</Label>
                <Textarea
                  id="ocorrencias_pendencias"
                  value={formData.ocorrencias_pendencias}
                  onChange={(e) => handleInputChange('ocorrencias_pendencias', e.target.value)}
                  disabled={viewMode}
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

      {/* Dialog: Selecionar Mês e Wizard */}
      <Dialog open={monthDialogOpen} onOpenChange={setMonthDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Selecionar Mês Referência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Mês Referência</Label>
            <Select value={selectedMonthWizard} onValueChange={setSelectedMonthWizard}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês..." />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setMonthDialogOpen(false)}>Cancelar</Button>
              <Button
                type="button"
                onClick={() => {
                  if (selectedMonthWizard) {
                    setMonthDialogOpen(false);
                    setWizardOpen(true);
                  }
                }}
                disabled={!selectedMonthWizard}
              >
                Avançar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados Mensais {selectedMonthWizard ? `- ${selectedMonthWizard}` : ''}</DialogTitle>
          </DialogHeader>
          {selectedMonthWizard && (
            <MonthlyDataWizard
              selectedMonth={selectedMonthWizard}
              onClose={() => {
                setWizardOpen(false);
                fetchPendingCount();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Pendências */}
      <Dialog open={pendingDialogOpen} onOpenChange={setPendingDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pendências</DialogTitle>
          </DialogHeader>
          <PendingSchools
            onClose={() => {
              setPendingDialogOpen(false);
              fetchPendingCount();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Cadastros Recentes */}
      {!viewMode && !editData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Todos os Cadastros Realizados ({recentRecords.length})</CardTitle>
            <CardDescription>Últimos registros inseridos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {recentRecords.map((record, index) => (
                  <AccordionItem key={record.id} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span className="font-medium">{record.nome_escola}</span>
                        <span className="text-sm text-muted-foreground">
                          {record.mes_ano_referencia} - {new Date(record.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Cadastro:</strong> {record.cadastro_cliente}</div>
                        <div><strong>Proprietário:</strong> {record.proprietario || '-'}</div>
                        <div><strong>Consumo:</strong> {record.consumo_kwh ? `${record.consumo_kwh} kWh` : '-'}</div>
                        <div><strong>Valor:</strong> {record.valor_gasto ? 
                          record.valor_gasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</div>
                        <div><strong>Vencimento:</strong> {record.data_vencimento ? 
                          new Date(record.data_vencimento).toLocaleDateString('pt-BR') : '-'}</div>
                        <div><strong>Endereço:</strong> {record.endereco || '-'}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
