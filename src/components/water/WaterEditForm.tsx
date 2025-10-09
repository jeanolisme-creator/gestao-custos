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
    nome_escola: '',
    responsavel: '',
    endereco_completo: '',
    numero: '',
    bairro: '',
    macroregiao: '',
    proprietario: '',
    mes_ano_referencia: '',
    consumo_m3: '',
    valor_gasto: '',
    valor_servicos: '',
    data_vencimento: '',
    numero_dias: '',
    hidrometro: '',
    descricao_servicos: '',
    ocorrencias_pendencias: ''
  });

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

      setFormData({
        cadastros,
        nome_escola: record.nome_escola || '',
        responsavel: record.responsavel || '',
        endereco_completo: record.endereco_completo || '',
        numero: record.numero || '',
        bairro: record.bairro || '',
        macroregiao: record.macroregiao || '',
        proprietario: record.proprietario || '',
        mes_ano_referencia: record.mes_ano_referencia || '',
        consumo_m3: record.consumo_m3?.toString() || '',
        valor_gasto: record.valor_gasto?.toString() || '',
        valor_servicos: record.valor_servicos?.toString() || '',
        data_vencimento: record.data_vencimento || '',
        numero_dias: record.numero_dias?.toString() || '',
        hidrometro: record.hidrometro || '',
        descricao_servicos: record.descricao_servicos || '',
        ocorrencias_pendencias: record.ocorrencias_pendencias || ''
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData = {
      ...formData,
      cadastro: JSON.stringify(formData.cadastros.filter(c => c.trim())),
      consumo_m3: formData.consumo_m3 ? parseFloat(formData.consumo_m3) : null,
      valor_gasto: formData.valor_gasto ? parseFloat(formData.valor_gasto) : null,
      valor_servicos: formData.valor_servicos ? parseFloat(formData.valor_servicos) : null,
      numero_dias: formData.numero_dias ? parseInt(formData.numero_dias) : null,
    };

    delete (updatedData as any).cadastros;
    onSave(updatedData);
  };

  const addCadastro = () => {
    setFormData(prev => ({
      ...prev,
      cadastros: [...prev.cadastros, '']
    }));
  };

  const removeCadastro = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cadastros: prev.cadastros.filter((_, i) => i !== index)
    }));
  };

  const updateCadastro = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      cadastros: prev.cadastros.map((c, i) => i === index ? value : c)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Números de Cadastro *</Label>
          {formData.cadastros.map((cadastro, index) => (
            <div key={index} className="flex gap-2">
              <Input
                required
                value={cadastro}
                onChange={(e) => updateCadastro(index, e.target.value)}
                placeholder={`Cadastro ${index + 1}`}
              />
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
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCadastro}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar mais um número de cadastro
          </Button>
        </div>

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
          <Label>Hidrômetro</Label>
          <Input
            value={formData.hidrometro}
            onChange={(e) => setFormData({ ...formData, hidrometro: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Consumo (m³)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.consumo_m3}
            onChange={(e) => setFormData({ ...formData, consumo_m3: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Valor Gasto</Label>
          <CurrencyInput
            value={formData.valor_gasto}
            onValueChange={(value) => setFormData({ ...formData, valor_gasto: value })}
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
          <Label>Data Vencimento</Label>
          <Input
            type="date"
            value={formData.data_vencimento}
            onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Número de Dias</Label>
          <Input
            type="number"
            value={formData.numero_dias}
            onChange={(e) => setFormData({ ...formData, numero_dias: e.target.value })}
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
