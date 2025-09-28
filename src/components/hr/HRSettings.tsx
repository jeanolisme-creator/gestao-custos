import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw, Shield, Bell, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HRSystemSettings {
  systemName: string;
  currentSchoolYear: string;
  costPerStudentTarget: number;
  costLimitPercentage: number;
  autoCalculations: boolean;
  emailNotifications: boolean;
  backupFrequency: string;
  dataRetentionYears: number;
  reportFormat: string;
  currency: string;
  theme: string;
}

const defaultSettings: HRSystemSettings = {
  systemName: 'Sistema de Gestão de RH - Secretaria de Educação',
  currentSchoolYear: '2025',
  costPerStudentTarget: 350.00,
  costLimitPercentage: 15,
  autoCalculations: true,
  emailNotifications: true,
  backupFrequency: 'daily',
  dataRetentionYears: 7,
  reportFormat: 'pdf',
  currency: 'BRL',
  theme: 'system'
};

export function HRSettings() {
  const [settings, setSettings] = useState<HRSystemSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleSettingChange = (key: keyof HRSystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend/database
    console.log('Saving HR settings:', settings);
    
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso."
    });
    
    setHasChanges(false);
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    
    toast({
      title: "Configurações restauradas",
      description: "As configurações padrão foram restauradas."
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configurações do Sistema</h2>
          <p className="text-muted-foreground">Configure as preferências e parâmetros do sistema de RH</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nome do Sistema</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => handleSettingChange('systemName', e.target.value)}
                placeholder="Nome do sistema"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolYear">Ano Letivo Vigente</Label>
              <Select 
                value={settings.currentSchoolYear} 
                onValueChange={(value) => handleSettingChange('currentSchoolYear', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costTarget">Custo por Aluno Meta (R$)</Label>
              <Input
                id="costTarget"
                type="number"
                step="0.01"
                value={settings.costPerStudentTarget}
                onChange={(e) => handleSettingChange('costPerStudentTarget', parseFloat(e.target.value))}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Meta atual: {formatCurrency(settings.costPerStudentTarget)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costLimit">Limite de Custos (%)</Label>
              <Input
                id="costLimit"
                type="number"
                min="0"
                max="100"
                value={settings.costLimitPercentage}
                onChange={(e) => handleSettingChange('costLimitPercentage', parseInt(e.target.value))}
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">
                Alerta quando custo exceder {settings.costLimitPercentage}% da meta
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Automation & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Automação & Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cálculos Automáticos</Label>
                <p className="text-xs text-muted-foreground">
                  Calcular custos e métricas automaticamente
                </p>
              </div>
              <Switch
                checked={settings.autoCalculations}
                onCheckedChange={(checked) => handleSettingChange('autoCalculations', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-xs text-muted-foreground">
                  Receber alertas e relatórios por email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Frequência de Backup</Label>
              <Select 
                value={settings.backupFrequency} 
                onValueChange={(value) => handleSettingChange('backupFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention">Retenção de Dados (anos)</Label>
              <Input
                id="retention"
                type="number"
                min="1"
                max="20"
                value={settings.dataRetentionYears}
                onChange={(e) => handleSettingChange('dataRetentionYears', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display & Format Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Exibição & Formato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Formato Padrão de Relatórios</Label>
              <Select 
                value={settings.reportFormat} 
                onValueChange={(value) => handleSettingChange('reportFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Moeda</Label>
              <Select 
                value={settings.currency} 
                onValueChange={(value) => handleSettingChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tema do Sistema</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Versão</p>
                <p className="font-mono">v2.1.0</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Última Atualização</p>
                <p>28/09/2024</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Banco de Dados</p>
                <p>PostgreSQL 14.2</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Último Backup</p>
                <p>Hoje, 03:00</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Estatísticas de Uso</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Servidores:</span>
                  <span className="font-medium">1.247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Folhas Processadas:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relatórios Gerados:</span>
                  <span className="font-medium">348</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Espaço Utilizado:</span>
                  <span className="font-medium">2.4 GB</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="p-4 bg-primary text-primary-foreground">
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <p className="font-medium">Alterações não salvas</p>
                <p className="text-xs opacity-90">Clique em "Salvar Alterações" para aplicar</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}