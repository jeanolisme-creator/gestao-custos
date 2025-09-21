import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Cloud, Key, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface GoogleDriveIntegrationProps {
  onDataLoaded: (data: any[]) => void;
}

export function GoogleDriveIntegration({ onDataLoaded }: GoogleDriveIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const { toast } = useToast();

  const connectToGoogleDrive = async () => {
    if (!apiKey) {
      toast({
        title: "API Key necessária",
        description: "Por favor, insira sua Google API Key",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Teste de conexão com Google Sheets API
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${apiKey}`
      );

      if (response.ok) {
        setIsConnected(true);
        localStorage.setItem('googleApiKey', apiKey);
        localStorage.setItem('spreadsheetId', spreadsheetId);
        toast({
          title: "Conectado com sucesso!",
          description: "Conexão com Google Drive estabelecida",
        });
      } else {
        throw new Error('Falha na conexão');
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Verifique sua API Key e ID da planilha",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const syncData = async () => {
    if (!isConnected) return;

    setIsConnecting(true);
    try {
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];

      const allData: any[] = [];

      for (const month of months) {
        try {
          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${month}?key=${apiKey}`
          );

          if (response.ok) {
            const result = await response.json();
            const rows = result.values || [];
            
            if (rows.length > 1) {
              const headers = rows[0];
              for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const rowData: any = { mes: month, ano: 2025 };
                
                headers.forEach((header: string, index: number) => {
                  const normalizedHeader = header.toLowerCase().trim();
                  if (normalizedHeader.includes('cadastro')) rowData.cadastro = row[index] || '';
                  if (normalizedHeader.includes('unidade')) rowData.unidade = row[index] || '';
                  if (normalizedHeader.includes('consumo')) rowData.consumo = parseFloat(row[index]) || 0;
                  if (normalizedHeader === 'valor') rowData.valor = parseFloat(row[index]) || 0;
                  // ... adicionar outros campos
                });
                
                if (rowData.cadastro) {
                  allData.push(rowData);
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Erro ao processar aba ${month}:`, error);
        }
      }

      if (allData.length > 0) {
        onDataLoaded(allData);
        toast({
          title: "Dados sincronizados!",
          description: `${allData.length} registros atualizados`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Integração Google Drive
        </CardTitle>
        <CardDescription>
          Conecte-se ao Google Sheets para sincronização automática
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="api-key">Google API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Insira sua Google API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="spreadsheet-id">ID da Planilha</Label>
            <Input
              id="spreadsheet-id"
              placeholder="ID da planilha do Google Sheets"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={connectToGoogleDrive} 
            disabled={isConnecting || !apiKey || !spreadsheetId}
            className="flex-1"
          >
            {isConnecting ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : isConnected ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <Key className="mr-2 h-4 w-4" />
            )}
            {isConnected ? 'Conectado' : 'Conectar'}
          </Button>

          {isConnected && (
            <Button onClick={syncData} disabled={isConnecting} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Como configurar:</strong></p>
          <p>1. Crie uma API Key no Google Cloud Console</p>
          <p>2. Ative a Google Sheets API</p>
          <p>3. Copie o ID da sua planilha (da URL)</p>
          <p>4. A planilha deve ter abas nomeadas por mês</p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Dica:</strong> Para maior segurança, considere usar Supabase Edge Functions 
            para processar dados no backend
          </p>
        </div>
      </CardContent>
    </Card>
  );
}