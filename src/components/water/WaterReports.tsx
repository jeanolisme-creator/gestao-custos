import { useState, useEffect } from "react";
import { Download, FileText, Search, Filter, Pencil, Trash2, Printer, Mail, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import { DataReview } from "./DataReview";
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
  const [dataReviewOpen, setDataReviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Data state updated:", data.length, "records");
    if (data.length > 0) {
      console.log("Sample records:", data.slice(0, 2));
    }
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: records, error } = await supabase
        .from("school_records")
        .select("*");

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

  // Helpers to parse dates in 'dd/mm/yyyy' (BR) or ISO formats
  const parseBRDate = (value: any): Date | null => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    // Try BR format dd/mm/yyyy
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        const day = parseInt(dd, 10);
        const month = parseInt(mm, 10) - 1; // 0-based
        const year = parseInt(yyyy, 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    }
    // Fallback to native parser (handles ISO)
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatMesAnoFromDate = (d: Date): string => {
    const month = d.toLocaleString('pt-BR', { month: 'long' });
    return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${d.getFullYear()}`;
  };

  const getReportData = () => {
    console.log("=== getReportData ===");
    console.log("Total records in data:", data.length);
    console.log("Selected filters:", { selectedYear, selectedMonth, selectedSchool, reportType });
    
    let filteredData = data.filter(record => {
      const year = selectedYear;
      const mesAno = record.mes_ano_referencia || '';
      const mesAnoHasYear = mesAno.includes(year);

      const sd = parseBRDate(record.data_vencimento);
      const singleDueYear = sd ? sd.getFullYear().toString() : null;
      let arrayDueYears: string[] = [];
      try {
        const arr = Array.isArray(record.datas_vencimento)
          ? record.datas_vencimento
          : (record.datas_vencimento ? JSON.parse(record.datas_vencimento as string) : []);
        arrayDueYears = (arr || [])
          .map((d: string) => parseBRDate(d))
          .filter((d: Date | null): d is Date => !!d)
          .map((d: Date) => d.getFullYear().toString());
      } catch {}

      const matches = mesAnoHasYear || singleDueYear === year || arrayDueYears.includes(year);
      if (!matches) {
        console.log("Record filtered out by year:", record.nome_escola, { mes_ano_referencia: mesAno, singleDueYear, arrayDueYears }, "doesn't include", year);
      }
      return matches;
    });
    
    console.log("After year filter:", filteredData.length);
    
    if (selectedMonth !== 'todos') {
      const monthLower = selectedMonth.toLowerCase();
      filteredData = filteredData.filter(record => {
        const mesAno = record.mes_ano_referencia || '';
        const refMonth = mesAno.split('/')[0]?.toLowerCase() || '';

        const sd = parseBRDate(record.data_vencimento);
        const singleDueMonth = sd
          ? sd.toLocaleString('pt-BR', { month: 'long' }).toLowerCase()
          : '';
        let arrayDueMonths: string[] = [];
        try {
          const arr = Array.isArray(record.datas_vencimento)
            ? record.datas_vencimento
            : (record.datas_vencimento ? JSON.parse(record.datas_vencimento as string) : []);
          arrayDueMonths = (arr || [])
            .map((d: string) => parseBRDate(d))
            .filter((d: Date | null): d is Date => !!d)
            .map((d: Date) => d.toLocaleString('pt-BR', { month: 'long' }).toLowerCase());
        } catch {}

        return refMonth === monthLower || singleDueMonth === monthLower || arrayDueMonths.includes(monthLower);
      });
      console.log("After month filter:", filteredData.length);
    }

    if (selectedSchool !== 'all') {
      filteredData = filteredData.filter(record => record.nome_escola === selectedSchool);
      console.log("After school filter:", filteredData.length);
    }

    // Aplicar filtro de busca apenas para nome de escola aqui
    // O filtro de cadastro será aplicado após a agregação
    if (searchTerm) {
      const term = searchTerm.trim();
      const searchLower = term.toLowerCase();
      filteredData = filteredData.filter(record => {
        // Se for busca por nome de escola
        if (record.nome_escola?.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Se for busca por cadastro (numérico), incluir o registro se contiver o cadastro exatamente
        try {
          const cadastrosArray = Array.isArray(record.cadastro)
            ? record.cadastro
            : (record.cadastro ? JSON.parse(record.cadastro) : []);
          const normalized = (cadastrosArray || []).map((c: any) => c?.toString().trim());
          return normalized.some((cad: string) => cad === term);
        } catch {
          return record.cadastro?.toString().trim() === term;
        }
      });
      console.log("After search filter:", filteredData.length);
    }
    
    console.log("Filtered data before aggregation:", filteredData.length);

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
            cadastrosSet: new Set(),
            cadastrosDetails: [],
            records: []
          });
        }
        
        const school = schoolMap.get(schoolName);
        school.totalValue += parseFloat(record.valor_gasto || 0);
        school.totalConsumption += parseFloat(record.consumo_m3 || 0);
        school.totalService += parseFloat(record.valor_servicos || 0);
        
        // Parse cadastros, valores_cadastros and consumos_m3 from JSON with error handling
        try {
          const cadastrosArray = Array.isArray(record.cadastro) ? record.cadastro : (record.cadastro ? JSON.parse(record.cadastro) : []);
          const valoresArray = Array.isArray(record.valores_cadastros) ? record.valores_cadastros : (record.valores_cadastros ? JSON.parse(record.valores_cadastros as string) : []);
          const consumosArray = Array.isArray(record.consumos_m3) ? record.consumos_m3 : (record.consumos_m3 ? JSON.parse(record.consumos_m3 as string) : []);

          // Raw vencimento list may be per index (array) or single
          let vencimentosRaw: any[] = [];
          try {
            vencimentosRaw = Array.isArray(record.datas_vencimento)
              ? (record.datas_vencimento as any[])
              : (record.datas_vencimento ? JSON.parse(record.datas_vencimento as string) : []);
          } catch {}

          // Add unique cadastros to Set and store details for each cadastro
          cadastrosArray.forEach((cadastro: string, idx: number) => {
            school.cadastrosSet.add(cadastro);

            const d = parseBRDate(vencimentosRaw[idx] ?? record.data_vencimento);
            const mesAnoForIdx = d ? formatMesAnoFromDate(d) : (record.mes_ano_referencia || '');
            
            school.cadastrosDetails.push({
              cadastro: cadastro,
              consumo: parseFloat(consumosArray[idx] || 0),
              valor: valoresArray[idx] || 0,
              mesAno: mesAnoForIdx,
              record: record
            });
          });
        } catch (error) {
          console.error("Error parsing cadastros/valores/consumos for record:", record.id, error);
        }
        
        school.records.push(record);
      });

      let result = Array.from(schoolMap.values());

      // Se houver searchTerm e não for busca por nome de escola, filtrar cadastros individuais
      if (searchTerm && !searchTerm.match(/[a-zA-Z]/)) {
        // É um número de cadastro - filtrar apenas os cadastros que correspondem
        console.log("Filtering by cadastro number:", searchTerm);
        console.log("Schools before filter:", result.length);
        
        result = result.map(school => {
          console.log(`Processing school ${school.schoolName}, cadastrosDetails:`, school.cadastrosDetails.length);
          
          const term = searchTerm.trim();
          
          const filteredDetails = school.cadastrosDetails.filter((detail: any) => {
            const cad = detail.cadastro?.toString().trim();
            const matches = cad === term;
            if (matches) {
              console.log(`  Found match: cadastro ${detail.cadastro}, mes: ${detail.mesAno}, valor: ${detail.valor}`);
            }
            return matches;
          });
          
          console.log(`  Filtered details for ${school.schoolName}:`, filteredDetails.length);
          
          // Recalcular totais baseado apenas nos cadastros filtrados
          const filteredTotalValue = filteredDetails.reduce((sum: number, detail: any) => 
            sum + (parseFloat(detail.valor) || 0), 0
          );
          const filteredTotalConsumption = filteredDetails.reduce((sum: number, detail: any) => 
            sum + (parseFloat(detail.consumo) || 0), 0
          );
          
          // Criar novo Set apenas com cadastros filtrados
          const filteredCadastrosSet = new Set(filteredDetails.map((d: any) => d.cadastro));
          
          return {
            ...school,
            cadastrosDetails: filteredDetails,
            cadastrosSet: filteredCadastrosSet,
            totalValue: filteredTotalValue,
            totalConsumption: filteredTotalConsumption
          };
        }).filter(school => school.cadastrosDetails.length > 0); // Remover escolas sem cadastros correspondentes
        
        console.log("Schools after filter:", result.length);
        if (result.length > 0) {
          console.log("Details in first school:", result[0].cadastrosDetails);
        }
      }

      // Apply value range filter only for value-range report type
      if (reportType === 'value-range' && (minValue || maxValue)) {
        result = result.filter(school => {
          const totalValue = school.totalValue;
          const min = minValue ? parseFloat(minValue) : 0;
          const max = maxValue ? parseFloat(maxValue) : Infinity;
          return totalValue >= min && totalValue <= max;
        });
      }

      // Apply comparative filter only for comparative report type
      if (reportType === 'comparative' && selectedSchools.length > 0) {
        result = result.filter(school => selectedSchools.includes(school.schoolName));
      }

      console.log("Final aggregated result:", result.length, result);
      return result;
    }

    console.log("Final filtered data (non-consolidated):", filteredData.length);
    return filteredData;
  };

  const reportData = getReportData();
  
  console.log("reportData length:", reportData.length);

  const exportToCSV = () => {
    try {
      let csvContent = "";
      const reportTitle = reportTypes.find(t => t.value === reportType)?.label || "Relatório";
      
      if (reportType === 'consolidated' || reportType === 'by-school' || 
          reportType === 'value-range' || reportType === 'comparative') {
        // Consolidated report format
        csvContent = "Escola,Total Cadastros,Consumo Total (m³),Valor Total (R$)\n";
        
        let totalConsumption = 0;
        let totalValue = 0;
        
        (reportData as any[]).forEach((school) => {
          csvContent += `"${school.schoolName}",${school.cadastrosSet?.size || 0},${school.totalConsumption?.toFixed(1) || '0.0'},${school.totalValue?.toFixed(2) || '0.00'}\n`;
          totalConsumption += school.totalConsumption || 0;
          totalValue += school.totalValue || 0;
        });
        
        csvContent += `\nTOTAL GERAL,,${totalConsumption.toFixed(1)},${totalValue.toFixed(2)}\n`;
      } else {
        // Detailed report format
        csvContent = "Cadastro,Escola,Mês/Ano,Consumo (m³),Valor (R$)\n";
        
        let totalConsumption = 0;
        let totalValue = 0;
        
        (reportData as any[]).forEach((record) => {
          csvContent += `"${record.cadastro}","${record.nome_escola}","${record.mes_ano_referencia}",${parseFloat(record.consumo_m3 || 0).toFixed(1)},${parseFloat(record.valor_gasto || 0).toFixed(2)}\n`;
          totalConsumption += parseFloat(record.consumo_m3 || 0);
          totalValue += parseFloat(record.valor_gasto || 0);
        });
        
        csvContent += `\nTOTAL GERAL,,,${totalConsumption.toFixed(1)},${totalValue.toFixed(2)}\n`;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio_agua_${reportType}_${selectedYear}_${selectedMonth}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportado com sucesso",
        description: "O arquivo CSV foi baixado",
      });
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o arquivo CSV",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const reportTitle = reportTypes.find(t => t.value === reportType)?.label || "Relatório";
      
      // Header
      doc.setFontSize(18);
      doc.text(`Relatório de Água - ${reportTitle}`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Período: ${selectedMonth === 'todos' ? 'Anual' : selectedMonth} - ${selectedYear}`, 14, 28);
      
      if (reportType === 'consolidated' || reportType === 'by-school' || 
          reportType === 'value-range' || reportType === 'comparative') {
        // Consolidated report format
        const tableData = (reportData as any[]).map((school) => [
          school.schoolName,
          school.cadastrosSet?.size || 0,
          `${school.totalConsumption?.toFixed(1) || '0.0'}m³`,
          `R$ ${school.totalValue?.toFixed(2) || '0.00'}`
        ]);
        
        // Calculate totals
        const totalConsumption = (reportData as any[]).reduce((sum, s) => sum + (s.totalConsumption || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, s) => sum + (s.totalValue || 0), 0);
        
        autoTable(doc, {
          head: [['Escola', 'Total Cadastros', 'Consumo Total', 'Valor Total']],
          body: tableData,
          foot: [['TOTAL GERAL', '', `${totalConsumption.toFixed(1)}m³`, `R$ ${totalValue.toFixed(2)}`]],
          startY: 35,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          footStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
        });
      } else {
        // Detailed report format
        const tableData = (reportData as any[]).map((record) => [
          record.cadastro,
          record.nome_escola,
          record.mes_ano_referencia,
          `${parseFloat(record.consumo_m3 || 0).toFixed(1)}m³`,
          `R$ ${parseFloat(record.valor_gasto || 0).toFixed(2)}`
        ]);
        
        // Calculate totals
        const totalConsumption = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.consumo_m3 || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.valor_gasto || 0), 0);
        
        autoTable(doc, {
          head: [['Cadastro', 'Escola', 'Mês/Ano', 'Consumo', 'Valor']],
          body: tableData,
          foot: [['TOTAL GERAL', '', '', `${totalConsumption.toFixed(1)}m³`, `R$ ${totalValue.toFixed(2)}`]],
          startY: 35,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          footStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
        });
      }
      
      doc.save(`relatorio_agua_${reportType}_${selectedYear}_${selectedMonth}.pdf`);
      
      toast({
        title: "Exportado com sucesso",
        description: "O arquivo PDF foi baixado",
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o arquivo PDF",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Imprimir",
      description: "Abrindo janela de impressão",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Enviar por email",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleEdit = (record: any) => {
    setRecordToEdit(record);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updatedData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro ao atualizar",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("school_records")
        .update({ ...updatedData, user_id: user.id })
        .eq("id", recordToEdit.id);

      if (error) throw error;

      toast({
        title: "Registro atualizado",
        description: "O registro foi atualizado com sucesso",
      });

      setEditDialogOpen(false);
      setRecordToEdit(null);
      fetchData();
    } catch (error: any) {
      console.error("Error updating record:", error);
      toast({
        title: "Erro ao atualizar",
        description: error?.message || "Não foi possível atualizar o registro",
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
    // Calculate totals
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
            <TableHead className="text-right">Ações</TableHead>
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
                    {school.cadastrosSet?.size || 0} cadastros
                  </Badge>
                </TableCell>
                <TableCell>{school.totalConsumption?.toFixed(1) || '0.0'}m³</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(school.totalValue || 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(school.records[0])}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(school.records[0])}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.has(index) && (
                <TableRow key={`${index}-details`}>
                  <TableCell colSpan={6} className="bg-muted/30 p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-2">Detalhes dos Cadastros:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {(() => {
                          // Agrupar por cadastro para calcular totais quando há múltiplos registros do mesmo cadastro
                          const cadastroGroups = school.cadastrosDetails.reduce((acc: any, detail: any) => {
                            if (!acc[detail.cadastro]) {
                              acc[detail.cadastro] = {
                                cadastro: detail.cadastro,
                                details: [],
                                totalConsumo: 0,
                                totalValor: 0
                              };
                            }
                            acc[detail.cadastro].details.push(detail);
                            acc[detail.cadastro].totalConsumo += detail.consumo || 0;
                            acc[detail.cadastro].totalValor += detail.valor || 0;
                            return acc;
                          }, {});

                          return Object.values(cadastroGroups).map((group: any, groupIndex: number) => (
                            <div key={groupIndex} className="space-y-1">
                              <div className="flex justify-between items-center p-3 bg-background rounded border">
                                <div className="flex flex-col gap-1">
                                  <span className="font-mono text-sm font-semibold">{group.cadastro}</span>
                                  {group.details.length > 1 && (
                                    <span className="text-xs text-muted-foreground">
                                      {group.details.length} registros
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-muted-foreground">
                                      {group.totalConsumo.toFixed(1)} m³
                                    </span>
                                    <span className="font-semibold text-primary">
                                      {formatCurrency(group.totalValor || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {group.details.length >= 1 && (
                                <div className="ml-4 space-y-1">
                                  {group.details.map((detail: any, detailIndex: number) => (
                                    <div key={detailIndex} className="flex justify-between items-center p-2 bg-muted/50 rounded border border-muted">
                                      <div className="flex items-center gap-4">
                                        <span className="text-xs text-muted-foreground min-w-[80px]">{detail.mesAno}</span>
                                        <span className="text-xs text-muted-foreground min-w-[60px]">
                                          {(detail.consumo || 0).toFixed(1)} m³
                                        </span>
                                        <span className="text-sm font-medium min-w-[80px]">
                                          {formatCurrency(detail.valor || 0)}
                                        </span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleEdit(detail.record)}
                                          className="h-6 w-6"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteClick(detail.record)}
                                          className="h-6 w-6 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t mt-3">
                        <span className="font-semibold">Soma Total:</span>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm text-muted-foreground">
                            {school.totalConsumption?.toFixed(1) || '0.0'} m³
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(school.totalValue || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
          {reportData.length > 0 && (
            <TableRow className="bg-primary/5 border-t-2 border-primary">
              <TableCell colSpan={3} className="font-bold text-lg">TOTAL GERAL</TableCell>
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

  const renderDetailedTable = () => {
    // Calculate totals for detailed table
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
          {reportData.length > 0 && (
            <TableRow className="bg-primary/5 border-t-2 border-primary">
              <TableCell colSpan={4} className="font-bold text-lg">TOTAL GERAL</TableCell>
              <TableCell className="font-bold text-lg">{totals.totalConsumption.toFixed(1)}m³</TableCell>
              <TableCell className="font-bold text-lg text-primary">
                {formatCurrency(totals.totalValue)}
              </TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

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
      <div className="flex items-center flex-wrap gap-4">
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <Button onClick={exportToPDF} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button onClick={() => setDataReviewOpen(true)} variant="outline">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Conferência
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleSendEmail} variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Enviar por email
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

      <DataReview
        open={dataReviewOpen}
        onOpenChange={setDataReviewOpen}
      />
    </div>
  );
}
