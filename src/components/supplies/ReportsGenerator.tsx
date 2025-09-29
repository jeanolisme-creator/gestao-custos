import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  const handleSearch = () => {
    // Mock search results
    const mockResults = [
      {
        school: "EMEF João Silva Santos",
        item: "Papel Sulfite A4",
        quantity: 50,
        unitValue: 25.90,
        totalValue: 1295.00,
        macroRegion: "Norte",
        educationLevel: "Anos Iniciais"
      },
      {
        school: "EMEI Maria Oliveira",
        item: "Lápis de Cor 12 cores",
        quantity: 30,
        unitValue: 8.50,
        totalValue: 255.00,
        macroRegion: "Sul",
        educationLevel: "Pré-escola"
      },
      {
        school: "EMEIF Pedro Costa Lima",
        item: "Caderno Brochura 96 folhas",
        quantity: 120,
        unitValue: 3.20,
        totalValue: 384.00,
        macroRegion: "Centro",
        educationLevel: "Anos Finais"
      },
    ];
    
    setSearchResults(mockResults);
    setShowResults(true);
    
    toast({
      title: "Busca realizada",
      description: `Encontrados ${mockResults.length} resultados com base nos filtros aplicados.`,
    });
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
    setShowResults(false);
    setSearchResults([]);
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
            onClick={handleSearch}
            className="bg-supplies text-white hover:bg-supplies/90 flex-1"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button 
            onClick={handleGenerateReport}
            className="bg-supplies text-white hover:bg-supplies/90 flex-1"
            disabled={!showResults}
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
          <Button 
            onClick={clearFilters}
            variant="outline"
            className="border-supplies text-supplies hover:bg-supplies/10"
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>

      {/* Search Results Section */}
      {showResults && (
        <Card className="mt-6 bg-gradient-to-br from-supplies/5 to-supplies/10 border-supplies/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-supplies">
              <FileText className="h-5 w-5" />
              Resultados da Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Escola</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unitário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Macrorregião</TableHead>
                    <TableHead>Nível de Ensino</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.school}</TableCell>
                      <TableCell>{result.item}</TableCell>
                      <TableCell>{result.quantity}</TableCell>
                      <TableCell>R$ {result.unitValue.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">R$ {result.totalValue.toFixed(2)}</TableCell>
                      <TableCell>{result.macroRegion}</TableCell>
                      <TableCell>{result.educationLevel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}