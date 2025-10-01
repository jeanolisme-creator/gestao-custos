import { useState, useEffect } from "react";
import { Download, FileText, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reportTypes = [
  { value: 'by-school', label: 'Por Nome da Escola' },
  { value: 'by-id', label: 'Por ID Cadastro' },
  { value: 'comparative', label: 'Comparativo entre Escolas' },
  { value: 'temporal', label: 'Evolução Temporal' },
  { value: 'consolidated', label: 'Relatório Geral' },
  { value: 'value-range', label: 'Faixa de Valores' },
];

const months = [
  'todos', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const years = ['2025', '2026', '2027'];

export function EnergyReports() {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [selectedMonth, setSelectedMonth] = useState<string>("todos");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("consolidated");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: records, error } = await supabase
        .from("energy_records")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      setData(records || []);
      
      const uniqueSchools = Array.from(new Set(records?.map(r => r.nome_escola) || []));
      setSchools(uniqueSchools as string[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getReportData = () => {
    let filteredData = data.filter(record => {
      const mesAno = record.mes_ano_referencia || '';
      return mesAno.includes(selectedYear);
    });
    
    if (selectedMonth !== 'todos') {
      filteredData = filteredData.filter(record => {
        const mesAno = record.mes_ano_referencia || '';
        return mesAno.toLowerCase().includes(selectedMonth);
      });
    }

    if (selectedSchool !== 'all') {
      filteredData = filteredData.filter(record => record.nome_escola === selectedSchool);
    }

    if (searchTerm) {
      filteredData = filteredData.filter(record =>
        record.nome_escola?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.cadastro_cliente?.includes(searchTerm)
      );
    }

    if (reportType === 'consolidated' || reportType === 'by-school' || 
        reportType === 'value-range' || reportType === 'comparative') {
      const schoolMap = new Map();
      
      filteredData.forEach(record => {
        const schoolName = record.nome_escola;
        if (!schoolMap.has(schoolName)) {
          schoolMap.set(schoolName, {
            schoolName,
            totalValue: 0,
            totalConsumption: 0,
            totalService: 0,
            cadastros: [],
          });
        }
        
        const school = schoolMap.get(schoolName);
        school.totalValue += parseFloat(record.valor_gasto || 0);
        school.totalConsumption += parseFloat(record.consumo_kwh || 0);
        school.totalService += parseFloat(record.valor_servicos || 0);
        school.cadastros.push(record.cadastro_cliente);
      });

      let result = Array.from(schoolMap.values());

      if (minValue || maxValue) {
        result = result.filter(school => {
          const totalValue = school.totalValue;
          const min = minValue ? parseFloat(minValue) : 0;
          const max = maxValue ? parseFloat(maxValue) : Infinity;
          return totalValue >= min && totalValue <= max;
        });
      }

      if (selectedSchools.length > 0) {
        result = result.filter(school => selectedSchools.includes(school.schoolName));
      }

      return result;
    }

    return filteredData;
  };

  const reportData = getReportData();

  const exportToCSV = () => {
    toast({
      title: "Exportando para CSV",
      description: "O arquivo será baixado em instantes",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "Exportando para PDF",
      description: "O arquivo será baixado em instantes",
    });
  };

  const renderConsolidatedTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Escola</TableHead>
          <TableHead>Cadastros</TableHead>
          <TableHead>Consumo Total (KWh)</TableHead>
          <TableHead>Valor Energia (R$)</TableHead>
          <TableHead>Valor Serviços (R$)</TableHead>
          <TableHead>Total (R$)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(reportData as any[]).map((school, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{school.schoolName}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {school.cadastros?.length || 0} cadastros
              </Badge>
            </TableCell>
            <TableCell>{school.totalConsumption?.toFixed(1) || '0.0'} KWh</TableCell>
            <TableCell>{formatCurrency((school.totalValue || 0) - (school.totalService || 0))}</TableCell>
            <TableCell>{formatCurrency(school.totalService || 0)}</TableCell>
            <TableCell className="font-semibold">
              {formatCurrency(school.totalValue || 0)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDetailedTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cadastro</TableHead>
          <TableHead>Escola</TableHead>
          <TableHead>Endereço</TableHead>
          <TableHead>Mês/Ano</TableHead>
          <TableHead>Consumo (KWh)</TableHead>
          <TableHead>Valor (R$)</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Ocorrências</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(reportData as any[]).slice(0, 50).map((record, index) => (
          <TableRow key={index}>
            <TableCell className="font-mono text-sm">{record.cadastro_cliente}</TableCell>
            <TableCell className="font-medium">{record.nome_escola}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {record.endereco || 'N/A'}
            </TableCell>
            <TableCell>{record.mes_ano_referencia}</TableCell>
            <TableCell>{parseFloat(record.consumo_kwh || 0).toFixed(1)} KWh</TableCell>
            <TableCell>{formatCurrency(parseFloat(record.valor_gasto || 0))}</TableCell>
            <TableCell>{record.data_vencimento || 'N/A'}</TableCell>
            <TableCell>
              {record.ocorrencias_pendencias && (
                <Badge variant="destructive" className="text-xs">
                  {record.ocorrencias_pendencias}
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Relatórios de Energia
        </h2>
        <p className="text-muted-foreground">
          Geração e exportação de relatórios detalhados
        </p>
      </div>

      <Card className="p-6 bg-gradient-card border-border shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mês</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Escola</label>
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de Relatório</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar escola ou cadastro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {reportType === 'value-range' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Valor Mínimo (R$)</label>
              <Input
                type="number"
                placeholder="0"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Valor Máximo (R$)</label>
              <Input
                type="number"
                placeholder="Sem limite"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
              />
            </div>
          </div>
        )}

        {reportType === 'comparative' && (
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Selecionar Escolas para Comparativo (até 15)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {schools.slice(0, 15).map((school) => (
                <label key={school} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(school)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (selectedSchools.length < 15) {
                          setSelectedSchools([...selectedSchools, school]);
                        }
                      } else {
                        setSelectedSchools(selectedSchools.filter(s => s !== school));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="truncate" title={school}>
                    {school.slice(0, 20)}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedSchools.length}/15 escolas selecionadas
            </p>
          </div>
        )}
      </Card>

      <div className="flex items-center space-x-4">
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <Button onClick={exportToPDF} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Card className="p-4 bg-gradient-subtle border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {reportType === 'consolidated' || reportType === 'by-school' 
                ? `${reportData.length} escolas encontradas`
                : `${reportData.length} registros encontrados`
              }
            </p>
          </div>
          <Badge variant="outline">
            {selectedMonth === 'todos' ? 'Anual' : selectedMonth} - {selectedYear}
          </Badge>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border shadow-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Relatório {reportTypes.find(t => t.value === reportType)?.label}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {reportType === 'consolidated' || reportType === 'by-school' 
            ? renderConsolidatedTable()
            : renderDetailedTable()
          }
        </div>

        {reportData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado encontrado</p>
            <p className="text-sm">Ajuste os filtros para ver os resultados</p>
          </div>
        )}
      </Card>
    </div>
  );
}
