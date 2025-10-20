import { useState, useEffect } from "react";
import { Download, FileText, Search, Filter, Pencil, Trash2, ClipboardCheck, Printer } from "lucide-react";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnergyRegistration } from "./EnergyRegistration";
import { DataReview } from "./DataReview";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoSJRP from '@/assets/logo-sjrp.png';
import {
  FieldSelector,
  SchoolMultiSelector,
  MonthSelector,
  MacroregionSelector,
  SchoolTypeSelector,
  SelectedFieldsReport,
  MonthlyComparisonReport,
  StudentComparisonReport,
  MacroregionComparisonReport,
  SchoolTypeComparisonReport,
} from "./AdvancedEnergyReports";
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
  { value: 'selected-fields', label: 'Por Campos Selecionados' },
  { value: 'monthly-comparison', label: 'Comparativo por Meses' },
  { value: 'student-comparison', label: 'Comparativo por Total de Alunos' },
  { value: 'macroregion-comparison', label: 'Comparativo por Macrorregião' },
  { value: 'school-type-comparison', label: 'Comparativo por Tipo de Escola' },
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
  const [schoolsData, setSchoolsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [dataReviewOpen, setDataReviewOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(['cadastro_cliente', 'consumo_kwh', 'valor_gasto']);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedMacroregions, setSelectedMacroregions] = useState<string[]>([]);
  const [selectedSchoolTypes, setSelectedSchoolTypes] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
      
      const { data: records, error } = await supabase
        .from("energy_records")
        .select("*")
        .order("nome_escola");

      if (error) throw error;

      console.log("Dados reais carregados do energy_records:", records?.length);
      setData(records || []);
      
      const uniqueSchools = Array.from(new Set(records?.map(r => r.nome_escola) || []));
      setSchools(uniqueSchools as string[]);

      // Fetch schools data for student comparison
      if (user) {
        const { data: schoolsDataFetch } = await supabase
          .from("schools")
          .select("*")
          .eq("user_id", user.id);
        
        setSchoolsData(schoolsDataFetch || []);
      }
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

    // Aplicar filtro de busca apenas para nome de escola aqui
    // O filtro de cadastro será aplicado após a agregação
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(record => {
        // Se for busca por nome de escola
        if (record.nome_escola?.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Se for busca por cadastro
        return record.cadastro_cliente?.includes(searchTerm);
      });
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
            cadastrosDetails: [],
            records: []
          });
        }
        
        const school = schoolMap.get(schoolName);
        school.totalValue += parseFloat(record.valor_gasto || 0);
        school.totalConsumption += parseFloat(record.consumo_kwh || 0);
        school.totalService += parseFloat(record.valor_servicos || 0);
        school.cadastros.push(record.cadastro_cliente);
        school.cadastrosDetails.push({
          cadastro: record.cadastro_cliente,
          mesAno: record.mes_ano_referencia,
          consumo: typeof record.consumo_kwh === 'number' ? record.consumo_kwh : (parseFloat(String(record.consumo_kwh || 0).replace(',', '.')) || 0),
          valor: typeof record.valor_gasto === 'number' ? record.valor_gasto : (parseFloat(String(record.valor_gasto || 0).replace(/[R$\s.]/g, '').replace(',', '.')) || 0),
          record: record
        });
        school.records.push(record);
      });

      let result = Array.from(schoolMap.values());

      // Se houver searchTerm e não for busca por nome de escola, filtrar cadastros individuais
      if (searchTerm && !searchTerm.match(/[a-zA-Z]/)) {
        // É um número de cadastro - filtrar apenas os cadastros que correspondem
        result = result.map(school => {
          const filteredDetails = school.cadastrosDetails.filter((detail: any) => 
            detail.cadastro?.includes(searchTerm)
          );
          
          // Recalcular totais baseado apenas nos cadastros filtrados
          const filteredTotalValue = filteredDetails.reduce((sum: number, detail: any) => 
            sum + (detail.valor || 0), 0
          );
          const filteredTotalConsumption = filteredDetails.reduce((sum: number, detail: any) => 
            sum + (detail.consumo || 0), 0
          );
          
          // Atualizar array de cadastros
          const filteredCadastros = filteredDetails.map((d: any) => d.cadastro);
          
          return {
            ...school,
            cadastrosDetails: filteredDetails,
            cadastros: filteredCadastros,
            totalValue: filteredTotalValue,
            totalConsumption: filteredTotalConsumption
          };
        }).filter(school => school.cadastrosDetails.length > 0); // Remover escolas sem cadastros correspondentes
      }

      // Recompute totals from cadastrosDetails to ensure correct aggregation across multiple cadastros
      result = result.map((school: any) => {
        const details = school.cadastrosDetails || [];
        const totalValue = details.reduce((sum: number, d: any) => sum + (parseFloat(d.valor) || 0), 0);
        const totalConsumption = details.reduce((sum: number, d: any) => sum + (parseFloat(d.consumo) || 0), 0);
        const cadastros = Array.from(new Set(details.map((d: any) => d.cadastro)));
        return { ...school, totalValue, totalConsumption, cadastros };
      });

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

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const reportTitle = reportTypes.find(t => t.value === reportType)?.label || 'Relatório';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const generatedAt = new Date().toLocaleString('pt-BR');

      const res = await fetch(logoSJRP);
      const blob = await res.blob();
      const logoDataUrl: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const headerHeight = 28;
      const footerHeight = 22;

      const drawHeaderFooter = () => {
        if (logoDataUrl) {
          try { doc.addImage(logoDataUrl, 'PNG', 12, 10, 26, 16); } catch {}
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Gestão de Custos – Secretaria Municipal de Educação', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Relatório de Energia – ${reportTitle}`, pageWidth / 2, 26, { align: 'center' });
        doc.text(`Período: ${selectedMonth === 'todos' ? 'Anual' : selectedMonth} / ${selectedYear}` , pageWidth - 12, 18, { align: 'right' });
        const footerY = pageHeight - 10;
        doc.setFontSize(9);
        doc.text(`Gerado por: ${userEmail || 'usuário desconhecido'} • ${generatedAt}`, 12, footerY);
        doc.text('Rua General Glicério, 3947 – Vila Imperial – CEP 15015-400 – São José do Rio Preto-SP – Telefone (17) 32114000', pageWidth - 12, footerY, { align: 'right' });
      };

      const tableCommon = {
        startY: headerHeight + 10,
        margin: { top: headerHeight + 6, bottom: footerHeight + 6, left: 12, right: 12 },
        theme: 'grid' as const,
        headStyles: { fillColor: [41, 128, 185] as [number, number, number] },
        footStyles: { fillColor: [52, 152, 219] as [number, number, number], fontStyle: 'bold' as const },
        didDrawPage: () => drawHeaderFooter(),
      };

      if (reportType === 'consolidated' || reportType === 'by-school' || reportType === 'value-range' || reportType === 'comparative') {
        const tableData = (reportData as any[]).map((school) => [
          school.schoolName,
          school.cadastros?.length || 0,
          `${school.totalConsumption?.toFixed(1) || '0.0'} KWh`,
          `R$ ${school.totalValue?.toFixed(2) || '0.00'}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, s) => sum + (s.totalConsumption || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, s) => sum + (s.totalValue || 0), 0);

        autoTable(doc, { 
          ...tableCommon, 
          head: [['Escola', 'Total Cadastros', 'Consumo Total', 'Valor Total']], 
          body: tableData, 
          foot: [['TOTAL GERAL', '', `${totalConsumption.toFixed(1)} KWh`, `R$ ${totalValue.toFixed(2)}`]],
          columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          }
        });
      } else {
        const tableData = (reportData as any[]).map((record) => [
          record.cadastro_cliente,
          record.nome_escola,
          record.mes_ano_referencia,
          `${parseFloat(record.consumo_kwh || 0).toFixed(1)} KWh`,
          `R$ ${parseFloat(record.valor_gasto || 0).toFixed(2)}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.consumo_kwh || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.valor_gasto || 0), 0);
        autoTable(doc, { ...tableCommon, head: [['Cadastro', 'Escola', 'Mês/Ano', 'Consumo', 'Valor']], body: tableData, foot: [['TOTAL GERAL', '', '', `${totalConsumption.toFixed(1)} KWh`, `R$ ${totalValue.toFixed(2)}`]] });
      }

      doc.save(`relatorio_energia_${reportType}_${selectedYear}_${selectedMonth}.pdf`);
      toast({ title: 'Exportado com sucesso', description: 'O arquivo PDF foi baixado' });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({ title: 'Erro ao exportar', description: 'Não foi possível exportar o arquivo PDF', variant: 'destructive' });
    }
};

  const handlePrint = async () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const reportTitle = reportTypes.find(t => t.value === reportType)?.label || 'Relatório';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const generatedAt = new Date().toLocaleString('pt-BR');

      const res = await fetch(logoSJRP);
      const blob = await res.blob();
      const logoDataUrl: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const headerHeight = 28;
      const footerHeight = 22;

      const drawHeaderFooter = () => {
        if (logoDataUrl) {
          try { doc.addImage(logoDataUrl, 'PNG', 12, 10, 26, 16); } catch {}
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Gestão de Custos – Secretaria Municipal de Educação', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Relatório de Energia – ${reportTitle}`, pageWidth / 2, 26, { align: 'center' });
        doc.text(`Período: ${selectedMonth === 'todos' ? 'Anual' : selectedMonth} / ${selectedYear}` , pageWidth - 12, 18, { align: 'right' });
        const footerY = pageHeight - 10;
        doc.setFontSize(9);
        doc.text(`Gerado por: ${userEmail || 'usuário desconhecido'} • ${generatedAt}`, 12, footerY);
        doc.text('Rua General Glicério, 3947 – Vila Imperial – CEP 15015-400 – São José do Rio Preto-SP – Telefone (17) 32114000', pageWidth - 12, footerY, { align: 'right' });
      };

      const tableCommon = {
        startY: headerHeight + 10,
        margin: { top: headerHeight + 6, bottom: footerHeight + 6, left: 12, right: 12 },
        theme: 'grid' as const,
        headStyles: { fillColor: [41, 128, 185] as [number, number, number] },
        footStyles: { fillColor: [52, 152, 219] as [number, number, number], fontStyle: 'bold' as const },
        didDrawPage: () => drawHeaderFooter(),
      };

      if (reportType === 'consolidated' || reportType === 'by-school' || reportType === 'value-range' || reportType === 'comparative') {
        const tableData = (reportData as any[]).map((school) => [
          school.schoolName,
          school.cadastros?.length || 0,
          `${school.totalConsumption?.toFixed(1) || '0.0'} KWh`,
          `R$ ${school.totalValue?.toFixed(2) || '0.00'}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, s) => sum + (s.totalConsumption || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, s) => sum + (s.totalValue || 0), 0);
        autoTable(doc, { 
          ...tableCommon, 
          head: [['Escola', 'Total Cadastros', 'Consumo Total', 'Valor Total']], 
          body: tableData, 
          foot: [['TOTAL GERAL', '', `${totalConsumption.toFixed(1)} KWh`, `R$ ${totalValue.toFixed(2)}`]],
          columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          }
        });
      } else {
        const tableData = (reportData as any[]).map((record) => [
          record.cadastro_cliente,
          record.nome_escola,
          record.mes_ano_referencia,
          `${parseFloat(record.consumo_kwh || 0).toFixed(1)} KWh`,
          `R$ ${parseFloat(record.valor_gasto || 0).toFixed(2)}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.consumo_kwh || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.valor_gasto || 0), 0);
        autoTable(doc, { ...tableCommon, head: [['Cadastro', 'Escola', 'Mês/Ano', 'Consumo', 'Valor']], body: tableData, foot: [['TOTAL GERAL', '', '', `${totalConsumption.toFixed(1)} KWh`, `R$ ${totalValue.toFixed(2)}`]] });
      }

      const url = doc.output('bloburl');
      window.open(url, '_blank');
      toast({ title: 'Visualização gerada', description: 'O PDF foi aberto para visualização. Use o botão do visor para imprimir.' });
    } catch (error) {
      console.error('Erro ao gerar visualização de impressão:', error);
      toast({ title: 'Erro ao imprimir', description: 'Não foi possível gerar a visualização do PDF', variant: 'destructive' });
    }
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    try {
      const { error } = await supabase
        .from("energy_records")
        .delete()
        .eq("id", recordToDelete);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Erro",
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
            <TableHead>Consumo Total (KWh)</TableHead>
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
                    {school.cadastros?.length || 0} cadastros
                  </Badge>
                </TableCell>
                <TableCell>{school.totalConsumption?.toFixed(1) || '0.0'} KWh</TableCell>
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
                      onClick={() => {
                        setRecordToDelete(school.records[0].id);
                        setDeleteDialogOpen(true);
                      }}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.has(index) && (
                <TableRow key={`${index}-details`}>
                  <TableCell colSpan={6} className="bg-muted/30 p-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base mb-3 text-primary">Detalhes dos Cadastros</h4>
                      {(() => {
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
                          const consumoNum = detail.consumo || 0;
                          const valorNum = detail.valor || 0;
                          acc[detail.cadastro].totalConsumo += Number(consumoNum);
                          acc[detail.cadastro].totalValor += Number(valorNum);
                          return acc;
                        }, {});

                        return (
                          <div className="space-y-4">
                            {Object.values(cadastroGroups).map((group: any, groupIndex: number) => (
                              <div key={groupIndex} className="border rounded-lg overflow-hidden">
                                <div className="bg-primary/10 px-4 py-2 border-b">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-sm font-semibold">Cadastro: {group.cadastro}</span>
                                    <div className="flex gap-4 items-center">
                                      <span className="text-sm font-medium">{group.totalConsumo.toFixed(1)} KWh</span>
                                      <span className="text-sm font-bold text-primary">{formatCurrency(group.totalValor)}</span>
                                    </div>
                                  </div>
                                </div>
                                {group.details.length >= 1 && (
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="w-[180px]">Mês/Ano</TableHead>
                                        <TableHead className="text-right w-[120px]">Consumo (KWh)</TableHead>
                                        <TableHead className="text-right w-[120px]">Valor (R$)</TableHead>
                                        <TableHead className="text-right w-[100px]">Ações</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.details.map((detail: any, detailIndex: number) => (
                                        <TableRow 
                                          key={detailIndex}
                                          className={detailIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                                        >
                                          <TableCell className="font-medium text-sm">
                                            {detail.mesAno || '—'}
                                          </TableCell>
                                          <TableCell className="text-right font-medium">
                                            {(detail.consumo || 0).toFixed(1)}
                                          </TableCell>
                                          <TableCell className="text-right font-semibold text-primary">
                                            {formatCurrency(detail.valor || 0)}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(detail.record)}
                                                className="h-7 w-7"
                                              >
                                                <Pencil className="h-3.5 w-3.5" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                  setRecordToDelete(detail.record.id);
                                                  setDeleteDialogOpen(true);
                                                }}
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                              <span className="font-bold text-base">Soma Total da Escola:</span>
                              <div className="flex gap-6 items-center">
                                <span className="text-base font-semibold">
                                  {school.totalConsumption?.toFixed(1) || '0.0'} KWh
                                </span>
                                <span className="text-lg font-bold text-primary">
                                  {formatCurrency(school.totalValue || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
          {reportData.length > 0 && (
            <TableRow className="bg-primary/5 border-t-2 border-primary">
              <TableCell colSpan={3} className="font-bold text-lg">TOTAL GERAL</TableCell>
              <TableCell className="font-bold text-lg">{totals.totalConsumption.toFixed(1)} KWh</TableCell>
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
    const totalConsumption = (reportData as any[]).reduce((sum, record) => sum + (parseFloat(record.consumo_kwh) || 0), 0);
    const totalValue = (reportData as any[]).reduce((sum, record) => sum + (parseFloat(record.valor_gasto) || 0), 0);
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cadastro</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Mês/Ano</TableHead>
            <TableHead>Consumo (KWh)</TableHead>
            <TableHead>Valor (R$)</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(reportData as any[]).map((record, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-sm">{record.cadastro_cliente}</TableCell>
              <TableCell className="font-medium">{record.nome_escola}</TableCell>
              <TableCell>{record.mes_ano_referencia}</TableCell>
              <TableCell>{parseFloat(record.consumo_kwh || 0).toFixed(1)} KWh</TableCell>
              <TableCell>{formatCurrency(parseFloat(record.valor_gasto || 0))}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(record)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setRecordToDelete(record.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-bold">TOTAL GERAL</TableCell>
            <TableCell className="font-bold">{totalConsumption.toFixed(1)} KWh</TableCell>
            <TableCell className="font-bold">{formatCurrency(totalValue)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
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

      {/* Advanced Filters */}
      {reportType === 'selected-fields' && (
        <FieldSelector selectedFields={selectedFields} onChange={setSelectedFields} />
      )}
      {reportType === 'monthly-comparison' && (
        <div className="space-y-4">
          <SchoolMultiSelector schools={schools} selectedSchools={selectedSchools} onChange={setSelectedSchools} maxSchools={15} />
          <MonthSelector selectedMonths={selectedMonths} onChange={setSelectedMonths} />
        </div>
      )}
      {reportType === 'student-comparison' && (
        <SchoolMultiSelector schools={schools} selectedSchools={selectedSchools} onChange={setSelectedSchools} maxSchools={15} />
      )}
      {reportType === 'macroregion-comparison' && (
        <MacroregionSelector selectedMacroregions={selectedMacroregions} onChange={setSelectedMacroregions} />
      )}
      {reportType === 'school-type-comparison' && (
        <SchoolTypeSelector selectedSchoolTypes={selectedSchoolTypes} onChange={setSelectedSchoolTypes} />
      )}

      <div className="flex items-center space-x-4">
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <Button onClick={exportToPDF} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button onClick={async () => await handlePrint()} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={() => setDataReviewOpen(true)} variant="outline">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Conferência
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
          {reportType === 'selected-fields' ? (
            <SelectedFieldsReport data={reportData} selectedFields={selectedFields} />
          ) : reportType === 'monthly-comparison' ? (
            <MonthlyComparisonReport data={data} selectedSchools={selectedSchools} selectedMonths={selectedMonths} />
          ) : reportType === 'student-comparison' ? (
            <StudentComparisonReport data={data} schoolsData={schoolsData} selectedSchools={selectedSchools} />
          ) : reportType === 'macroregion-comparison' ? (
            <MacroregionComparisonReport data={data} selectedMacroregions={selectedMacroregions} />
          ) : reportType === 'school-type-comparison' ? (
            <SchoolTypeComparisonReport data={data} selectedSchoolTypes={selectedSchoolTypes} />
          ) : reportType === 'consolidated' || reportType === 'by-school' 
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
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          <EnergyRegistration
            onSuccess={() => {
              setIsEditDialogOpen(false);
              fetchData();
            }}
            editData={selectedRecord}
            viewMode={false}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
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
