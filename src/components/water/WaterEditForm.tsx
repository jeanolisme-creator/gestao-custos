import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface WaterEditFormProps {
  record: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function WaterEditForm({ record, onSave, onCancel }: WaterEditFormProps) {
  const [formData, setFormData] = useState({
    cadastros: [] as string[],
    hidrometros: [] as string[],
    consumos_m3: [] as string[],
    numeros_dias: [] as string[],
    datas_leitura_anterior: [] as string[],
    datas_leitura_atual: [] as string[],
    datas_vencimento: [] as string[],
    valores_cadastros: [] as string[],
    nome_escola: '',
    responsavel: '',
    endereco_completo: '',
    numero: '',
    bairro: '',
    macroregiao: '',
    proprietario: '',
    mes_ano_referencia: '',
    valor_servicos: '',
    descricao_servicos: '',
    ocorrencias_pendencias: ''
  });

  // Calculate total value from all cadastros
  const valorTotal = formData.valores_cadastros.reduce((sum, valor) => {
    const numericValue = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    return sum + numericValue;
  }, 0);

  useEffect(() => {
    if (record) {
      // Parse cadastros if it's stored as JSON string
      let cadastros = [''];
      if (record.cadastro) {
        try {
          const parsed = JSON.parse(record.cadastro);
          cadastros = Array.isArray(parsed) ? parsed : [record.cadastro];
        } catch {
          cadastros = [record.cadastro];
        }
      }

      // Parse arrays
      const hidrometrosArray = record.hidrometros ? JSON.parse(record.hidrometros) : [''];
      const consumosArray = record.consumos_m3 ? JSON.parse(record.consumos_m3) : [''];
      const numerosDiasArray = record.numeros_dias ? JSON.parse(record.numeros_dias) : [''];
      const datasLeituraAnteriorArray = record.datas_leitura_anterior ? JSON.parse(record.datas_leitura_anterior) : [''];
      const datasLeituraAtualArray = record.datas_leitura_atual ? JSON.parse(record.datas_leitura_atual) : [''];
      const datasVencimentoArray = record.datas_vencimento ? JSON.parse(record.datas_vencimento) : [''];
      
      // Parse valores_cadastros
      let valoresArray = [];
      try {
        if (record.valores_cadastros) {
          const parsed = JSON.parse(record.valores_cadastros as string);
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

      const valoresFormatted = cadastros.map((_, index) => {
        const valor = valoresArray[index];
        return valor ? formatCurrency(valor) : '';
      });

      const valorServicos = record.valor_servicos ? formatCurrency(record.valor_servicos) : '';

      setFormData({
        cadastros,
        hidrometros: hidrometrosArray,
        consumos_m3: consumosArray.map((c: any) => c?.toString() || ''),
        numeros_dias: numerosDiasArray.map((n: any) => n?.toString() || ''),
        datas_leitura_anterior: datasLeituraAnteriorArray,
        datas_leitura_atual: datasLeituraAtualArray,
        datas_vencimento: datasVencimentoArray,
        valores_cadastros: valoresFormatted,
        nome_escola: record.nome_escola || '',
        responsavel: record.responsavel || '',
        endereco_completo: record.endereco_completo || '',
        numero: record.numero || '',
        bairro: record.bairro || '',
        macroregiao: record.macroregiao || '',
        proprietario: record.proprietario || '',
        mes_ano_referencia: record.mes_ano_referencia || '',
        valor_servicos: valorServicos,
        descricao_servicos: record.descricao_servicos || '',
        ocorrencias_pendencias: record.ocorrencias_pendencias || ''
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert valores_cadastros to numeric array
    const valoresNumeric = formData.valores_cadastros.map(valor => {
      const numericValue = parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
      return numericValue || 0;
    });

    // Convert valor_servicos
    let valorServicosNumeric = null;
    if (formData.valor_servicos) {
      valorServicosNumeric = parseFloat(formData.valor_servicos.replace(/[R$\s.]/g, '').replace(',', '.'));
    }

    const updatedData: any = {
      cadastro: JSON.stringify(formData.cadastros.filter(c => c.trim() !== '')),
      hidrometros: JSON.stringify(formData.hidrometros),
      consumos_m3: JSON.stringify(formData.consumos_m3.map(c => parseFloat(c) || 0)),
      numeros_dias: JSON.stringify(formData.numeros_dias.map(n => parseInt(n) || 0)),
      datas_leitura_anterior: JSON.stringify(formData.datas_leitura_anterior),
      datas_leitura_atual: JSON.stringify(formData.datas_leitura_atual),
      datas_vencimento: JSON.stringify(formData.datas_vencimento),
      valores_cadastros: JSON.stringify(valoresNumeric),
      nome_escola: formData.nome_escola,
      responsavel: formData.responsavel,
      endereco_completo: formData.endereco_completo,
      numero: formData.numero,
      bairro: formData.bairro,
      macroregiao: formData.macroregiao,
      proprietario: formData.proprietario,
      mes_ano_referencia: formData.mes_ano_referencia,
      descricao_servicos: formData.descricao_servicos,
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      valor_gasto: valoresNumeric.reduce((sum, val) => sum + val, 0),
      valor_servicos: valorServicosNumeric
    };

    // Fill singular fields with first value from arrays for compatibility
    if (formData.hidrometros[0]) updatedData.hidrometro = formData.hidrometros[0];
    if (formData.consumos_m3[0]) updatedData.consumo_m3 = parseFloat(formData.consumos_m3[0]) || null;
    if (formData.numeros_dias[0]) updatedData.numero_dias = parseInt(formData.numeros_dias[0]) || null;
    if (formData.datas_leitura_anterior[0]) updatedData.data_leitura_anterior = formData.datas_leitura_anterior[0];
    if (formData.datas_leitura_atual[0]) updatedData.data_leitura_atual = formData.datas_leitura_atual[0];
    if (formData.datas_vencimento[0]) updatedData.data_vencimento = formData.datas_vencimento[0];

    onSave(updatedData);
  };

  const addCadastro = () => {
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

  const removeCadastro = (index: number) => {
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

  const updateCadastro = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      cadastros: prev.cadastros.map((c, i) => i === index ? value : c)
    }));
  };

  const updateHidrometro = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      hidrometros: prev.hidrometros.map((h, i) => i === index ? value : h)
    }));
  };

  const updateConsumo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      consumos_m3: prev.consumos_m3.map((c, i) => i === index ? value : c)
    }));
  };

  const updateNumeroDias = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      numeros_dias: prev.numeros_dias.map((n, i) => i === index ? value : n)
    }));
  };

  const updateDataLeituraAnterior = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      datas_leitura_anterior: prev.datas_leitura_anterior.map((d, i) => i === index ? value : d)
    }));
  };

  const updateDataLeituraAtual = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      datas_leitura_atual: prev.datas_leitura_atual.map((d, i) => i === index ? value : d)
    }));
  };

  const updateDataVencimento = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      datas_vencimento: prev.datas_vencimento.map((d, i) => i === index ? value : d)
    }));
  };

  const updateValorCadastro = (index: number, formatted: string) => {
    setFormData(prev => ({
      ...prev,
      valores_cadastros: prev.valores_cadastros.map((v, i) => i === index ? formatted : v)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <Label>Cadastros *</Label>
          {formData.cadastros.map((cadastro, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Cadastro {index + 1}</h4>
                {formData.cadastros.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCadastro(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Número do Cadastro *</Label>
                  <Input
                    required
                    value={cadastro}
                    onChange={(e) => updateCadastro(index, e.target.value)}
                    placeholder="Número do cadastro"
                  />
                </div>
                
                <div>
                  <Label>Hidrômetro</Label>
                  <Input
                    value={formData.hidrometros[index] || ''}
                    onChange={(e) => updateHidrometro(index, e.target.value)}
                    placeholder="Número do hidrômetro"
                  />
                </div>
                
                <div>
                  <Label>Consumo (m³)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.consumos_m3[index] || ''}
                    onChange={(e) => updateConsumo(index, e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Nº de Dias</Label>
                  <Input
                    type="number"
                    value={formData.numeros_dias[index] || ''}
                    onChange={(e) => updateNumeroDias(index, e.target.value)}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label>Data Leitura Anterior</Label>
                  <Input
                    type="date"
                    value={formData.datas_leitura_anterior[index] || ''}
                    onChange={(e) => updateDataLeituraAnterior(index, e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Data Leitura Atual</Label>
                  <Input
                    type="date"
                    value={formData.datas_leitura_atual[index] || ''}
                    onChange={(e) => updateDataLeituraAtual(index, e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Data Vencimento</Label>
                  <Input
                    type="date"
                    value={formData.datas_vencimento[index] || ''}
                    onChange={(e) => updateDataVencimento(index, e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Valor (R$)</Label>
                  <CurrencyInput
                    value={formData.valores_cadastros[index] || ''}
                    onValueChange={(value) => updateValorCadastro(index, value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCadastro}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar mais um número de cadastro
          </Button>

          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-base font-semibold">Valor Total: R$ {valorTotal.toFixed(2).replace('.', ',')}</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome da Escola *</Label>
            <Input
              required
              value={formData.nome_escola}
              onChange={(e) => setFormData({ ...formData, nome_escola: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Mês/Ano Referência *</Label>
            <Input
              required
              value={formData.mes_ano_referencia}
              onChange={(e) => setFormData({ ...formData, mes_ano_referencia: e.target.value })}
              placeholder="Janeiro/2025"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor Serviços</Label>
            <CurrencyInput
              value={formData.valor_servicos}
              onValueChange={(value) => setFormData({ ...formData, valor_servicos: value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Input
              value={formData.responsavel}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Endereço Completo</Label>
            <Input
              value={formData.endereco_completo}
              onChange={(e) => setFormData({ ...formData, endereco_completo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Número</Label>
            <Input
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Macrorregião</Label>
            <Input
              value={formData.macroregiao}
              onChange={(e) => setFormData({ ...formData, macroregiao: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Proprietário</Label>
            <Input
              value={formData.proprietario}
              onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Descrição de Serviços</Label>
            <Textarea
              value={formData.descricao_servicos}
              onChange={(e) => setFormData({ ...formData, descricao_servicos: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Ocorrências/Pendências</Label>
            <Textarea
              value={formData.ocorrencias_pendencias}
              onChange={(e) => setFormData({ ...formData, ocorrencias_pendencias: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
