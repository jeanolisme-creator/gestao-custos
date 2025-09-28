import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText } from "lucide-react";

interface ReportFilters {
  schoolName: string;
  itemName: string;
  minValue: string;
  maxValue: string;
  macroRegion: string;
  educationLevels: {
    creche: boolean;
    anosIniciais: boolean;
    preEscola: boolean;
    anosFinais: boolean;
    todosNiveis: boolean;
  };
}

export function ReportsGenerator() {
  const [filters, setFilters] = useState<ReportFilters>({
    schoolName: "",
    itemName: "",
    minValue: "",
    maxValue: "",
    macroRegion: "",
    educationLevels: {
      creche: false,
      anosIniciais: false,
      preEscola: false,
      anosFinais: false,
      todosNiveis: false,
    },
  });

  const { toast } = useToast();

  const handleEducationLevelChange = (level: keyof ReportFilters['educationLevels'], checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      educationLevels: {
        ...prev.educationLevels,
        [level]: checked,
      }
    }));
  };

  const handleGenerateReport = () => {
    toast({
      title: "Relatório sendo gerado",
      description: "Seu relatório personalizado está sendo processado...",
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Relatório gerado com sucesso",
        description: "O download do relatório será iniciado em breve.",
      });
    }, 2000);
  };

  const clearFilters = () => {
    setFilters({
      schoolName: "",
      itemName: "",
      minValue: "",
      maxValue: "",
      macroRegion: "",
      educationLevels: {
        creche: false,
        anosIniciais: false,
        preEscola: false,
        anosFinais: false,
        todosNiveis: false,
      },
    });
  };

  return (
    <Card className="bg-gradient-to-br from-supplies/5 to-supplies/10 border-supplies/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-supplies">
          <FileText className="h-5 w-5" />
          Gerador de Relatórios
        </CardTitle>
        <CardDescription>
          Configure os filtros para gerar relatórios personalizados de suprimentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* School Name */}
          <div className="space-y-2">
            <Label htmlFor="schoolName">Nome da Escola</Label>
            <Input
              id="schoolName"
              placeholder="Digite o nome da escola"
              value={filters.schoolName}
              onChange={(e) => setFilters(prev => ({ ...prev, schoolName: e.target.value }))}
            />
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Nome do Item</Label>
            <Input
              id="itemName"
              placeholder="Digite o nome do item"
              value={filters.itemName}
              onChange={(e) => setFilters(prev => ({ ...prev, itemName: e.target.value }))}
            />
          </div>

          {/* Min Value */}
          <div className="space-y-2">
            <Label htmlFor="minValue">Valor Mínimo (R$)</Label>
            <Input
              id="minValue"
              type="number"
              placeholder="0,00"
              value={filters.minValue}
              onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
            />
          </div>

          {/* Max Value */}
          <div className="space-y-2">
            <Label htmlFor="maxValue">Valor Máximo (R$)</Label>
            <Input
              id="maxValue"
              type="number"
              placeholder="1000,00"
              value={filters.maxValue}
              onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
            />
          </div>
        </div>

        {/* Macro Region */}
        <div className="space-y-2">
          <Label htmlFor="macroRegion">Macrorregião</Label>
          <Select value={filters.macroRegion} onValueChange={(value) => setFilters(prev => ({ ...prev, macroRegion: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma macrorregião" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="norte">Norte</SelectItem>
              <SelectItem value="sul">Sul</SelectItem>
              <SelectItem value="leste">Leste</SelectItem>
              <SelectItem value="oeste">Oeste</SelectItem>
              <SelectItem value="centro">Centro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Education Levels */}
        <div className="space-y-3">
          <Label>Níveis de Ensino</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'creche' as const, label: 'Creche (0-3 anos)' },
              { key: 'anosIniciais' as const, label: 'Anos Iniciais (6-10 anos)' },
              { key: 'preEscola' as const, label: 'Pré-escola (4-5 anos)' },
              { key: 'anosFinais' as const, label: 'Anos Finais (11-14 anos)' },
              { key: 'todosNiveis' as const, label: 'Todos os Níveis' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={filters.educationLevels[key]}
                  onCheckedChange={(checked) => handleEducationLevelChange(key, checked as boolean)}
                />
                <Label htmlFor={key} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleGenerateReport}
            className="bg-supplies text-white hover:bg-supplies/90 flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button 
            onClick={clearFilters}
            variant="outline"
            className="border-supplies text-supplies hover:bg-supplies/10"
          >
            <Search className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}