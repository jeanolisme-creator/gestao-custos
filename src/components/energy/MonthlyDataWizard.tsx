import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ArrowLeft, ArrowRight, Edit, SkipForward, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface School {
  id: string;
  nome_escola: string;
  proprietario: string | null;
  endereco_completo: string | null;
  numero: string | null;
  bairro: string | null;
  macroregiao: string | null;
  tipo_escola: string | null;
}

interface MonthlyDataWizardProps {
  selectedMonth: string;
  onClose: () => void;
}

export function MonthlyDataWizard({ selectedMonth, onClose }: MonthlyDataWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasRestoredIndex, setHasRestoredIndex] = useState(false);
  
  // Form data
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
    retencao_irrf: string;
  }>>([{
    cadastro: "",
    medidor: "",
    consumo_kwh: "",
    numero_dias: "",
    utilizado: "",
    demanda_kwh: "",
    tipo_instalacao: "",
    data_leitura_anterior: "",
    data_leitura_atual: "",
    data_vencimento: "",
    valor: "",
    retencao_irrf: ""
  }]);
  
  const [descricaoServicos, setDescricaoServicos] = useState("");
  const [ocorrenciasPendencias, setOcorrenciasPendencias] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (schools.length > 0 && currentIndex < schools.length) {
      checkIfAlreadyFilled();
    }
  }, [currentIndex, schools, selectedMonth]);

  // Carregar o último índice salvo ao abrir
  useEffect(() => {
    if (schools.length > 0) {
      const savedIndex = localStorage.getItem(`energy_last_index_${selectedMonth}`);
      if (savedIndex) {
        const index = parseInt(savedIndex);
        if (index >= 0 && index < schools.length) {
          setCurrentIndex(index);
        }
      }
      setHasRestoredIndex(true);
    }
  }, [schools, selectedMonth]);

  // Persistir índice atual somente após restauração inicial para evitar sobrescrever progresso salvo
  useEffect(() => {
    if (!hasRestoredIndex) return;
    if (schools.length > 0 && currentIndex < schools.length && selectedMonth) {
      localStorage.setItem(`energy_last_index_${selectedMonth}`, currentIndex.toString());
    }
  }, [currentIndex, schools, selectedMonth, hasRestoredIndex]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("nome_escola");

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as escolas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPreviousMonth = (monthYear: string): string => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const [month, year] = monthYear.split('/');
    const monthIndex = monthNames.indexOf(month);
    
    if (monthIndex === -1) return '';
    
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? (parseInt(year) - 1).toString() : year;
    
    return `${monthNames[prevMonthIndex]}/${prevYear}`;
  };

  const checkIfAlreadyFilled = async () => {
    if (!schools[currentIndex]) return;
    
    try {
      const { data, error } = await supabase
        .from("energy_records")
        .select("*")
        .eq("nome_escola", schools[currentIndex].nome_escola)
        .eq("mes_ano_referencia", selectedMonth)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      let record = data;
      let isFromPreviousMonth = false;

      // Se não encontrou dados para o mês atual, buscar do mês anterior
      if (!record) {
        const previousMonth = getPreviousMonth(selectedMonth);
        if (previousMonth) {
          const { data: previousData } = await supabase
            .from("energy_records")
            .select("*")
            .eq("nome_escola", schools[currentIndex].nome_escola)
            .eq("mes_ano_referencia", previousMonth)
            .maybeSingle();

          if (previousData) {
            record = previousData;
            isFromPreviousMonth = true;
          }
        }
      }
      
      if (record) {
        // Marcar como preenchido apenas se for do mês atual
        if (!isFromPreviousMonth) {
          setRecordId(record.id);
        } else {
          setRecordId(null);
        }

        const formatCurrency = (value: number | null) => {
          if (!value) return "";
          return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // Se for do mês anterior, preencher apenas cadastro, medidor e tipo_instalacao
        if (isFromPreviousMonth) {
          const existingCadastros = [{
            cadastro: record.cadastro_cliente || "",
            medidor: record.relogio || "",
            consumo_kwh: "",
            numero_dias: "",
            utilizado: "",
            demanda_kwh: "",
            tipo_instalacao: record.tipo_instalacao || "",
            data_leitura_anterior: "",
            data_leitura_atual: "",
            data_vencimento: "",
            valor: "",
            retencao_irrf: ""
          }];
          setCadastros(existingCadastros);
          setDescricaoServicos("");
          setOcorrenciasPendencias("");
        } else {
          // Preencher todos os dados se for do mês atual
          const existingCadastros = [{
            cadastro: record.cadastro_cliente || "",
            medidor: record.relogio || "",
            consumo_kwh: record.consumo_kwh?.toString() || "",
            numero_dias: record.numero_dias?.toString() || "",
            utilizado: record.responsavel || "",
            demanda_kwh: record.demanda_kwh?.toString() || "",
            tipo_instalacao: record.tipo_instalacao || "",
            data_leitura_anterior: record.data_leitura_anterior || "",
            data_leitura_atual: record.data_leitura_atual || "",
            data_vencimento: record.data_vencimento || "",
            valor: formatCurrency(record.valor_gasto),
            retencao_irrf: formatCurrency(record.retencao_irrf)
          }];
          setCadastros(existingCadastros);
          setDescricaoServicos(record.descricao_servicos || "");
          setOcorrenciasPendencias(record.ocorrencias_pendencias || "");
        }
      } else {
        setRecordId(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error checking if already filled:", error);
    }
  };

  const resetForm = () => {
    setCadastros([{
      cadastro: "",
      medidor: "",
      consumo_kwh: "",
      numero_dias: "",
      utilizado: "",
      demanda_kwh: "",
      tipo_instalacao: "",
      data_leitura_anterior: "",
      data_leitura_atual: "",
      data_vencimento: "",
      valor: "",
      retencao_irrf: ""
    }]);
    setDescricaoServicos("");
    setOcorrenciasPendencias("");
    setRecordId(null);
    setIsEditing(false);
  };

  const calculateTotal = () => {
    return cadastros.reduce((total, cad) => {
      const valor = parseFloat(cad.valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
      return total + valor;
    }, 0);
  };

  const handleSaveAndNext = async () => {
    if (!user || !schools[currentIndex]) return;

    try {
      const school = schools[currentIndex];
      const valorTotal = calculateTotal();

      const submitData: any = {
        user_id: user.id,
        nome_escola: school.nome_escola,
        proprietario: school.proprietario,
        endereco: school.endereco_completo,
        numero: school.numero,
        bairro: school.bairro,
        macroregiao: school.macroregiao,
        tipo_escola: school.tipo_escola,
        mes_ano_referencia: selectedMonth,
        cadastro_cliente: cadastros[0].cadastro,
        relogio: cadastros[0].medidor,
        consumo_kwh: parseFloat(cadastros[0].consumo_kwh) || null,
        numero_dias: parseInt(cadastros[0].numero_dias) || null,
        responsavel: cadastros[0].utilizado,
        demanda_kwh: parseFloat(cadastros[0].demanda_kwh) || null,
        tipo_instalacao: cadastros[0].tipo_instalacao,
        data_leitura_anterior: cadastros[0].data_leitura_anterior || null,
        data_leitura_atual: cadastros[0].data_leitura_atual || null,
        data_vencimento: cadastros[0].data_vencimento || null,
        valor_gasto: valorTotal,
        retencao_irrf: cadastros[0].retencao_irrf ? parseFloat(cadastros[0].retencao_irrf.replace(/[R$\s.]/g, '').replace(',', '.')) : null,
        descricao_servicos: descricaoServicos,
        ocorrencias_pendencias: ocorrenciasPendencias,
      };

      if (recordId) {
        const { error } = await supabase
          .from("energy_records")
          .update(submitData)
          .eq("id", recordId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("energy_records")
          .insert([submitData]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: `Dados da ${school.nome_escola} salvos com sucesso`,
      });

      // Avançar para próxima escola
      if (currentIndex < schools.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsEditing(false);
      } else {
        // Limpar o índice salvo ao concluir todas as escolas
        localStorage.removeItem(`energy_last_index_${selectedMonth}`);
        toast({
          title: "Concluído",
          description: "Todas as escolas foram processadas!",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    if (!user || !schools[currentIndex]) return;

    try {
      // Salvar como pendente
      const school = schools[currentIndex];
      
      const { error } = await supabase
        .from("energy_records")
        .upsert({
          user_id: user.id,
          nome_escola: school.nome_escola,
          mes_ano_referencia: selectedMonth,
          cadastro_cliente: "PENDENTE",
          ocorrencias_pendencias: "Cadastro pulado pelo usuário - aguardando preenchimento"
        });

      if (error) throw error;

      toast({
        title: "Escola pulada",
        description: `${school.nome_escola} foi marcada como pendente`,
      });

      // Avançar para próxima escola
      if (currentIndex < schools.length - 1) {
        setCurrentIndex(currentIndex + 1);
        resetForm();
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error skipping:", error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < schools.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditing(false);
    }
  };

  const addCadastro = () => {
    setCadastros([...cadastros, {
      cadastro: "",
      medidor: "",
      consumo_kwh: "",
      numero_dias: "",
      utilizado: "",
      demanda_kwh: "",
      tipo_instalacao: "",
      data_leitura_anterior: "",
      data_leitura_atual: "",
      data_vencimento: "",
      valor: "",
      retencao_irrf: ""
    }]);
  };

  const removeCadastro = (index: number) => {
    if (cadastros.length > 1) {
      setCadastros(cadastros.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return <div className="text-center py-12">Carregando escolas...</div>;
  }

  if (schools.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Nenhuma escola cadastrada. Por favor, cadastre escolas primeiro.
        </p>
      </Card>
    );
  }

  const currentSchool = schools[currentIndex];

  const isSchoolAlreadyFilled = !!recordId;

  return (
    <div className="space-y-6">
      {isSchoolAlreadyFilled && (
        <Alert className="bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Escola já cadastrada anteriormente</strong> - Você pode editar os dados se necessário.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              Escola {currentIndex + 1} de {schools.length}
            </h2>
            <p className="text-muted-foreground">
              Mês de Referência: {selectedMonth}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Dados da Escola (preenchidos automaticamente) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label>Nome da Escola</Label>
              <Input value={currentSchool?.nome_escola || ""} disabled />
            </div>
            <div>
              <Label>Proprietário</Label>
              <Input value={currentSchool?.proprietario || ""} disabled />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={currentSchool?.endereco_completo || ""} disabled />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={currentSchool?.numero || ""} disabled />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={currentSchool?.bairro || ""} disabled />
            </div>
            <div>
              <Label>Macrorregião</Label>
              <Input value={currentSchool?.macroregiao || ""} disabled />
            </div>
          </div>

          {/* Cadastros */}
          {cadastros.map((cadastro, index) => (
            <Card key={index} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Cadastro {index + 1}</h3>
                {cadastros.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeCadastro(index)}>
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cadastro *</Label>
                  <Input
                    value={cadastro.cadastro}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].cadastro = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Medidor</Label>
                  <Input
                    value={cadastro.medidor}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].medidor = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Consumo (kWh)</Label>
                  <Input
                    type="number"
                    value={cadastro.consumo_kwh}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].consumo_kwh = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Nº de Dias</Label>
                  <Input
                    type="number"
                    value={cadastro.numero_dias}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].numero_dias = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Utilizado</Label>
                  <Input
                    value={cadastro.utilizado}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].utilizado = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Demanda (kWh)</Label>
                  <Input
                    type="number"
                    value={cadastro.demanda_kwh}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].demanda_kwh = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Tipo de Instalação</Label>
                  <Select
                    value={cadastro.tipo_instalacao}
                    onValueChange={(value) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].tipo_instalacao = value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BAIXA">BAIXA</SelectItem>
                      <SelectItem value="MÉDIA/ALTA">MÉDIA/ALTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Leitura Anterior</Label>
                  <Input
                    type="date"
                    value={cadastro.data_leitura_anterior}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].data_leitura_anterior = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Data Leitura Atual</Label>
                  <Input
                    type="date"
                    value={cadastro.data_leitura_atual}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].data_leitura_atual = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Data Vencimento</Label>
                  <Input
                    type="date"
                    value={cadastro.data_vencimento}
                    onChange={(e) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].data_vencimento = e.target.value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Valor (R$)</Label>
                  <CurrencyInput
                    value={cadastro.valor}
                    onValueChange={(value) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].valor = value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
                <div>
                  <Label>Retenção IRRF (R$)</Label>
                  <CurrencyInput
                    value={cadastro.retencao_irrf}
                    onValueChange={(value) => {
                      const newCadastros = [...cadastros];
                      newCadastros[index].retencao_irrf = value;
                      setCadastros(newCadastros);
                    }}
                    disabled={isSchoolAlreadyFilled && !isEditing}
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={addCadastro}>
            + Adicionar mais um número de cadastro
          </Button>

          {/* Valor Total */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <Label className="text-lg font-bold">Valor Total</Label>
            <p className="text-2xl font-bold text-primary">
              {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          {/* Outros campos */}
          <div className="space-y-4">
            <div>
              <Label>Descrição dos Serviços</Label>
              <Textarea
                value={descricaoServicos}
                onChange={(e) => setDescricaoServicos(e.target.value)}
                placeholder="Descreva os serviços..."
                disabled={isSchoolAlreadyFilled && !isEditing}
              />
            </div>
            <div>
              <Label>Ocorrências / Pendências</Label>
              <Textarea
                value={ocorrenciasPendencias}
                onChange={(e) => setOcorrenciasPendencias(e.target.value)}
                placeholder="Descreva ocorrências ou pendências..."
                disabled={isSchoolAlreadyFilled && !isEditing}
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              {(!isSchoolAlreadyFilled || isEditing) && (
                <Button variant="outline" onClick={handleSkip}>
                  <SkipForward className="h-4 w-4 mr-2" />
                  Pular Escola
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {isSchoolAlreadyFilled && !isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  {currentIndex < schools.length - 1 && (
                    <Button onClick={handleNext}>
                      Próxima Escola
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={handleSaveAndNext}>
                  {currentIndex < schools.length - 1 ? 'Salvar e Próxima' : 'Salvar e Finalizar'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
