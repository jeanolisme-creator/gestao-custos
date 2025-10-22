import { useState, useEffect } from "react";
import { Download, FileText, Search, Filter, Pencil, Trash2, Printer, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoSJRP from "@/assets/logo-sjrp.png";
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
} from "./AdvancedWaterReports";
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
  const [schoolsData, setSchoolsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [dataReviewOpen, setDataReviewOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(['cadastro', 'consumo_m3', 'valor_gasto']);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedMacroregions, setSelectedMacroregions] = useState<string[]>([]);
  const [selectedSchoolTypes, setSelectedSchoolTypes] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
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
      if (user?.email) setUserEmail(user.email);
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
      const { data: schoolsDataFetch } = await supabase
        .from("schools")
        .select("*")
        .eq("user_id", user.id);
      
      setSchoolsData(schoolsDataFetch || []);
      const registeredSchools = schoolsDataFetch?.map(s => s.nome_escola).filter(Boolean) || [];
      
      // Combine both lists and remove duplicates, then sort alphabetically
      const allSchools = Array.from(new Set([...recordsSchools, ...registeredSchools])).sort();
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
    // Handle ISO yyyy-mm-dd explicitly to avoid timezone shifts
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const [yyyy, mm, dd] = s.split('T')[0].split('-');
      const year = parseInt(yyyy, 10);
      const month = parseInt(mm, 10) - 1;
      const day = parseInt(dd, 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    // Fallback to native parser (handles other ISO variants)
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatMesAnoFromDate = (d: Date): string => {
    const month = d.toLocaleString('pt-BR', { month: 'long' });
    return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${d.getFullYear()}`;
  };

  // Deriva o mês/ano de referência a partir da data de vencimento: mês anterior
  const getPreviousMonthLabel = (d: Date): string => {
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return formatMesAnoFromDate(prev);
  };
  const ptMonths = [
    'janeiro','fevereiro','março','abril','maio','junho',
    'julho','agosto','setembro','outubro','novembro','dezembro'
  ];
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const monthIndexFromName = (name: string): number | null => {
    if (!name) return null;
    const n = normalize(name);
    // Handle possible "marco" without cedilla and abbreviations
    const aliases: Record<string, number> = {
      'janeiro': 0, 'jan': 0,
      'fevereiro': 1, 'fev': 1,
      'março': 2, 'marco': 2, 'mar': 2,
      'abril': 3, 'abr': 3,
      'maio': 4, 'mai': 4,
      'junho': 5, 'jun': 5,
      'julho': 6, 'jul': 6,
      'agosto': 7, 'ago': 7,
      'setembro': 8, 'set': 8,
      'outubro': 9, 'out': 9,
      'novembro': 10, 'nov': 10,
      'dezembro': 11, 'dez': 11,
    };
    if (n in aliases) return aliases[n];
    // Try direct index
    const idx = ptMonths.findIndex(m => normalize(m) === n);
    return idx >= 0 ? idx : null;
  };
  const parseMesAnoReferencia = (value: any): { monthIndex: number, year: number } | null => {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    const parts = s.split(/[\/\-]/).map(p => p.trim());
    if (parts.length >= 2) {
      const left = parts[0];
      const right = parts[1];
      let monthIndex: number | null = null;
      // numeric?
      const num = parseInt(left, 10);
      if (!isNaN(num)) {
        monthIndex = Math.max(0, Math.min(11, num - 1));
      } else {
        monthIndex = monthIndexFromName(left);
      }
      let year = parseInt(right, 10);
      if (!isNaN(year) && year < 100) {
        year = 2000 + year; // normalizar anos com 2 dígitos (ex.: 25 => 2025)
      }
      if (monthIndex !== null && !isNaN(year)) return { monthIndex, year };
    }
    // Try full month name in string
    for (let i = 0; i < ptMonths.length; i++) {
      const m = ptMonths[i];
      if (normalize(s).includes(normalize(m))) {
        const yearMatch = s.match(/\d{2,4}/);
        if (yearMatch) {
          let y = parseInt(yearMatch[0], 10);
          if (!isNaN(y) && y < 100) {
            y = 2000 + y;
          }
          return { monthIndex: i, year: y };
        }
      }
    }
    return null;
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

      const refParsed = parseMesAnoReferencia(mesAno);
      const refYear = refParsed ? refParsed.year.toString() : null;
      const matches = refYear === year || singleDueYear === year || arrayDueYears.includes(year);
      if (!matches) {
        console.log("Record filtered out:", record.nome_escola, { mes_ano_referencia: mesAno, singleDueYear, arrayDueYears }, "doesn't include", year);
      }
      return matches;
    });
    
    console.log("After year filter:", filteredData.length);
    
    // Não filtramos por mês nesta etapa; filtragem por mês será aplicada nos detalhes (cadastros)
    if (selectedMonth !== 'todos') {
      console.log("Month filter will be applied at detail level only");
    }

    if (selectedSchool !== 'all') {
      filteredData = filteredData.filter(record => record.nome_escola === selectedSchool);
      console.log("After school filter:", filteredData.length);
    }

    // Aplicar filtro de busca apenas para nome de escola aqui
    // O filtro de cadastro detalhado será aplicado após a agregação, mas aqui já pré-selecionamos registros prováveis
    if (searchTerm) {
      const term = searchTerm.trim();
      const termDigits = term.replace(/\D/g, '');
      const searchLower = term.toLowerCase();
      filteredData = filteredData.filter(record => {
        // Se for busca por nome de escola
        if (record.nome_escola?.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Se for busca por cadastro (numérico ou com máscara), incluir o registro se contiver o cadastro parcial
        try {
          const cadastrosArray = Array.isArray(record.cadastro)
            ? record.cadastro
            : (record.cadastro ? JSON.parse(record.cadastro) : []);
          const normalized = (cadastrosArray || []).map((c: any) => (c?.toString().trim() || ''));
          return normalized.some((cad: string) => {
            const cadDigits = cad.replace(/\D/g, '');
            return cad === term || cadDigits === termDigits || (termDigits && cadDigits.includes(termDigits));
          });
        } catch {
          const cadStr = record.cadastro?.toString().trim() || '';
          const cadDigits = cadStr.replace(/\D/g, '');
          return cadStr === term || cadDigits === termDigits || (termDigits && cadDigits.includes(termDigits));
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
            const mesRefOriginal = record.mes_ano_referencia || '';
            const mesVenc = d ? formatMesAnoFromDate(d) : '';

            // Determinar o mês de exibição sempre a partir do vencimento quando disponível:
            // Regra: mês de referência = mês anterior ao vencimento (ex.: venc. 28/02/2025 => ref jan/2025)
            const refParsed = parseMesAnoReferencia(mesRefOriginal);
            const vencParsed = parseMesAnoReferencia(mesVenc);
            const mesRefFromDue = d ? getPreviousMonthLabel(d) : '';

            // Prioridade: usar mês derivado do vencimento quando existir; caso contrário, usar o original do banco
            let mesRefDisplay = mesRefFromDue || (refParsed ? mesRefOriginal : '');

            // Se não houver vencimento válido e houver competência válida no banco, manter a original
            if (!mesRefDisplay) {
              mesRefDisplay = mesRefOriginal;
            }

            // Debug específico para fevereiro -> janeiro
            if (vencParsed && vencParsed.monthIndex === 1) {
              console.log(`Ajuste ref por vencimento FEVEReiro: cad=${cadastro}, refOriginal=${mesRefOriginal}, refExibicao=${mesRefDisplay}, venc=${mesVenc}`);
            }
            
            // Parse consumo value properly - handle both string and number formats
            let consumoValue = 0;
            const consumoRaw = consumosArray[idx];
            if (consumoRaw !== null && consumoRaw !== undefined && consumoRaw !== '') {
              if (typeof consumoRaw === 'string') {
                // Remove any non-numeric characters except decimal separators
                const cleaned = consumoRaw.replace(/[^\d.,\-]/g, '').replace(',', '.');
                consumoValue = parseFloat(cleaned) || 0;
              } else {
                consumoValue = Number(consumoRaw) || 0;
              }
            }
            
            // Parse valor properly - handle empty, null and undefined values correctly
            let valorValue = 0;
            const valorRaw = valoresArray[idx];
            if (valorRaw !== null && valorRaw !== undefined && valorRaw !== '' && valorRaw !== 0) {
              if (typeof valorRaw === 'string') {
                const cleaned = valorRaw.replace(/[R$\s.]/g, '').replace(',', '.');
                if (cleaned && cleaned !== '0') {
                  valorValue = parseFloat(cleaned) || 0;
                }
              } else {
                valorValue = Number(valorRaw) || 0;
              }
            }
            
            console.log(`Cadastro ${cadastro} (${mesRefDisplay}): consumo raw=${JSON.stringify(consumoRaw)}, parsed=${consumoValue}, valor raw=${JSON.stringify(valorRaw)}, parsed=${valorValue}`);
            
            school.cadastrosDetails.push({
              cadastro: cadastro,
              consumo: consumoValue,
              valor: valorValue,
              mesAno: mesRefDisplay, // backward compatibility
              mesRef: mesRefDisplay,
              mesVenc: mesVenc,
              record: record
            });
          });
        } catch (error) {
          console.error("Error parsing cadastros/valores/consumos for record:", record.id, error);
        }
        
        school.records.push(record);
      });

      let result = Array.from(schoolMap.values());
      
      // Detail-level month filter to keep only details matching selected month
      if (selectedMonth !== 'todos') {
        const selectedIdx = monthIndexFromName(selectedMonth) ?? null;
        result = result
          .map((school: any) => {
            const filteredDetails = (school.cadastrosDetails || []).filter((detail: any) => {
              // Filtrar pelo mês de exibição (mesRef) que já foi ajustado na criação dos detalhes
              const displayParsed = parseMesAnoReferencia(detail.mesRef || detail.mesAno || '');
              const displayIdx = displayParsed ? displayParsed.monthIndex : null;

              if (selectedIdx === null) return true;
              const matches = displayIdx === selectedIdx;

              // Debug para Janeiro
              if (selectedIdx === 0 && detail.cadastro) {
                console.log(`Detail cad ${detail.cadastro}: displayIdx=${displayIdx}, sel=${selectedIdx}, mesRef=${detail.mesRef}, mesVenc=${detail.mesVenc}`);
              }

              return matches;
            });
            const filteredTotalValue = filteredDetails.reduce((sum: number, d: any) => sum + (parseFloat(d.valor) || 0), 0);
            const filteredTotalConsumption = filteredDetails.reduce((sum: number, d: any) => sum + (parseFloat(d.consumo) || 0), 0);
            const filteredCadastrosSet = new Set(filteredDetails.map((d: any) => d.cadastro));
            return {
              ...school,
              cadastrosDetails: filteredDetails,
              cadastrosSet: filteredCadastrosSet,
              totalValue: filteredTotalValue,
              totalConsumption: filteredTotalConsumption
            };
          })
          .filter((school: any) => (school.cadastrosDetails || []).length > 0);
      } else {
        // When viewing annual data, ensure only records from selectedYear are shown (using display month)
        result = result
          .map((school: any) => {
            const filteredDetails = (school.cadastrosDetails || []).filter((detail: any) => {
              // Filtrar pelo mês de exibição (mesRef) que já foi ajustado
              const displayParsed = parseMesAnoReferencia(detail.mesRef || detail.mesAno || '');
              const displayYear = displayParsed ? displayParsed.year.toString() : null;
              return displayYear === selectedYear;
            });
            const filteredTotalValue = filteredDetails.reduce((sum: number, d: any) => sum + (parseFloat(d.valor) || 0), 0);
            const filteredTotalConsumption = filteredDetails.reduce((sum: number, d: any) => sum + (parseFloat(d.consumo) || 0), 0);
            const filteredCadastrosSet = new Set(filteredDetails.map((d: any) => d.cadastro));
            return {
              ...school,
              cadastrosDetails: filteredDetails,
              cadastrosSet: filteredCadastrosSet,
              totalValue: filteredTotalValue,
              totalConsumption: filteredTotalConsumption
            };
          })
          .filter((school: any) => (school.cadastrosDetails || []).length > 0);
      }
      
      // Se houver searchTerm e não for busca por nome de escola, filtrar cadastros individuais
      if (searchTerm && !searchTerm.match(/[a-zA-Z]/)) {
        // É um número de cadastro - permitir correspondência parcial e ignorar caracteres não numéricos
        console.log("Filtering by cadastro number:", searchTerm);
        console.log("Schools before filter:", result.length);
        
        result = result.map(school => {
          console.log(`Processing school ${school.schoolName}, cadastrosDetails:`, school.cadastrosDetails.length);
          
          const term = searchTerm.trim();
          const termDigits = term.replace(/\D/g, '');
          
          const filteredDetails = school.cadastrosDetails.filter((detail: any) => {
            const cadRaw = detail.cadastro?.toString().trim() || '';
            const cadDigits = cadRaw.replace(/\D/g, '');
            const matches = (cadRaw === term) || (termDigits && cadDigits.includes(termDigits));
            if (matches) {
              console.log(`  Found match: cadastro ${detail.cadastro}, mes: ${detail.mesRef || detail.mesAno}, venc: ${detail.mesVenc}, valor: ${detail.valor}`);
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

      // Recompute totals from cadastrosDetails to ensure correct aggregation across multiple cadastros
      result = result.map((school: any) => {
        const details = school.cadastrosDetails || [];
        const totalValue = details.reduce((sum: number, d: any) => sum + (parseFloat(d.valor) || 0), 0);
        const totalConsumption = details.reduce((sum: number, d: any) => sum + (parseFloat(d.consumo) || 0), 0);
        const cadastrosSet = new Set(details.map((d: any) => d.cadastro));
        return { ...school, totalValue, totalConsumption, cadastrosSet };
      });

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

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const reportTitle = reportTypes.find(t => t.value === reportType)?.label || 'Relatório';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const generatedAt = new Date().toLocaleString('pt-BR');

      // Load logo as data URL
      const getLogoDataUrl = async (): Promise<string | null> => {
        try {
          const res = await fetch(logoSJRP);
          const blob = await res.blob();
          return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      };
      const logoDataUrl = await getLogoDataUrl();

      const headerHeight = 28;
      const footerHeight = 22;

      const drawHeaderFooter = () => {
        // Header
        if (logoDataUrl) {
          try {
            doc.addImage(logoDataUrl, 'PNG', 12, 10, 26, 16);
          } catch {}
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Gestão de Custos – Secretaria Municipal de Educação', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Relatório de Água – ${reportTitle}`, pageWidth / 2, 26, { align: 'center' });
        doc.text(`Período: ${selectedMonth === 'todos' ? 'Anual' : selectedMonth} / ${selectedYear}` , pageWidth - 12, 18, { align: 'right' });

        // Footer
        const footerY = pageHeight - 10;
        doc.setFontSize(9);
        doc.text(`Gerado por: ${userEmail || 'usuário desconhecido'} • ${generatedAt}`, 12, footerY);
        doc.text('Rua General Glicério, 3947 – Vila Imperial – CEP 15015-400 – São José do Rio Preto-SP – Telefone (17) 32114000', pageWidth - 12, footerY, { align: 'right' });
      };

      // Use autoTable hooks to render header/footer on each page
      const tableCommon = {
        startY: headerHeight + 10,
        margin: { top: headerHeight + 6, bottom: footerHeight + 6, left: 12, right: 12 },
        theme: 'grid' as const,
        headStyles: { fillColor: [41, 128, 185] as [number, number, number] },
        footStyles: { fillColor: [52, 152, 219] as [number, number, number], fontStyle: 'bold' as const },
        didDrawPage: () => {
          drawHeaderFooter();
        },
      };

      if (reportType === 'monthly-comparison') {
        // Agrupar dados por escola e mês (apenas meses selecionados)
        const comparisonData = selectedSchools.map(schoolName => {
          const row: any[] = [schoolName];
          selectedMonths.forEach(month => {
            const records = data.filter(
              r => r.nome_escola === schoolName && r.mes_ano_referencia === month
            );
            const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
            const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);
            row.push(`${totalConsumption.toFixed(1)} m³\n${formatCurrency(totalValue)}`);
          });
          return row;
        });

        const headRow = ['Escola', ...selectedMonths];

        autoTable(doc, {
          ...tableCommon,
          head: [headRow],
          body: comparisonData,
        });
      } else if (reportType === 'student-comparison') {
        // Relatório comparativo por total de alunos
        // Use filtered reportData instead of raw data to respect month selection
        const filteredData = selectedMonth !== 'todos' 
          ? data.filter(r => {
              const selectedIdx = monthIndexFromName(selectedMonth) ?? null;
              if (selectedIdx === null) return true;
              const nextOfSelected = (selectedIdx + 1) % 12;
              const refParsed = parseMesAnoReferencia(r.mes_ano_referencia || '');
              const refIdx = refParsed ? refParsed.monthIndex : null;
              const sd = parseBRDate(r.data_vencimento);
              const dueIdx = sd ? sd.getMonth() : null;
              let arrayDueIdxs: number[] = [];
              try {
                const arr = Array.isArray(r.datas_vencimento)
                  ? r.datas_vencimento
                  : (r.datas_vencimento ? JSON.parse(r.datas_vencimento as string) : []);
                arrayDueIdxs = (arr || [])
                  .map((d: string) => parseBRDate(d))
                  .filter((d: Date | null): d is Date => !!d)
                  .map((d: Date) => d.getMonth());
              } catch {}
              return (
                refIdx === selectedIdx ||
                dueIdx === selectedIdx ||
                arrayDueIdxs.includes(selectedIdx) ||
                dueIdx === nextOfSelected ||
                arrayDueIdxs.includes(nextOfSelected)
              );
            })
          : data;
        
        const comparisonData = selectedSchools.map(schoolName => {
          const schoolInfo = schoolsData.find(s => s.nome_escola === schoolName);
          const schoolRecords = filteredData.filter(r => r.nome_escola === schoolName);
          
          // Aggregate from all cadastros
          let totalConsumption = 0;
          let totalValue = 0;
          schoolRecords.forEach(record => {
            try {
              const consumosArray = Array.isArray(record.consumos_m3) ? record.consumos_m3 : (record.consumos_m3 ? JSON.parse(record.consumos_m3 as string) : []);
              const valoresArray = Array.isArray(record.valores_cadastros) ? record.valores_cadastros : (record.valores_cadastros ? JSON.parse(record.valores_cadastros as string) : []);
              
              consumosArray.forEach((c: any) => { totalConsumption += parseFloat(c) || 0; });
              valoresArray.forEach((v: any) => { totalValue += parseFloat(v) || 0; });
            } catch {
              totalConsumption += parseFloat(record.consumo_m3) || 0;
              totalValue += parseFloat(record.valor_gasto) || 0;
            }
          });
          
          const totalStudents = schoolInfo?.total_alunos || 0;

          return [
            schoolName,
            schoolInfo?.alunos_creche || 0,
            schoolInfo?.alunos_infantil || 0,
            schoolInfo?.alunos_fundamental_i || 0,
            schoolInfo?.alunos_fundamental_ii || 0,
            totalStudents,
            `${totalConsumption.toFixed(1)} m³`,
            formatCurrency(totalValue),
            totalStudents ? (totalConsumption / totalStudents).toFixed(2) : '0.00',
            totalStudents ? formatCurrency(totalValue / totalStudents) : formatCurrency(0),
          ];
        });

        autoTable(doc, {
          ...tableCommon,
          head: [['Escola', 'Creche', 'Infantil', 'Fund. I', 'Fund. II', 'Total Alunos', 'Consumo Total', 'Valor Total', 'm³/Aluno', 'R$/Aluno']],
          body: comparisonData,
          columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            8: { halign: 'center' },
            9: { halign: 'center' }
          }
        });
      } else if (reportType === 'macroregion-comparison') {
        // Relatório comparativo por macroregião
        const comparisonData = selectedMacroregions.map(macroregion => {
          const records = data.filter(r => r.macroregiao === macroregion);
          const schools = new Set(records.map(r => r.nome_escola));
          const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
          const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

          return [
            macroregion,
            schools.size,
            `${totalConsumption.toFixed(1)} m³`,
            formatCurrency(totalValue),
            schools.size > 0 ? `${(totalConsumption / schools.size).toFixed(1)} m³` : '0.0 m³',
            schools.size > 0 ? formatCurrency(totalValue / schools.size) : formatCurrency(0),
          ];
        });

        const totals = selectedMacroregions.reduce((acc, macroregion) => {
          const records = data.filter(r => r.macroregiao === macroregion);
          const schools = new Set(records.map(r => r.nome_escola));
          return {
            schoolCount: acc.schoolCount + schools.size,
            totalConsumption: acc.totalConsumption + records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0),
            totalValue: acc.totalValue + records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0),
          };
        }, { schoolCount: 0, totalConsumption: 0, totalValue: 0 });

        autoTable(doc, {
          ...tableCommon,
          head: [['Macrorregião', 'Nº Escolas', 'Consumo Total', 'Valor Total', 'Média Consumo/Escola', 'Média Valor/Escola']],
          body: comparisonData,
          foot: [['TOTAL', totals.schoolCount.toString(), `${totals.totalConsumption.toFixed(1)} m³`, formatCurrency(totals.totalValue), '', '']],
          columnStyles: {
            1: { halign: 'center' }
          }
        });
      } else if (reportType === 'school-type-comparison') {
        // Relatório comparativo por tipo de escola
        const comparisonData = selectedSchoolTypes.map(type => {
          const records = data.filter(r => r.tipo_escola === type);
          const schools = new Set(records.map(r => r.nome_escola));
          const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
          const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

          return [
            type,
            schools.size,
            `${totalConsumption.toFixed(1)} m³`,
            formatCurrency(totalValue),
            schools.size > 0 ? `${(totalConsumption / schools.size).toFixed(1)} m³` : '0.0 m³',
            schools.size > 0 ? formatCurrency(totalValue / schools.size) : formatCurrency(0),
          ];
        });

        const totals = selectedSchoolTypes.reduce((acc, type) => {
          const records = data.filter(r => r.tipo_escola === type);
          const schools = new Set(records.map(r => r.nome_escola));
          return {
            schoolCount: acc.schoolCount + schools.size,
            totalConsumption: acc.totalConsumption + records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0),
            totalValue: acc.totalValue + records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0),
          };
        }, { schoolCount: 0, totalConsumption: 0, totalValue: 0 });

        autoTable(doc, {
          ...tableCommon,
          head: [['Tipo de Escola', 'Nº Escolas', 'Consumo Total', 'Valor Total', 'Média Consumo/Escola', 'Média Valor/Escola']],
          body: comparisonData,
          foot: [['TOTAL', totals.schoolCount.toString(), `${totals.totalConsumption.toFixed(1)} m³`, formatCurrency(totals.totalValue), '', '']],
          columnStyles: {
            1: { halign: 'center' }
          }
        });
      } else if (reportType === 'consolidated' || reportType === 'by-school' || reportType === 'value-range' || reportType === 'comparative') {
        const tableData = (reportData as any[]).map((school) => [
          school.schoolName,
          school.cadastrosSet?.size || 0,
          `${school.totalConsumption?.toFixed(1) || '0.0'} m³`,
          `R$ ${school.totalValue?.toFixed(2) || '0.00'}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, s) => sum + (s.totalConsumption || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, s) => sum + (s.totalValue || 0), 0);

        autoTable(doc, {
          ...tableCommon,
          head: [['Escola', 'Total Cadastros', 'Consumo Total', 'Valor Total']],
          body: tableData,
          foot: [['TOTAL GERAL', '', `${totalConsumption.toFixed(1)} m³`, `R$ ${totalValue.toFixed(2)}`]],
          columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' }
          }
        });
      } else {
        const tableData = (reportData as any[]).map((record) => [
          record.cadastro,
          record.nome_escola,
          record.mes_ano_referencia,
          `${parseFloat(record.consumo_m3 || 0).toFixed(1)} m³`,
          `R$ ${parseFloat(record.valor_gasto || 0).toFixed(2)}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.consumo_m3 || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.valor_gasto || 0), 0);

        autoTable(doc, {
          ...tableCommon,
          head: [['Cadastro', 'Escola', 'Mês/Ano', 'Consumo', 'Valor']],
          body: tableData,
          foot: [['TOTAL GERAL', '', '', `${totalConsumption.toFixed(1)} m³`, `R$ ${totalValue.toFixed(2)}`]],
        });
      }

      doc.save(`relatorio_agua_${reportType}_${selectedYear}_${selectedMonth}.pdf`);
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
        doc.text(`Relatório de Água – ${reportTitle}`, pageWidth / 2, 26, { align: 'center' });
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

      if (reportType === 'monthly-comparison') {
        // Agrupar dados por escola e mês (apenas meses selecionados)
        const comparisonData = selectedSchools.map(schoolName => {
          const row: any[] = [schoolName];
          selectedMonths.forEach(month => {
            const records = data.filter(
              r => r.nome_escola === schoolName && r.mes_ano_referencia === month
            );
            const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
            const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);
            row.push(`${totalConsumption.toFixed(1)} m³\n${formatCurrency(totalValue)}`);
          });
          return row;
        });

        const headRow = ['Escola', ...selectedMonths];

        autoTable(doc, {
          ...tableCommon,
          head: [headRow],
          body: comparisonData,
        });
      } else if (reportType === 'student-comparison') {
        // Relatório comparativo por total de alunos
        // Use filtered data to respect month selection
        const filteredData = selectedMonth !== 'todos' 
          ? data.filter(r => {
              const selectedIdx = monthIndexFromName(selectedMonth) ?? null;
              if (selectedIdx === null) return true;
              const nextOfSelected = (selectedIdx + 1) % 12;
              const refParsed = parseMesAnoReferencia(r.mes_ano_referencia || '');
              const refIdx = refParsed ? refParsed.monthIndex : null;
              const sd = parseBRDate(r.data_vencimento);
              const dueIdx = sd ? sd.getMonth() : null;
              let arrayDueIdxs: number[] = [];
              try {
                const arr = Array.isArray(r.datas_vencimento)
                  ? r.datas_vencimento
                  : (r.datas_vencimento ? JSON.parse(r.datas_vencimento as string) : []);
                arrayDueIdxs = (arr || [])
                  .map((d: string) => parseBRDate(d))
                  .filter((d: Date | null): d is Date => !!d)
                  .map((d: Date) => d.getMonth());
              } catch {}
              return (
                refIdx === selectedIdx ||
                dueIdx === selectedIdx ||
                arrayDueIdxs.includes(selectedIdx) ||
                dueIdx === nextOfSelected ||
                arrayDueIdxs.includes(nextOfSelected)
              );
            })
          : data;
        
        const comparisonData = selectedSchools.map(schoolName => {
          const schoolInfo = schoolsData.find(s => s.nome_escola === schoolName);
          const schoolRecords = filteredData.filter(r => r.nome_escola === schoolName);
          
          // Aggregate from all cadastros
          let totalConsumption = 0;
          let totalValue = 0;
          schoolRecords.forEach(record => {
            try {
              const consumosArray = Array.isArray(record.consumos_m3) ? record.consumos_m3 : (record.consumos_m3 ? JSON.parse(record.consumos_m3 as string) : []);
              const valoresArray = Array.isArray(record.valores_cadastros) ? record.valores_cadastros : (record.valores_cadastros ? JSON.parse(record.valores_cadastros as string) : []);
              
              consumosArray.forEach((c: any) => { totalConsumption += parseFloat(c) || 0; });
              valoresArray.forEach((v: any) => { totalValue += parseFloat(v) || 0; });
            } catch {
              totalConsumption += parseFloat(record.consumo_m3) || 0;
              totalValue += parseFloat(record.valor_gasto) || 0;
            }
          });
          
          const totalStudents = schoolInfo?.total_alunos || 0;

          return [
            schoolName,
            schoolInfo?.alunos_creche || 0,
            schoolInfo?.alunos_infantil || 0,
            schoolInfo?.alunos_fundamental_i || 0,
            schoolInfo?.alunos_fundamental_ii || 0,
            totalStudents,
            `${totalConsumption.toFixed(1)} m³`,
            formatCurrency(totalValue),
            totalStudents ? (totalConsumption / totalStudents).toFixed(2) : '0.00',
            totalStudents ? formatCurrency(totalValue / totalStudents) : formatCurrency(0),
          ];
        });

        autoTable(doc, {
          ...tableCommon,
          head: [['Escola', 'Creche', 'Infantil', 'Fund. I', 'Fund. II', 'Total Alunos', 'Consumo Total', 'Valor Total', 'm³/Aluno', 'R$/Aluno']],
          body: comparisonData,
          columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' },
            8: { halign: 'center' },
            9: { halign: 'center' }
          }
        });
      } else if (reportType === 'macroregion-comparison') {
        // Relatório comparativo por macroregião
        const comparisonData = selectedMacroregions.map(macroregion => {
          const records = data.filter(r => r.macroregiao === macroregion);
          const schools = new Set(records.map(r => r.nome_escola));
          const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
          const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

          return [
            macroregion,
            schools.size,
            `${totalConsumption.toFixed(1)} m³`,
            formatCurrency(totalValue),
            schools.size > 0 ? `${(totalConsumption / schools.size).toFixed(1)} m³` : '0.0 m³',
            schools.size > 0 ? formatCurrency(totalValue / schools.size) : formatCurrency(0),
          ];
        });

        const totals = selectedMacroregions.reduce((acc, macroregion) => {
          const records = data.filter(r => r.macroregiao === macroregion);
          const schools = new Set(records.map(r => r.nome_escola));
          return {
            schoolCount: acc.schoolCount + schools.size,
            totalConsumption: acc.totalConsumption + records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0),
            totalValue: acc.totalValue + records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0),
          };
        }, { schoolCount: 0, totalConsumption: 0, totalValue: 0 });

        autoTable(doc, {
          ...tableCommon,
          head: [['Macrorregião', 'Nº Escolas', 'Consumo Total', 'Valor Total', 'Média Consumo/Escola', 'Média Valor/Escola']],
          body: comparisonData,
          foot: [['TOTAL', totals.schoolCount.toString(), `${totals.totalConsumption.toFixed(1)} m³`, formatCurrency(totals.totalValue), '', '']],
          columnStyles: {
            1: { halign: 'center' }
          }
        });
      } else if (reportType === 'school-type-comparison') {
        // Relatório comparativo por tipo de escola
        const comparisonData = selectedSchoolTypes.map(type => {
          const records = data.filter(r => r.tipo_escola === type);
          const schools = new Set(records.map(r => r.nome_escola));
          const totalConsumption = records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0);
          const totalValue = records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0);

          return [
            type,
            schools.size,
            `${totalConsumption.toFixed(1)} m³`,
            formatCurrency(totalValue),
            schools.size > 0 ? `${(totalConsumption / schools.size).toFixed(1)} m³` : '0.0 m³',
            schools.size > 0 ? formatCurrency(totalValue / schools.size) : formatCurrency(0),
          ];
        });

        const totals = selectedSchoolTypes.reduce((acc, type) => {
          const records = data.filter(r => r.tipo_escola === type);
          const schools = new Set(records.map(r => r.nome_escola));
          return {
            schoolCount: acc.schoolCount + schools.size,
            totalConsumption: acc.totalConsumption + records.reduce((sum, r) => sum + (parseFloat(r.consumo_m3) || 0), 0),
            totalValue: acc.totalValue + records.reduce((sum, r) => sum + (parseFloat(r.valor_gasto) || 0), 0),
          };
        }, { schoolCount: 0, totalConsumption: 0, totalValue: 0 });

        autoTable(doc, {
          ...tableCommon,
          head: [['Tipo de Escola', 'Nº Escolas', 'Consumo Total', 'Valor Total', 'Média Consumo/Escola', 'Média Valor/Escola']],
          body: comparisonData,
          foot: [['TOTAL', totals.schoolCount.toString(), `${totals.totalConsumption.toFixed(1)} m³`, formatCurrency(totals.totalValue), '', '']],
          columnStyles: {
            1: { halign: 'center' }
          }
        });
      } else if (reportType === 'consolidated' || reportType === 'by-school' || reportType === 'value-range' || reportType === 'comparative') {
        const tableData = (reportData as any[]).map((school) => [
          school.schoolName, 
          school.cadastrosSet?.size || 0, 
          `${school.totalConsumption?.toFixed(1) || '0.0'} m³`, 
          `R$ ${school.totalValue?.toFixed(2) || '0.00'}`, 
        ]); 
        const totalConsumption = (reportData as any[]).reduce((sum, s) => sum + (s.totalConsumption || 0), 0); 
        const totalValue = (reportData as any[]).reduce((sum, s) => sum + (s.totalValue || 0), 0); 

        autoTable(doc, { 
          ...tableCommon, 
          head: [['Escola', 'Total Cadastros', 'Consumo Total', 'Valor Total']], 
          body: tableData, 
          foot: [['TOTAL GERAL', '', `${totalConsumption.toFixed(1)} m³`, `R$ ${totalValue.toFixed(2)}`]],
          columnStyles: { 
            1: { halign: 'center' }, 
            2: { halign: 'center' }, 
            3: { halign: 'center' } 
          } 
        }); 
      } else { 
        const tableData = (reportData as any[]).map((record) => [
          record.cadastro,
          record.nome_escola,
          record.mes_ano_referencia,
          `${parseFloat(record.consumo_m3 || 0).toFixed(1)} m³`,
          `R$ ${parseFloat(record.valor_gasto || 0).toFixed(2)}`,
        ]);
        const totalConsumption = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.consumo_m3 || 0), 0);
        const totalValue = (reportData as any[]).reduce((sum, r) => sum + parseFloat(r.valor_gasto || 0), 0);
        autoTable(doc, { ...tableCommon, head: [['Cadastro', 'Escola', 'Mês/Ano', 'Consumo', 'Valor']], body: tableData, foot: [['TOTAL GERAL', '', '', `${totalConsumption.toFixed(1)} m³`, `R$ ${totalValue.toFixed(2)}`]] });
      }

      // Generate blob and open in new window
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(blobUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          URL.revokeObjectURL(blobUrl);
        };
        toast({ title: 'Visualização gerada', description: 'O PDF foi aberto para visualização. Use Ctrl+P para imprimir.' });
      } else {
        toast({ title: 'Erro', description: 'Não foi possível abrir a janela de visualização. Verifique se o bloqueador de pop-ups está ativo.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erro ao gerar visualização de impressão:', error);
      toast({ title: 'Erro ao imprimir', description: 'Não foi possível gerar a visualização do PDF', variant: 'destructive' });
    }
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
                                      <span className="text-sm font-medium">{group.totalConsumo.toFixed(1)} m³</span>
                                      <span className="text-sm font-bold text-primary">{formatCurrency(group.totalValor)}</span>
                                    </div>
                                  </div>
                                </div>
                                {group.details.length >= 1 && (
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="w-[140px]">Mês Ref.</TableHead>
                                        <TableHead className="w-[140px]">Vencimento</TableHead>
                                        <TableHead className="text-right w-[120px]">Consumo (m³)</TableHead>
                                        <TableHead className="text-right w-[120px]">Valor (R$)</TableHead>
                                        <TableHead className="text-right w-[100px]">Ações</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {(group.details || []).slice().sort((a: any, b: any) => {
                                        const ap = parseMesAnoReferencia(a.mesRef || a.mesAno || '');
                                        const bp = parseMesAnoReferencia(b.mesRef || b.mesAno || '');
                                        const ay = ap ? ap.year : 0;
                                        const by = bp ? bp.year : 0;
                                        const am = ap ? ap.monthIndex : 0;
                                        const bm = bp ? bp.monthIndex : 0;
                                        return ay - by || am - bm;
                                      }).map((detail: any, detailIndex: number) => (
                                        <TableRow 
                                          key={detailIndex}
                                          className={detailIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                                        >
                                          <TableCell className="font-medium text-sm">
                                            {detail.mesRef || detail.mesAno || '—'}
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                            {detail.mesVenc || '—'}
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
                                                onClick={() => handleDeleteClick(detail.record)}
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
                                  {school.totalConsumption?.toFixed(1) || '0.0'} m³
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

      {/* Advanced Filters - Conditional based on report type */}
      {reportType === 'selected-fields' && (
        <FieldSelector
          selectedFields={selectedFields}
          onChange={setSelectedFields}
        />
      )}

      {reportType === 'monthly-comparison' && (
        <div className="space-y-4">
          <SchoolMultiSelector
            schools={schools}
            selectedSchools={selectedSchools}
            onChange={setSelectedSchools}
            maxSchools={15}
          />
          <MonthSelector
            selectedMonths={selectedMonths}
            onChange={setSelectedMonths}
          />
        </div>
      )}

      {reportType === 'student-comparison' && (
        <SchoolMultiSelector
          schools={schools}
          selectedSchools={selectedSchools}
          onChange={setSelectedSchools}
          maxSchools={15}
        />
      )}

      {reportType === 'macroregion-comparison' && (
        <MacroregionSelector
          selectedMacroregions={selectedMacroregions}
          onChange={setSelectedMacroregions}
        />
      )}

      {reportType === 'school-type-comparison' && (
        <SchoolTypeSelector
          selectedSchoolTypes={selectedSchoolTypes}
          onChange={setSelectedSchoolTypes}
        />
      )}

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
          {reportType === 'selected-fields' ? (
            <SelectedFieldsReport data={reportData} selectedFields={selectedFields} />
          ) : reportType === 'monthly-comparison' ? (
            <MonthlyComparisonReport 
              data={data} 
              selectedSchools={selectedSchools} 
              selectedMonths={selectedMonths} 
            />
          ) : reportType === 'student-comparison' ? (
            <StudentComparisonReport 
              data={data} 
              schoolsData={schoolsData} 
              selectedSchools={selectedSchools} 
            />
          ) : reportType === 'macroregion-comparison' ? (
            <MacroregionComparisonReport 
              data={data} 
              selectedMacroregions={selectedMacroregions} 
            />
          ) : reportType === 'school-type-comparison' ? (
            <SchoolTypeComparisonReport 
              data={data} 
              selectedSchoolTypes={selectedSchoolTypes} 
            />
          ) : (reportType === 'consolidated' || reportType === 'by-school' || 
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
