import { useState, useEffect } from 'react';
import { Plus, Droplets, Zap, Phone, Smartphone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type SystemType = 'water' | 'energy' | 'fixed-line' | 'mobile';

interface SystemConfig {
  name: string;
  icon: any;
  color: string;
  table: string;
  fields: string[];
}

const systemConfigs: Record<SystemType, SystemConfig> = {
  water: {
    name: 'Gestão de Água',
    icon: Droplets,
    color: 'text-water',
    table: 'school_records',
    fields: ['cadastro', 'proprietario', 'nome_escola', 'data_leitura_anterior', 'data_leitura_atual', 'valor_gasto', 'data_vencimento', 'endereco_completo', 'numero', 'bairro', 'consumo_m3', 'numero_dias', 'hidrometro', 'descricao_servicos', 'valor_servicos', 'macroregiao', 'ocorrencias_pendencias']
  },
  energy: {
    name: 'Gestão de Energia',
    icon: Zap,
    color: 'text-energy',
    table: 'energy_records',
    fields: ['cadastro_cliente', 'proprietario', 'nome_escola', 'data_leitura_anterior', 'data_leitura_atual', 'valor_gasto', 'data_vencimento', 'endereco', 'numero', 'bairro', 'consumo_kwh', 'numero_dias', 'tipo_instalacao', 'relogio', 'demanda_kwh', 'utilizado', 'mes_ano_referencia', 'macroregiao', 'ocorrencias_pendencias']
  },
  'fixed-line': {
    name: 'Gestão de Linha Fixa',
    icon: Phone,
    color: 'text-fixed-line',
    table: 'fixed_line_records',
    fields: ['cadastro_cliente', 'proprietario', 'nome_escola', 'numero_linha', 'valor_gasto', 'data_vencimento', 'endereco', 'numero', 'bairro', 'macroregiao', 'ocorrencias_pendencias']
  },
  mobile: {
    name: 'Gestão de Celular',
    icon: Smartphone,
    color: 'text-mobile',
    table: 'mobile_records',
    fields: ['cadastro_cliente', 'proprietario', 'nome_escola', 'numero_linha', 'valor_gasto', 'data_vencimento', 'endereco', 'numero', 'bairro', 'macroregiao', 'ocorrencias_pendencias']
  }
};

const fieldLabels: Record<string, string> = {
  cadastro: 'Cadastro',
  cadastro_cliente: 'Cadastro Cliente',
  proprietario: 'Proprietário',
  nome_escola: 'Nome da Escola',
  data_leitura_anterior: 'Data Leitura Anterior',
  data_leitura_atual: 'Data Leitura Atual',
  valor_gasto: 'Valor (R$)',
  data_vencimento: 'Vencimento',
  endereco: 'Endereço',
  endereco_completo: 'Endereço Completo',
  numero: 'Número',
  bairro: 'Bairro',
  consumo_m3: 'Consumo (m³)',
  consumo_kwh: 'Consumo (kWh)',
  numero_dias: 'Nº de Dias',
  hidrometro: 'Hidrômetro',
  tipo_instalacao: 'Instalação',
  relogio: 'Medidor',
  demanda_kwh: 'Demanda (kWh)',
  utilizado: 'Utilizado',
  mes_ano_referencia: 'Referência',
  numero_linha: 'Número da Linha',
  descricao_servicos: 'Serviços',
  valor_servicos: 'Valor dos Serviços',
  macroregiao: 'Macroregião',
  ocorrencias_pendencias: 'Verificar Ocorrência'
};

const macroregiaoOptions = ['HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'];

// Mock school data for search
const mockSchools = [
  {
    name: 'EMEF João Silva',
    cadastro: 'WATER-1001',
    proprietario: 'Prefeitura Municipal',
    endereco: 'Rua das Flores, 123',
    numero: '123',
    bairro: 'Centro'
  },
  {
    name: 'EMEI Maria Santos',
    cadastro: 'WATER-1002', 
    proprietario: 'Prefeitura Municipal',
    endereco: 'Av. Brasil, 456',
    numero: '456',
    bairro: 'Jardim das Rosas'
  },
  {
    name: 'EMEIF Pedro Costa',
    cadastro: 'WATER-1003',
    proprietario: 'Prefeitura Municipal',
    endereco: 'Rua da Escola, 789',
    numero: '789', 
    bairro: 'Vila Nova'
  }
];

export default function Records() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const systemParam = urlParams.get('system') as SystemType || 'water';
  
  const [currentSystem, setCurrentSystem] = useState<SystemType>(systemParam);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [prefillSchool, setPrefillSchool] = useState<string>('');
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [searchSchoolTerm, setSearchSchoolTerm] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const config = systemConfigs[currentSystem];
  const Icon = config.icon;

  useEffect(() => {
    const newSystem = urlParams.get('system') as SystemType || 'water';
    setCurrentSystem(newSystem);
    resetForm();
  }, [location.search]);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, currentSystem]);

  const resetForm = () => {
    const initialFormData: Record<string, string> = {};
    config.fields.forEach(field => {
      initialFormData[field] = '';
    });
    setFormData(initialFormData);
  };

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(config.table as any)
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

    const submitData: any = { user_id: user.id };
    
    // Convert form data to appropriate types
    config.fields.forEach(field => {
      const value = formData[field];
      if (value) {
        if (field.includes('valor') || field.includes('consumo') || field.includes('demanda')) {
          submitData[field] = parseFloat(value);
        } else if (field === 'numero_dias') {
          submitData[field] = parseInt(value);
        } else if (field.includes('data_')) {
          submitData[field] = value || null;
        } else {
          submitData[field] = value;
        }
      }
    });

    // Add required fields that might be missing
    if (!submitData.mes_ano_referencia && currentSystem !== 'water') {
      submitData.mes_ano_referencia = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    const { error } = await supabase
      .from(config.table as any)
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
        description: `O novo registro de ${config.name.toLowerCase()} foi adicionado.`
      });
      setDialogOpen(false);
      resetForm();
      fetchRecords();
    }
  };

  const handleSchoolSelect = (school: any) => {
    const newFormData = { ...formData };
    
    // Auto-fill common fields
    newFormData['cadastro'] = school.cadastro;
    newFormData['cadastro_cliente'] = school.cadastro;
    newFormData['proprietario'] = school.proprietario;
    newFormData['nome_escola'] = school.name;
    newFormData['endereco'] = school.endereco;
    newFormData['endereco_completo'] = school.endereco;
    newFormData['numero'] = school.numero;
    newFormData['bairro'] = school.bairro;
    
    setFormData(newFormData);
    setShowSchoolSearch(false);
    setSearchSchoolTerm('');
  };

  const filteredSchools = mockSchools.filter(school =>
    school.name.toLowerCase().includes(searchSchoolTerm.toLowerCase())
  );

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
      {/* System Selector */}
      <Card className="p-4 bg-gradient-card border-border shadow-card">
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(systemConfigs).map(([systemId, sysConfig]) => {
            const SysIcon = sysConfig.icon;
            const isActive = currentSystem === systemId;
            
            return (
              <Button
                key={systemId}
                onClick={() => {
                  setCurrentSystem(systemId as SystemType);
                  window.history.pushState({}, '', `/records?system=${systemId}`);
                  resetForm();
                }}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all duration-300",
                  isActive && [
                    systemId === 'water' && 'bg-water text-white hover:bg-water/90',
                    systemId === 'energy' && 'bg-energy text-white hover:bg-energy/90',
                    systemId === 'fixed-line' && 'bg-fixed-line text-white hover:bg-fixed-line/90',
                    systemId === 'mobile' && 'bg-mobile text-white hover:bg-mobile/90',
                  ],
                  !isActive && [
                    systemId === 'water' && 'border-water/30 text-water hover:bg-water/10',
                    systemId === 'energy' && 'border-energy/30 text-energy hover:bg-energy/10',
                    systemId === 'fixed-line' && 'border-fixed-line/30 text-fixed-line hover:bg-fixed-line/10',
                    systemId === 'mobile' && 'border-mobile/30 text-mobile hover:bg-mobile/10',
                  ]
                )}
              >
                <SysIcon className="h-4 w-4 mr-2" />
                {sysConfig.name}
              </Button>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Icon className={cn("h-8 w-8", config.color)} />
            {config.name}
          </h1>
          <p className="text-muted-foreground">Gerencie os registros de {config.name.toLowerCase()}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Registro - {config.name}</DialogTitle>
              <DialogDescription>
                Preencha os dados do registro de {config.name.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* School Search Button */}
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
                        {filteredSchools.map((school, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-muted/80 border-b last:border-b-0"
                            onClick={() => handleSchoolSelect(school)}
                          >
                            <p className="font-medium">{school.name}</p>
                            <p className="text-sm text-muted-foreground">{school.endereco}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {config.fields.map(field => {
                  const isTextarea = field.includes('servicos') || field.includes('ocorrencias');
                  const isDate = field.includes('data_') || field === 'data_vencimento';
                  const isNumber = field.includes('valor') || field.includes('consumo') || field.includes('demanda') || field === 'numero_dias';
                  const isRequired = ['cadastro', 'cadastro_cliente', 'nome_escola'].includes(field);
                  const isMacroregiao = field === 'macroregiao';
                  const colSpan = isTextarea ? 'col-span-2' : '';

                  return (
                    <div key={field} className={cn("space-y-2", colSpan)}>
                      <Label htmlFor={field}>
                        {fieldLabels[field] || field} {isRequired && '*'}
                      </Label>
                      {isTextarea ? (
                        <Textarea
                          id={field}
                          value={formData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          required={isRequired}
                        />
                      ) : isMacroregiao ? (
                        <Select value={formData[field] || ''} onValueChange={(value) => handleInputChange(field, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a macrorregião" />
                          </SelectTrigger>
                          <SelectContent>
                            {macroregiaoOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field}
                          type={isDate ? 'date' : isNumber ? 'number' : 'text'}
                          step={isNumber && field.includes('valor') ? '0.01' : undefined}
                          value={formData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          required={isRequired}
                          placeholder={field === 'mes_ano_referencia' ? 'Ex: Janeiro/2024' : undefined}
                        />
                      )}
                    </div>
                  );
                })}
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
            Todos os registros de {config.name.toLowerCase()} cadastrados
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
                    <TableHead>Valor Gasto</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.cadastro || record.cadastro_cliente || '-'}
                      </TableCell>
                      <TableCell>{record.nome_escola}</TableCell>
                      <TableCell>
                        {record.valor_gasto ? `R$ ${record.valor_gasto.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(record.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
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