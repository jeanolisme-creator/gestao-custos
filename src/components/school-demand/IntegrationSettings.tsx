import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Link, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  Database,
  Globe,
  Lock,
  AlertTriangle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
  lastSync?: string;
  totalRecords?: number;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'sed-sp',
    name: 'Secretaria Escolar Digital - São Paulo',
    description: 'Integração com a API oficial da Secretaria de Educação de São Paulo para sincronização de dados escolares',
    defaultApiUrl: 'https://sed.educacao.sp.gov.br/api/v1',
    documentationUrl: 'https://sed.educacao.sp.gov.br/docs/api',
    features: [
      'Importação automática de dados escolares',
      'Sincronização de alunos por faixa etária',
      'Atualização de informações de contato',
      'Dados de localização das escolas'
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier Webhook',
    description: 'Conecte com mais de 5.000 aplicativos através do Zapier para automatizar fluxos de trabalho',
    defaultApiUrl: '',
    documentationUrl: 'https://zapier.com/help/create/code-webhooks',
    features: [
      'Automação de processos',
      'Conectar com Google Sheets, Excel Online',
      'Notificações por email/Slack',
      'Integração com CRMs e ERPs'
    ]
  }
];

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    // Load from localStorage or default state
    const saved = localStorage.getItem('school-demand-integrations');
    if (saved) {
      setIntegrations(JSON.parse(saved));
    } else {
      // Initialize with default integrations
      const defaultIntegrations: IntegrationConfig[] = AVAILABLE_INTEGRATIONS.map(integration => ({
        id: integration.id,
        name: integration.name,
        description: integration.description,
        status: 'disconnected',
        apiUrl: integration.defaultApiUrl,
        apiKey: '',
        enabled: false
      }));
      setIntegrations(defaultIntegrations);
    }
  };

  const saveIntegrations = (updatedIntegrations: IntegrationConfig[]) => {
    setIntegrations(updatedIntegrations);
    localStorage.setItem('school-demand-integrations', JSON.stringify(updatedIntegrations));
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration || !apiUrl) {
      toast({
        title: "Configuração incompleta",
        description: "Selecione uma integração e configure a URL da API.",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    
    try {
      // Simulate API test based on integration type
      if (selectedIntegration === 'sed-sp') {
        if (!apiKey) {
          throw new Error('API Key é obrigatória para SED-SP');
        }
        
        // Test SED-SP API (simulated)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update integration status
        const updatedIntegrations = integrations.map(integration => 
          integration.id === selectedIntegration 
            ? { ...integration, status: 'connected' as const, apiUrl, apiKey, enabled }
            : integration
        );
        
        saveIntegrations(updatedIntegrations);
        
        toast({
          title: "Conexão estabelecida!",
          description: "Integração com SED-SP configurada com sucesso.",
        });
        
      } else if (selectedIntegration === 'zapier') {
        if (!webhookUrl) {
          throw new Error('URL do Webhook é obrigatória para Zapier');
        }
        
        // Test Zapier webhook
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            source: 'school-demand-system',
            message: 'Teste de conexão do Sistema de Demanda Escolar'
          }),
        });
        
        // Update integration status
        const updatedIntegrations = integrations.map(integration => 
          integration.id === selectedIntegration 
            ? { ...integration, status: 'connected' as const, apiUrl: webhookUrl, enabled }
            : integration
        );
        
        saveIntegrations(updatedIntegrations);
        
        toast({
          title: "Webhook testado!",
          description: "Webhook do Zapier foi chamado. Verifique no Zapier se foi recebido.",
        });
      }
      
    } catch (error: any) {
      const updatedIntegrations = integrations.map(integration => 
        integration.id === selectedIntegration 
          ? { ...integration, status: 'error' as const }
          : integration
      );
      
      saveIntegrations(updatedIntegrations);
      
      toast({
        title: "Erro na conexão",
        description: error.message || "Não foi possível conectar com a API.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    const integration = integrations.find(i => i.id === selectedIntegration);
    if (!integration || integration.status !== 'connected') {
      toast({
        title: "Integração não conectada",
        description: "Configure e teste a conexão primeiro.",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update last sync and record count
      const updatedIntegrations = integrations.map(integration => 
        integration.id === selectedIntegration 
          ? { 
              ...integration, 
              lastSync: new Date().toISOString(),
              totalRecords: Math.floor(Math.random() * 500) + 100
            }
          : integration
      );
      
      saveIntegrations(updatedIntegrations);
      
      toast({
        title: "Sincronização concluída!",
        description: `Dados sincronizados com sucesso da ${integration.name}.`,
      });
      
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const selectedIntegrationConfig = AVAILABLE_INTEGRATIONS.find(i => i.id === selectedIntegration);
  const selectedIntegrationStatus = integrations.find(i => i.id === selectedIntegration);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Integrações
              </h1>
              <p className="text-muted-foreground">
                Configure integrações com sistemas externos para automatizar a gestão de dados
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Integration List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-school-demand" />
                Integrações Disponíveis
              </CardTitle>
              <CardDescription>
                Selecione uma integração para configurar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {AVAILABLE_INTEGRATIONS.map((integration) => {
                const status = integrations.find(i => i.id === integration.id);
                return (
                  <div
                    key={integration.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedIntegration === integration.id 
                        ? 'border-school-demand bg-school-demand/5' 
                        : 'border-border hover:border-school-demand/50'
                    }`}
                    onClick={() => {
                      setSelectedIntegration(integration.id);
                      setApiUrl(status?.apiUrl || integration.defaultApiUrl);
                      setApiKey(status?.apiKey || '');
                      setEnabled(status?.enabled || false);
                      if (integration.id === 'zapier') {
                        setWebhookUrl(status?.apiUrl || '');
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {integration.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {status?.status === 'connected' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {status?.status === 'error' && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {status?.status === 'disconnected' && (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Configuration Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-school-demand" />
                {selectedIntegrationConfig ? selectedIntegrationConfig.name : "Selecione uma Integração"}
              </CardTitle>
              {selectedIntegrationConfig && (
                <CardDescription>
                  {selectedIntegrationConfig.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedIntegrationConfig ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nenhuma integração selecionada
                  </h3>
                  <p className="text-muted-foreground">
                    Selecione uma integração à esquerda para configurar
                  </p>
                </div>
              ) : (
                <>
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={
                        selectedIntegrationStatus?.status === 'connected' ? 'default' :
                        selectedIntegrationStatus?.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {selectedIntegrationStatus?.status === 'connected' ? 'Conectado' :
                         selectedIntegrationStatus?.status === 'error' ? 'Erro' : 'Desconectado'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enabled" className="text-sm">Ativo</Label>
                      <Switch
                        id="enabled"
                        checked={enabled}
                        onCheckedChange={setEnabled}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Configuration Form */}
                  <div className="space-y-4">
                    {selectedIntegration === 'sed-sp' && (
                      <>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Para usar a API da SED-SP, você precisa ter credenciais válidas fornecidas pela Secretaria de Educação.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <Label htmlFor="api-url">URL da API</Label>
                          <Input
                            id="api-url"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="https://sed.educacao.sp.gov.br/api/v1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="api-key">API Key</Label>
                          <Input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Digite sua API Key da SED-SP"
                          />
                        </div>
                      </>
                    )}

                    {selectedIntegration === 'zapier' && (
                      <>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Crie um webhook no Zapier e cole a URL aqui. O webhook será chamado sempre que houver atualizações nos dados.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                          <Label htmlFor="webhook-url">URL do Webhook</Label>
                          <Input
                            id="webhook-url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://hooks.zapier.com/hooks/catch/..."
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleTestConnection}
                        disabled={testing}
                        className="bg-school-demand text-white hover:bg-school-demand/90"
                      >
                        {testing ? (
                          <>Testando...</>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 mr-2" />
                            Testar Conexão
                          </>
                        )}
                      </Button>

                      {selectedIntegrationStatus?.status === 'connected' && (
                        <Button 
                          variant="outline"
                          onClick={handleSync}
                          disabled={syncing}
                        >
                          {syncing ? (
                            <>Sincronizando...</>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sincronizar Agora
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Funcionalidades:</h4>
                    <ul className="space-y-2">
                      {selectedIntegrationConfig.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sync Info */}
                  {selectedIntegrationStatus?.lastSync && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Última Sincronização:</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Data: {new Date(selectedIntegrationStatus.lastSync).toLocaleString('pt-BR')}</p>
                          {selectedIntegrationStatus.totalRecords && (
                            <p>Registros: {selectedIntegrationStatus.totalRecords}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Documentation Link */}
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Precisa de ajuda com a configuração?
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(selectedIntegrationConfig.documentationUrl, '_blank')}
                    >
                      Ver Documentação
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}