import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileSpreadsheet, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface WaterImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface WaterRecord {
  mes_ano_referencia: string;
  cadastro: string; // Will be JSON array
  proprietario?: string;
  nome_escola: string;
  endereco_completo?: string;
  numero?: string;
  bairro?: string;
  macroregiao?: string;
  hidrometro?: string;
  consumo_m3?: number;
  valor_gasto?: number;
  valor_servicos?: number;
  numero_dias?: number;
  data_vencimento?: string;
  descricao_servicos?: string;
  ocorrencias_pendencias?: string;
}

export function WaterImport({ open, onOpenChange, onSuccess }: WaterImportProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }

    return records;
  };

  const normalizeColumnName = (name: string): string => {
    const normalized = name.toLowerCase().trim();
    
    // Map common column names
    const mappings: { [key: string]: string } = {
      'mês referência': 'mes_ano_referencia',
      'mes referencia': 'mes_ano_referencia',
      'mes_referencia': 'mes_ano_referencia',
      'cadastro': 'cadastro',
      'cadastros': 'cadastro',
      'proprietário': 'proprietario',
      'proprietario': 'proprietario',
      'nome escola': 'nome_escola',
      'escola': 'nome_escola',
      'nome_escola': 'nome_escola',
      'endereço': 'endereco_completo',
      'endereco': 'endereco_completo',
      'endereco_completo': 'endereco_completo',
      'número': 'numero',
      'numero': 'numero',
      'bairro': 'bairro',
      'macroregião': 'macroregiao',
      'macroregiao': 'macroregiao',
      'hidrômetro': 'hidrometro',
      'hidrometro': 'hidrometro',
      'consumo': 'consumo_m3',
      'consumo_m3': 'consumo_m3',
      'consumo m3': 'consumo_m3',
      'valor': 'valor_gasto',
      'valor_gasto': 'valor_gasto',
      'valor gasto': 'valor_gasto',
      'valor serviços': 'valor_servicos',
      'valor servicos': 'valor_servicos',
      'valor_servicos': 'valor_servicos',
      'dias': 'numero_dias',
      'numero_dias': 'numero_dias',
      'número dias': 'numero_dias',
      'vencimento': 'data_vencimento',
      'data_vencimento': 'data_vencimento',
      'data vencimento': 'data_vencimento',
      'serviços': 'descricao_servicos',
      'servicos': 'descricao_servicos',
      'descricao_servicos': 'descricao_servicos',
      'descrição serviços': 'descricao_servicos',
      'ocorrências': 'ocorrencias_pendencias',
      'ocorrencias': 'ocorrencias_pendencias',
      'ocorrencias_pendencias': 'ocorrencias_pendencias',
      'pendências': 'ocorrencias_pendencias',
      'pendencias': 'ocorrencias_pendencias'
    };

    return mappings[normalized] || normalized;
  };

  const convertToWaterRecord = (row: any): WaterRecord | null => {
    const normalizedRow: any = {};
    
    Object.keys(row).forEach(key => {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = row[key];
    });

    // Required fields
    if (!normalizedRow.nome_escola || !normalizedRow.mes_ano_referencia) {
      return null;
    }

    // Handle cadastro - can be multiple values separated by comma or semicolon
    let cadastros = [''];
    if (normalizedRow.cadastro) {
      const cadastroStr = String(normalizedRow.cadastro).trim();
      if (cadastroStr.includes(',') || cadastroStr.includes(';')) {
        cadastros = cadastroStr.split(/[,;]/).map((c: string) => c.trim()).filter(Boolean);
      } else {
        cadastros = [cadastroStr];
      }
    }

    // Parse numeric values
    const parseNumber = (value: any): number | undefined => {
      if (!value) return undefined;
      const str = String(value).replace(/[R$\s.]/g, '').replace(',', '.');
      const num = parseFloat(str);
      return isNaN(num) ? undefined : num;
    };

    // Parse date (handle DD/MM/YYYY or YYYY-MM-DD)
    const parseDate = (value: any): string | undefined => {
      if (!value) return undefined;
      const str = String(value).trim();
      
      // If already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [day, month, year] = str.split('/');
        return `${year}-${month}-${day}`;
      }
      
      return undefined;
    };

    return {
      mes_ano_referencia: normalizedRow.mes_ano_referencia,
      cadastro: JSON.stringify(cadastros),
      proprietario: normalizedRow.proprietario || undefined,
      nome_escola: normalizedRow.nome_escola,
      endereco_completo: normalizedRow.endereco_completo || undefined,
      numero: normalizedRow.numero || undefined,
      bairro: normalizedRow.bairro || undefined,
      macroregiao: normalizedRow.macroregiao || undefined,
      hidrometro: normalizedRow.hidrometro || undefined,
      consumo_m3: parseNumber(normalizedRow.consumo_m3),
      valor_gasto: parseNumber(normalizedRow.valor_gasto),
      valor_servicos: parseNumber(normalizedRow.valor_servicos),
      numero_dias: normalizedRow.numero_dias ? parseInt(normalizedRow.numero_dias) : undefined,
      data_vencimento: parseDate(normalizedRow.data_vencimento),
      descricao_servicos: normalizedRow.descricao_servicos || undefined,
      ocorrencias_pendencias: normalizedRow.ocorrencias_pendencias || undefined
    };
  };

  const processFile = async (file: File) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado"
      });
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');

    try {
      let records: any[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        records = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        records = XLSX.utils.sheet_to_json(firstSheet);
      }

      if (records.length === 0) {
        throw new Error('Nenhum registro encontrado no arquivo');
      }

      // Convert to water records
      const waterRecords: WaterRecord[] = records
        .map(convertToWaterRecord)
        .filter((r): r is WaterRecord => r !== null);

      if (waterRecords.length === 0) {
        throw new Error('Nenhum registro válido encontrado. Verifique se as colunas estão corretas.');
      }

      // Add user_id to all records
      const recordsWithUserId = waterRecords.map(record => ({
        ...record,
        user_id: user.id
      }));

      // Insert into database
      const { error } = await supabase
        .from('school_records')
        .insert(recordsWithUserId);

      if (error) throw error;

      setUploadStatus('success');
      toast({
        title: "Importação concluída!",
        description: `${waterRecords.length} registros importados com sucesso`
      });

      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: "Erro ao importar",
        description: error.message || "Verifique se o arquivo está no formato correto"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Dados de Água</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV ou XLSX com os registros de água
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
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
                
                <p className="mb-2 text-sm text-muted-foreground mt-4">
                  {isProcessing ? (
                    <span>Processando arquivo...</span>
                  ) : uploadStatus === 'success' ? (
                    <span className="text-green-600">Arquivo importado com sucesso!</span>
                  ) : uploadStatus === 'error' ? (
                    <span className="text-red-600">Erro no processamento</span>
                  ) : (
                    <>
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste aqui
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV ou Excel (.xlsx, .xls)
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </label>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 bg-muted/50 p-4 rounded-lg">
            <p><strong>Formato esperado:</strong></p>
            <div className="space-y-1 ml-2">
              <p>• <strong>Colunas obrigatórias:</strong> mes_ano_referencia, nome_escola</p>
              <p>• <strong>Colunas opcionais:</strong> cadastro(s), proprietario, endereco, numero, bairro, macroregiao, hidrometro, consumo_m3, valor_gasto, valor_servicos, numero_dias, data_vencimento, descricao_servicos, ocorrencias_pendencias</p>
              <p>• <strong>Cadastro múltiplo:</strong> Separe com vírgula ou ponto e vírgula (ex: 123456,789012)</p>
              <p>• <strong>Datas:</strong> Formato DD/MM/YYYY ou YYYY-MM-DD</p>
              <p>• <strong>Valores:</strong> Podem incluir R$ e usar vírgula como decimal</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
