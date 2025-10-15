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
import { ArrowLeft, ArrowRight, Edit, SkipForward } from "lucide-react";
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
  }, [currentIndex, schools]);

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
      
      if (data) {
        setRecordId(data.id);
        // Preencher os dados existentes para edição
        const formatCurrency = (value: number | null) => {
          if (!value) return "";
          return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        const existingCadastros = [{
          cadastro: data.cadastro_cliente || "",
          medidor: data.relogio || "",
          consumo_kwh: data.consumo_kwh?.toString() || "",
          numero_dias: data.numero_dias?.toString() || "",
          utilizado: data.responsavel || "",
          demanda_kwh: data.demanda_kwh?.toString() || "",
          tipo_instalacao: data.tipo_instalacao || "",
          data_leitura_anterior: data.data_leitura_anterior || "",
          data_leitura_atual: data.data_leitura_atual || "",
          data_vencimento: data.data_vencimento || "",
          valor: formatCurrency(data.valor_gasto),
          retencao_irrf: formatCurrency(data.retencao_irrf)
        }];
        setCadastros(existingCadastros);
        setDescricaoServicos(data.descricao_servicos || "");
        setOcorrenciasPendencias(data.ocorrencias_pendencias || "");
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
        resetForm();
      } else {
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
      resetForm();
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

  return (
    <div className="space-y-6">
      {recordId && (
        <Alert>
          <AlertDescription>
            ℹ️ Editando dados salvos anteriormente - {selectedMonth}
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
              />
            </div>
            <div>
              <Label>Ocorrências / Pendências</Label>
              <Textarea
                value={ocorrenciasPendencias}
                onChange={(e) => setOcorrenciasPendencias(e.target.value)}
                placeholder="Descreva ocorrências ou pendências..."
              />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handleSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Pular Escola
            </Button>

            <div className="flex gap-2">
              <Button onClick={handleSaveAndNext}>
                {recordId ? "Salvar e Próxima" : "Próxima Escola"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
