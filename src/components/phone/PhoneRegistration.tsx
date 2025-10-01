import { useState } from 'react';
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
import { Search } from 'lucide-react';

const macroregiaoOptions = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];

export function PhoneRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { schools } = useSchools();
  
  const [formData, setFormData] = useState({
    cadastro_cliente: '',
    proprietario: '',
    nome_escola: '',
    numero_linha: '',
    valor_gasto: '',
    data_vencimento: '',
    endereco: '',
    numero: '',
    bairro: '',
    macroregiao: '',
    ocorrencias_pendencias: ''
  });
  
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');

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
    setShowSchoolSearch(false);
    setSearchSchoolTerm('');
  };

  const filteredSchools = schools.filter(school =>
    school.nome_escola.toLowerCase().includes(searchSchoolTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      cadastro_cliente: '',
      proprietario: '',
      nome_escola: '',
      numero_linha: '',
      valor_gasto: '',
      data_vencimento: '',
      endereco: '',
      numero: '',
      bairro: '',
      macroregiao: '',
      ocorrencias_pendencias: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const submitData: any = { 
      user_id: user.id,
      cadastro_cliente: formData.cadastro_cliente,
      proprietario: formData.proprietario,
      nome_escola: formData.nome_escola,
      numero_linha: formData.numero_linha,
      endereco: formData.endereco,
      numero: formData.numero,
      bairro: formData.bairro,
      macroregiao: formData.macroregiao,
      ocorrencias_pendencias: formData.ocorrencias_pendencias,
      mes_ano_referencia: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
    
    // Convert numeric fields
    if (formData.valor_gasto) submitData.valor_gasto = parseFloat(formData.valor_gasto);
    
    // Date fields
    if (formData.data_vencimento) submitData.data_vencimento = formData.data_vencimento;

    const { error } = await supabase
      .from('fixed_line_records')
      .insert([submitData]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar registro",
        description: error.message
      });
    } else {
      toast({
        title: "Registro criado com sucesso!",
        description: "O novo registro de linha fixa foi adicionado."
      });
      resetForm();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Cadastro - Gestão de Linha Fixa</CardTitle>
        <CardDescription>Preencha os dados do registro de linha fixa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School Search */}
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

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cadastro_cliente">Cadastro Cliente *</Label>
              <Input
                id="cadastro_cliente"
                value={formData.cadastro_cliente}
                onChange={(e) => handleInputChange('cadastro_cliente', e.target.value)}
                required
              />
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
              <Label htmlFor="numero_linha">Número da Linha</Label>
              <Input
                id="numero_linha"
                value={formData.numero_linha}
                onChange={(e) => handleInputChange('numero_linha', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
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
              <Label htmlFor="valor_gasto">Valor (R$)</Label>
              <CurrencyInput
                id="valor_gasto"
                value={formData.valor_gasto}
                onValueChange={(formatted, numeric) => handleInputChange('valor_gasto', numeric.toString())}
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
              <Label htmlFor="ocorrencias_pendencias">Verificar Ocorrência</Label>
              <Textarea
                id="ocorrencias_pendencias"
                value={formData.ocorrencias_pendencias}
                onChange={(e) => handleInputChange('ocorrencias_pendencias', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Limpar
            </Button>
            <Button type="submit">
              Salvar Registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
