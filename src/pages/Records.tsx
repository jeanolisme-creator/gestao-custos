import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SchoolRecord {
  id: string;
  cadastro: string;
  nome_escola: string;
  responsavel: string;
  hidrometro: string;
  endereco_completo: string;
  mes_ano_referencia: string;
  data_vencimento: string;
  consumo_m3: number;
  valor_gasto: number;
  valor_servicos: number;
  numero_dias: number;
  descricao_servicos: string;
  ocorrencias_pendencias: string;
  created_at: string;
}

export default function Records() {
  const [records, setRecords] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    cadastro: '',
    nome_escola: '',
    responsavel: '',
    hidrometro: '',
    endereco_completo: '',
    mes_ano_referencia: '',
    data_vencimento: '',
    consumo_m3: '',
    valor_gasto: '',
    valor_servicos: '',
    numero_dias: '',
    descricao_servicos: '',
    ocorrencias_pendencias: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('school_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar registros",
        description: error.message
      });
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const { error } = await supabase
      .from('school_records')
      .insert([
        {
          user_id: user.id,
          cadastro: formData.cadastro,
          nome_escola: formData.nome_escola,
          responsavel: formData.responsavel,
          hidrometro: formData.hidrometro,
          endereco_completo: formData.endereco_completo,
          mes_ano_referencia: formData.mes_ano_referencia,
          data_vencimento: formData.data_vencimento || null,
          consumo_m3: formData.consumo_m3 ? parseFloat(formData.consumo_m3) : null,
          valor_gasto: formData.valor_gasto ? parseFloat(formData.valor_gasto) : null,
          valor_servicos: formData.valor_servicos ? parseFloat(formData.valor_servicos) : null,
          numero_dias: formData.numero_dias ? parseInt(formData.numero_dias) : null,
          descricao_servicos: formData.descricao_servicos,
          ocorrencias_pendencias: formData.ocorrencias_pendencias
        }
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar registro",
        description: error.message
      });
    } else {
      toast({
        title: "Registro criado com sucesso!",
        description: "O novo registro da escola foi adicionado."
      });
      setDialogOpen(false);
      setFormData({
        cadastro: '',
        nome_escola: '',
        responsavel: '',
        hidrometro: '',
        endereco_completo: '',
        mes_ano_referencia: '',
        data_vencimento: '',
        consumo_m3: '',
        valor_gasto: '',
        valor_servicos: '',
        numero_dias: '',
        descricao_servicos: '',
        ocorrencias_pendencias: ''
      });
      fetchRecords();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="p-8">Carregando registros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Registros das Escolas</h1>
          <p className="text-muted-foreground">Gerencie os registros de consumo das escolas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Registro de Escola</DialogTitle>
              <DialogDescription>
                Preencha os dados do registro da escola.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="nome_escola">Nome da Escola *</Label>
                  <Input
                    id="nome_escola"
                    value={formData.nome_escola}
                    onChange={(e) => handleInputChange('nome_escola', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
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
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="endereco_completo">Endereço Completo</Label>
                  <Input
                    id="endereco_completo"
                    value={formData.endereco_completo}
                    onChange={(e) => handleInputChange('endereco_completo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mes_ano_referencia">Mês/Ano de Referência *</Label>
                  <Input
                    id="mes_ano_referencia"
                    placeholder="Ex: Janeiro/2024"
                    value={formData.mes_ano_referencia}
                    onChange={(e) => handleInputChange('mes_ano_referencia', e.target.value)}
                    required
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
                  <Label htmlFor="valor_gasto">Valor Gasto (R$)</Label>
                  <Input
                    id="valor_gasto"
                    type="number"
                    step="0.01"
                    value={formData.valor_gasto}
                    onChange={(e) => handleInputChange('valor_gasto', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_servicos">Valor de Serviços (R$)</Label>
                  <Input
                    id="valor_servicos"
                    type="number"
                    step="0.01"
                    value={formData.valor_servicos}
                    onChange={(e) => handleInputChange('valor_servicos', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_dias">Número de Dias</Label>
                  <Input
                    id="numero_dias"
                    type="number"
                    value={formData.numero_dias}
                    onChange={(e) => handleInputChange('numero_dias', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="descricao_servicos">Descrição de Serviços</Label>
                  <Textarea
                    id="descricao_servicos"
                    value={formData.descricao_servicos}
                    onChange={(e) => handleInputChange('descricao_servicos', e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="ocorrencias_pendencias">Ocorrências/Pendências</Label>
                  <Textarea
                    id="ocorrencias_pendencias"
                    value={formData.ocorrencias_pendencias}
                    onChange={(e) => handleInputChange('ocorrencias_pendencias', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Registro</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Registros</CardTitle>
          <CardDescription>
            Todos os registros de consumo das escolas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado. Clique em "Novo Registro" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Nome da Escola</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Mês/Ano</TableHead>
                    <TableHead>Consumo (m³)</TableHead>
                    <TableHead>Valor Gasto</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.cadastro}</TableCell>
                      <TableCell>{record.nome_escola}</TableCell>
                      <TableCell>{record.responsavel || '-'}</TableCell>
                      <TableCell>{record.mes_ano_referencia}</TableCell>
                      <TableCell>{record.consumo_m3 ? `${record.consumo_m3} m³` : '-'}</TableCell>
                      <TableCell>{record.valor_gasto ? `R$ ${record.valor_gasto.toFixed(2)}` : '-'}</TableCell>
                      <TableCell>{new Date(record.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}