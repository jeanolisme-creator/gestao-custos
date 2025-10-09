import { useState, useEffect } from "react";
import { Download, FileText, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { WaterEditForm } from "./WaterEditForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export function WaterReports() {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
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
        .from("school_records")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      console.log("Registros carregados:", records?.length || 0);
      setData(records || []);
      
      // Extract unique school names from records
      const recordsSchools = Array.from(new Set(records?.map(r => r.nome_escola).filter(Boolean) || []));
      
      // Also fetch from schools table to ensure all schools appear
      const { data: schoolsData } = await supabase
        .from("schools")
        .select("nome_escola")
        .eq("user_id", user.id);
      
      const registeredSchools = schoolsData?.map(s => s.nome_escola).filter(Boolean) || [];
      
      // Combine both lists and remove duplicates
      const allSchools = Array.from(new Set([...recordsSchools, ...registeredSchools]));
      console.log("Escolas disponíveis:", allSchools.length, allSchools);
      
      setSchools(allSchools as string[]);
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
        record.cadastro?.includes(searchTerm)
      );
    }

    // Aggregate by school for consolidated report
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
            valores: [],
            records: []
          });
        }
        
        const school = schoolMap.get(schoolName);
        school.totalValue += parseFloat(record.valor_gasto || 0);
        school.totalConsumption += parseFloat(record.consumo_m3 || 0);
        school.totalService += parseFloat(record.valor_servicos || 0);
        
        // Parse cadastros and valores_cadastros from JSON with error handling
        try {
          const cadastrosArray = record.cadastro ? JSON.parse(record.cadastro) : [];
          const valoresArray = record.valores_cadastros ? JSON.parse(record.valores_cadastros as string) : [];
          
          school.cadastros.push(...cadastrosArray);
          school.valores.push(...valoresArray);
        } catch (error) {
          console.error("Error parsing cadastros/valores for record:", record.id, error);
        }
        
        school.records.push(record);
      });

      let result = Array.from(schoolMap.values());

      // Apply value range filter
      if (minValue || maxValue) {
        result = result.filter(school => {
          const totalValue = school.totalValue;
          const min = minValue ? parseFloat(minValue) : 0;
          const max = maxValue ? parseFloat(maxValue) : Infinity;
          return totalValue >= min && totalValue <= max;
        });
      }

      // Apply comparative filter
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

  const handleEdit = (record: any) => {
    setRecordToEdit(record);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updatedData: any) => {
    try {
      const { error } = await supabase
        .from("school_records")
        .update(updatedData)
        .eq("id", recordToEdit.id);

      if (error) throw error;

      toast({
        title: "Registro atualizado",
        description: "O registro foi atualizado com sucesso",
      });

      setEditDialogOpen(false);
      setRecordToEdit(null);
      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error("Error updating record:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o registro",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      const { error } = await supabase
        .from("school_records")
        .delete()
        .eq("id", recordToDelete.id);

      if (error) throw error;

      toast({
        title: "Registro excluído",
        description: "O registro foi excluído com sucesso",
      });

      fetchData(); // Recarrega os dados
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o registro",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const renderConsolidatedTable = () => {
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
              <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(index)}>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {expandedRows.has(index) ? '▼' : '▶'}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{school.schoolName}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {school.cadastros?.length || 0} cadastros
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
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-2">Detalhes dos Cadastros:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {school.cadastros.map((cadastro: string, cadIndex: number) => (
                          <div key={cadIndex} className="flex justify-between items-center p-2 bg-background rounded border">
                            <span className="font-mono text-sm">{cadastro}</span>
                            <span className="font-semibold text-primary">
                              {formatCurrency(school.valores[cadIndex] || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t mt-3">
                        <span className="font-semibold">Soma Total:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(school.totalValue || 0)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderDetailedTable = () => (
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
          <TableHead>Ocorrências</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(reportData as any[]).slice(0, 50).map((record, index) => (
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
            <TableCell>
              {record.ocorrencias_pendencias && (
                <Badge variant="destructive" className="text-xs">
                  {record.ocorrencias_pendencias}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(record)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(record)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Relatórios de Água
        </h2>
        <p className="text-muted-foreground">
          Geração e exportação de relatórios detalhados
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
          {(reportType === 'consolidated' || reportType === 'by-school' || 
            reportType === 'value-range' || reportType === 'comparative') 
            ? renderConsolidatedTable() 
            : renderDetailedTable()}
        </div>

        {reportData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhum dado encontrado</p>
            {data.length > 0 ? (
              <p className="text-sm mt-2">
                {data.length} registro(s) carregado(s), mas nenhum corresponde aos filtros aplicados.
                <br />
                Tente ajustar os filtros (ano, mês, escola) para ver os resultados.
              </p>
            ) : (
              <p className="text-sm mt-2">
                Nenhum registro de água cadastrado ainda.
                <br />
                Cadastre registros primeiro para visualizá-los aqui.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro - {recordToEdit?.nome_escola}</DialogTitle>
          </DialogHeader>
          {recordToEdit && (
            <WaterEditForm
              record={recordToEdit}
              onSave={handleEditSave}
              onCancel={() => {
                setEditDialogOpen(false);
                setRecordToEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de {recordToDelete?.nome_escola}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
