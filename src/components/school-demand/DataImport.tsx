import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, FileSpreadsheet, FileImage } from "lucide-react";

export function DataImport() {
  const [files, setFiles] = useState<{
    csv?: File;
    xlsx?: File;
    pdf?: File;
  }>({});
  const { toast } = useToast();

  const handleFileChange = (type: 'csv' | 'xlsx' | 'pdf', file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleImport = async (type: 'csv' | 'xlsx' | 'pdf') => {
    const file = files[type];
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: `Por favor, selecione um arquivo ${type.toUpperCase()} para importar.`,
        variant: "destructive",
      });
      return;
    }

    // Mock import functionality
    toast({
      title: "Importação iniciada",
      description: `Processando arquivo ${file.name}...`,
    });

    // Simulate processing time
    setTimeout(() => {
      toast({
        title: "Importação concluída",
        description: `Dados do arquivo ${file.name} foram importados com sucesso!`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Dados
          </CardTitle>
          <CardDescription>
            Importe dados de escolas e demanda de alunos através de diferentes formatos de arquivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CSV Import */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              Arquivo CSV
            </Label>
            <div className="flex gap-3">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange('csv', e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleImport('csv')}
                className="bg-green-600 hover:bg-green-700"
              >
                Importar CSV
              </Button>
            </div>
          </div>

          {/* Excel Import */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Arquivo Excel (XLSX)
            </Label>
            <div className="flex gap-3">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileChange('xlsx', e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleImport('xlsx')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Importar Excel
              </Button>
            </div>
          </div>

          {/* PDF Import */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileImage className="h-4 w-4 text-red-600" />
              Arquivo PDF
            </Label>
            <div className="flex gap-3">
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange('pdf', e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleImport('pdf')}
                className="bg-red-600 hover:bg-red-700"
              >
                Importar PDF
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Formatos aceitos:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• CSV: Dados separados por vírgula com cabeçalhos</li>
              <li>• Excel: Planilhas com formato padrão (.xlsx, .xls)</li>
              <li>• PDF: Documentos com tabelas de dados estruturadas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}