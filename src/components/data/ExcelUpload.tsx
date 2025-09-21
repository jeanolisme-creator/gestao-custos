import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SchoolData } from '@/utils/mockData';

interface ExcelUploadProps {
  onDataLoaded: (data: SchoolData[]) => void;
}

export function ExcelUpload({ onDataLoaded }: ExcelUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      
      const allData: SchoolData[] = [];
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];

      // Processar cada aba (mês)
      months.forEach((month, index) => {
        const monthName = month.toLowerCase();
        const worksheet = workbook.Sheets[monthName] || workbook.Sheets[month] || workbook.Sheets[`${month.charAt(0).toUpperCase()}${month.slice(1)}`];
        
        if (worksheet) {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const headers = jsonData[0] as string[];
          
          // Mapear colunas
          const columnMap: { [key: string]: number } = {};
          headers.forEach((header, idx) => {
            const normalizedHeader = header.toString().toLowerCase().trim();
            if (normalizedHeader.includes('cadastro')) columnMap.cadastro = idx;
            if (normalizedHeader.includes('proprietario')) columnMap.proprietario = idx;
            if (normalizedHeader.includes('unidade')) columnMap.unidade = idx;
            if (normalizedHeader.includes('local')) columnMap.local = idx;
            if (normalizedHeader.includes('leit ant')) columnMap.dtaLeitAnt = idx;
            if (normalizedHeader.includes('leit atual')) columnMap.dtaLeitAtual = idx;
            if (normalizedHeader === 'valor') columnMap.valor = idx;
            if (normalizedHeader.includes('vencto')) columnMap.vencto = idx;
            if (normalizedHeader.includes('endereço') || normalizedHeader.includes('endereco')) columnMap.endereco = idx;
            if (normalizedHeader === 'consumo') columnMap.consumo = idx;
            if (normalizedHeader.includes('dias')) columnMap.nDias = idx;
            if (normalizedHeader.includes('hidrometro') || normalizedHeader.includes('hidrômetro')) columnMap.hidrometro = idx;
            if (normalizedHeader.includes('serviços') || normalizedHeader.includes('servicos')) columnMap.servicos = idx;
            if (normalizedHeader.includes('valor serv')) columnMap.valorServ = idx;
            if (normalizedHeader.includes('referencia') || normalizedHeader.includes('referência')) columnMap.referencia = idx;
            if (normalizedHeader.includes('ocorrência') || normalizedHeader.includes('ocorrencia')) columnMap.verificarOcorrencia = idx;
          });

          // Processar dados das linhas
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (row.length > 0 && row[columnMap.cadastro]) {
              const schoolData: SchoolData = {
                cadastro: row[columnMap.cadastro]?.toString() || '',
                proprietario: row[columnMap.proprietario]?.toString() || 'PREFEITURA MUNICIPAL',
                unidade: row[columnMap.unidade]?.toString() || '',
                local: row[columnMap.local]?.toString() || '',
                dtaLeitAnt: formatDate(row[columnMap.dtaLeitAnt]),
                dtaLeitAtual: formatDate(row[columnMap.dtaLeitAtual]),
                valor: parseFloat(row[columnMap.valor]) || 0,
                vencto: formatDate(row[columnMap.vencto]),
                endereco: row[columnMap.endereco]?.toString() || '',
                consumo: parseFloat(row[columnMap.consumo]) || 0,
                nDias: parseInt(row[columnMap.nDias]) || 30,
                hidrometro: row[columnMap.hidrometro]?.toString() || '',
                servicos: row[columnMap.servicos]?.toString() || '',
                valorServ: parseFloat(row[columnMap.valorServ]) || 0,
                referencia: row[columnMap.referencia]?.toString() || `${String(index + 1).padStart(2, '0')}/2025`,
                verificarOcorrencia: row[columnMap.verificarOcorrencia]?.toString() || '',
                mes: month,
                ano: 2025
              };
              allData.push(schoolData);
            }
          }
        }
      });

      if (allData.length > 0) {
        onDataLoaded(allData);
        setUploadStatus('success');
        toast({
          title: "Arquivo processado com sucesso!",
          description: `${allData.length} registros carregados`,
        });
      } else {
        throw new Error('Nenhum dado válido encontrado no arquivo');
      }

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setUploadStatus('error');
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o arquivo está no formato correto",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '';
    
    if (typeof dateValue === 'number') {
      // Excel date serial number
      const date = XLSX.SSF.parse_date_code(dateValue);
      return `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
    }
    
    if (typeof dateValue === 'string') {
      return dateValue;
    }
    
    return '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        processExcelFile(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Upload de Planilha Excel
        </CardTitle>
        <CardDescription>
          Faça upload da planilha com dados das escolas (formato .xlsx)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="excel-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : uploadStatus === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              
              <p className="mb-2 text-sm text-muted-foreground">
                {isProcessing ? (
                  <span>Processando arquivo...</span>
                ) : uploadStatus === 'success' ? (
                  <span className="text-green-600">Arquivo carregado com sucesso!</span>
                ) : uploadStatus === 'error' ? (
                  <span className="text-red-600">Erro no processamento</span>
                ) : (
                  <>
                    <span className="font-semibold">Clique para fazer upload</span> ou arraste aqui
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Apenas arquivos Excel (.xlsx, .xls)
              </p>
            </div>
            <Input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </label>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Estrutura esperada:</strong></p>
          <p>• Uma aba para cada mês (janeiro a dezembro)</p>
          <p>• Colunas: CADASTRO, UNIDADE, CONSUMO, VALOR, etc.</p>
          <p>• Dados organizados por linha (uma escola por linha)</p>
        </div>
      </CardContent>
    </Card>
  );
}