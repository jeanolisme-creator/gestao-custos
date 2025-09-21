import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExcelUpload } from './ExcelUpload';
import { GoogleDriveIntegration } from './GoogleDriveIntegration';
import { SchoolData } from '@/utils/mockData';
import { Database, FileSpreadsheet, Cloud } from 'lucide-react';

interface DataManagementProps {
  onDataUpdate: (data: SchoolData[]) => void;
  currentDataCount: number;
}

export function DataManagement({ onDataUpdate, currentDataCount }: DataManagementProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Gerenciamento de Dados
          </CardTitle>
          <CardDescription>
            Configure a fonte de dados para o dashboard. Atualmente: {currentDataCount} registros carregados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="excel" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Upload Excel
              </TabsTrigger>
              <TabsTrigger value="google-drive" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Google Drive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="excel" className="mt-6">
              <ExcelUpload onDataLoaded={onDataUpdate} />
            </TabsContent>

            <TabsContent value="google-drive" className="mt-6">
              <GoogleDriveIntegration onDataLoaded={onDataUpdate} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instruções de Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Opção 1: Upload de Excel</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Faça upload direto do arquivo .xlsx</li>
              <li>Processamento instantâneo no navegador</li>
              <li>Dados ficam salvos na sessão</li>
              <li>Ideal para testes e uso esporádico</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Opção 2: Google Drive</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Sincronização automática com Google Sheets</li>
              <li>Atualizações em tempo real</li>
              <li>Colaboração em equipe</li>
              <li>Requer configuração de API</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Recomendação: Supabase + Edge Functions</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Processamento seguro no backend</li>
              <li>Webhooks para atualizações automáticas</li>
              <li>Armazenamento confiável</li>
              <li>Melhor performance e segurança</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}