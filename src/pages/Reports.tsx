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
  { value: 'consolidated', label: 'Relatório Geral' },
  { value: 'value-range', label: 'Faixa de Valores' },
];

const months = [
  'todos', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const years = ['2025', '2026', '2027'];

export default function Reports() {
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: records, error } = await supabase
        .from("school_records")
        .select("*")
        .order("nome_escola");

      if (error) throw error;

      setData(records || []);
      
      // Extrair escolas únicas
      const uniqueSchools = Array.from(
        new Set(records?.map(r => r.nome_escola).filter(Boolean) || [])
      ).sort();
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

  // Parser para mes_ano_referencia
  const parseMesAnoReferencia = (value: any): { monthIndex: number, year: number } | null => {
    if (!value) return null;
    const s = String(value).trim().toLowerCase();
    if (!s) return null;
    
    const parts = s.split(/[\/\-]/).map(p => p.trim());
    if (parts.length >= 2) {
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      
      // Parte da esquerda é o mês
      let monthIndex: number | null = null;
      const num = parseInt(parts[0], 10);
      if (!isNaN(num)) {
        monthIndex = Math.max(0, Math.min(11, num - 1));
      } else {
        const idx = monthNames.findIndex(m => m === parts[0]);
        monthIndex = idx >= 0 ? idx : null;
      }
      
      // Parte da direita é o ano
      const yearStr = parts[1];
      let year = parseInt(yearStr, 10);
      if (yearStr.length === 2) {
        year = 2000 + year;
      }
      
      if (monthIndex !== null && !isNaN(year)) {
        return { monthIndex, year };
      }
    }
    return null;
  };

  // Garante array a partir de valor simples, array ou JSON string
  const toArray = (raw: any): any[] => {
    if (raw === null || raw === undefined || raw === '') return [];
    if (Array.isArray(raw)) return raw;
    const s = typeof raw === 'string' ? raw.trim() : String(raw);
    if (!s) return [];
    if (s.startsWith('[')) {
      try { return JSON.parse(s); } catch { return [raw]; }
    }
    return [raw];
  };

  const getReportData = () => {
    const selectedYearNum = parseInt(selectedYear, 10);
    const selectedMonthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const selMonthIdx = selectedMonth !== 'todos' 
      ? selectedMonthNames.indexOf(selectedMonth.toLowerCase()) 
      : null;

    // Filtrar por mes_ano_referencia exclusivamente
    let filteredData = data.filter(record => {
      const mesAnoRaw = record.mes_ano_referencia || '';
      const parsed = parseMesAnoReferencia(mesAnoRaw);
      
      if (!parsed) return false;
      
      // Checagem do ano
      if (parsed.year !== selectedYearNum) return false;
      
      // Checagem do mês (se aplicável)
      if (selMonthIdx !== null && parsed.monthIndex !== selMonthIdx) {
        return false;
      }
      
      return true;
    });

    if (selectedSchool !== 'all') {
      filteredData = filteredData.filter(record => record.nome_escola === selectedSchool);
    }

    // Aplicar filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(record =>
        record.nome_escola?.toLowerCase().includes(searchLower) ||
        record.cadastro?.toString().toLowerCase().includes(searchLower)
      );
    }

    // Agregar por escola para relatórios consolidados
    if (reportType === 'by-school' || reportType === 'consolidated' || 
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
            cadastrosCount: 0,
            cadastrosDetails: [],
            records: []
          });
        }
        
        const school = schoolMap.get(schoolName);
        school.totalValue += parseFloat(record.valor_gasto || 0);
        school.totalConsumption += parseFloat(record.consumo_m3 || 0);
        school.totalService += parseFloat(record.valor_servicos || 0);
        school.records.push(record);

        const cadastrosArray = toArray(record.cadastro);
        const valoresArray = toArray(record.valores_cadastros);
        const consumosArray = toArray(record.consumos_m3);
        const vencsArray = toArray(record.datas_vencimento);

        const arr = cadastrosArray.length > 0 ? cadastrosArray : (record.cadastro ? [String(record.cadastro)] : ['—']);

        arr.forEach((cad: any, idx: number) => {
          const cadastroKey = (cad ?? '').toString().trim() || '—';
          let valorValue = 0;
          const valorRaw = (idx in valoresArray) ? valoresArray[idx] : record.valor_gasto;
          if (valorRaw !== null && valorRaw !== undefined && valorRaw !== '') {
            if (typeof valorRaw === 'string') {
              const cleaned = valorRaw.replace(/[R$\s.]/g, '').replace(',', '.');
              valorValue = parseFloat(cleaned) || 0;
            } else {
              valorValue = Number(valorRaw) || 0;
            }
          }
          let consumoValue = 0;
          const consumoRaw = (idx in consumosArray) ? consumosArray[idx] : record.consumo_m3;
          if (consumoRaw !== null && consumoRaw !== undefined && consumoRaw !== '') {
            if (typeof consumoRaw === 'string') {
              const cleanedC = consumoRaw.replace(/[^\d.,\-]/g, '').replace(',', '.');
              consumoValue = parseFloat(cleanedC) || 0;
            } else {
              consumoValue = Number(consumoRaw) || 0;
            }
          }
          const venc = (idx in vencsArray) ? vencsArray[idx] : record.data_vencimento;
          school.cadastrosDetails.push({
            cadastro: cadastroKey,
            mes: record.mes_ano_referencia,
            consumo: consumoValue,
            valor: valorValue,
            vencimento: venc
          });
        });
      });

      let result = Array.from(schoolMap.values()).map((s: any) => ({ ...s, cadastrosCount: (s.cadastrosDetails?.length ?? s.cadastrosCount) }));

      // Aplicar filtro de faixa de valores
      if (reportType === 'value-range' && (minValue || maxValue)) {
        result = result.filter(school => {
          const totalValue = school.totalValue;
          const min = minValue ? parseFloat(minValue) : 0;
          const max = maxValue ? parseFloat(maxValue) : Infinity;
          return totalValue >= min && totalValue <= max;
        });
      }

      // Aplicar filtro comparativo
      if (reportType === 'comparative' && selectedSchools.length > 0) {
        result = result.filter(school => selectedSchools.includes(school.schoolName));
      }

      return result;
    }

    return filteredData;
  };

  const reportData = getReportData();

  const exportToCSV = () => {
    toast({
      title: "Exportação CSV",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "Exportação PDF",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const toggleRow = (index: number) => {
    const next = new Set(expandedRows);
    if (next.has(index)) next.delete(index); else next.add(index);
    setExpandedRows(next);
  };

  const renderConsolidatedTable = () => {
    const totals = (reportData as any[]).reduce((acc, school) => ({
      totalConsumption: acc.totalConsumption + (school.totalConsumption || 0),
      totalValue: acc.totalValue + (school.totalValue || 0)
    }), { totalConsumption: 0, totalValue: 0 });

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Total Cadastros</TableHead>
            <TableHead>Consumo Total (m³)</TableHead>
            <TableHead>Valor Total (R$)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(reportData as any[]).map((school, index) => (
            <>
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => toggleRow(index)}
                  >
                    {expandedRows.has(index) ? '▼' : '▶'}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{school.schoolName}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {(school.cadastrosDetails?.length ?? school.cadastrosCount) } cadastros
                  </Badge>
                </TableCell>
                <TableCell>{school.totalConsumption?.toFixed(1) || '0.0'}m³</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(school.totalValue || 0)}
                </TableCell>
              </TableRow>
              {expandedRows.has(index) && (
                <TableRow key={`${index}-details`}>
                  <TableCell colSpan={5} className="bg-muted/30 p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cadastro</TableHead>
                          <TableHead>Mês/Ano</TableHead>
                          <TableHead className="text-right">Consumo (m³)</TableHead>
                          <TableHead className="text-right">Valor (R$)</TableHead>
                          <TableHead>Vencimento</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(school.cadastrosDetails || []).map((d: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-sm">{d.cadastro}</TableCell>
                            <TableCell>{d.mes}</TableCell>
                            <TableCell className="text-right">{(parseFloat(d.consumo || 0)).toFixed(1)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(parseFloat(d.valor || 0))}</TableCell>
                            <TableCell>{d.vencimento || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
          {reportData.length > 0 && (
            <TableRow className="bg-primary/5 border-t-2 border-primary">
              <TableCell></TableCell>
              <TableCell className="font-bold text-lg">TOTAL GERAL</TableCell>
              <TableCell></TableCell>
              <TableCell className="font-bold text-lg">{totals.totalConsumption.toFixed(1)}m³</TableCell>
              <TableCell className="font-bold text-lg text-primary">
                {formatCurrency(totals.totalValue)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  const renderDetailedTable = () => {
    const totals = (reportData as any[]).reduce((acc, record) => ({
      totalConsumption: acc.totalConsumption + parseFloat(record.consumo_m3 || 0),
      totalValue: acc.totalValue + parseFloat(record.valor_gasto || 0)
    }), { totalConsumption: 0, totalValue: 0 });

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cadastro</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Mês/Ano</TableHead>
            <TableHead>Consumo (m³)</TableHead>
            <TableHead>Valor (R$)</TableHead>
            <TableHead>Vencimento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(reportData as any[]).slice(0, 100).map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-sm">{record.cadastro}</TableCell>
              <TableCell className="font-medium">{record.nome_escola}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {record.endereco_completo || 'N/A'}
              </TableCell>
              <TableCell>{record.mes_ano_referencia}</TableCell>
              <TableCell>{parseFloat(record.consumo_m3 || 0).toFixed(1)}m³</TableCell>
              <TableCell>{formatCurrency(parseFloat(record.valor_gasto || 0))}</TableCell>
              <TableCell>{record.data_vencimento || 'N/A'}</TableCell>
            </TableRow>
          ))}
          {reportData.length > 0 && (
            <TableRow className="bg-primary/5 border-t-2 border-primary">
              <TableCell colSpan={4} className="font-bold text-lg">TOTAL GERAL</TableCell>
              <TableCell className="font-bold text-lg">{totals.totalConsumption.toFixed(1)}m³</TableCell>
              <TableCell className="font-bold text-lg text-primary">
                {formatCurrency(totals.totalValue)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Módulo de Relatórios
          </h1>
          <p className="text-muted-foreground">
            Geração e exportação de relatórios baseados em mes_ano_referencia
          </p>
        </div>

        {/* Filters */}
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

          {/* Value Range Filter */}
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

          {/* Comparative Filter */}
          {reportType === 'comparative' && (
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Selecionar Escolas para Comparativo
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                {schools.map((school) => (
                  <label key={school} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSchools([...selectedSchools, school]);
                        } else {
                          setSelectedSchools(selectedSchools.filter(s => s !== school));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="truncate" title={school}>
                      {school}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {selectedSchools.length} escola(s) selecionada(s)
              </p>
            </div>
          )}
        </Card>

        {/* Export Buttons */}
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

        {/* Results Summary */}
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

        {/* Report Table */}
        <Card className="p-6 bg-gradient-card border-border shadow-card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Relatório {reportTypes.find(t => t.value === reportType)?.label}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {reportType === 'consolidated' || reportType === 'by-school' || 
             reportType === 'value-range' || reportType === 'comparative'
              ? renderConsolidatedTable()
              : renderDetailedTable()
            }
          </div>

          {reportData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum dado encontrado</p>
              <p className="text-sm mt-2">
                Ajuste os filtros (ano, mês, escola) ou verifique se existem registros com mes_ano_referencia = "{selectedMonth}/{selectedYear}"
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
