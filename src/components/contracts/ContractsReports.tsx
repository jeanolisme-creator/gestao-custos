import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileDown, Filter, Calendar as CalendarIcon, FileText, Pencil, Trash2, AlertCircle, TrendingUp, FileBarChart, DollarSign } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { parseCurrency } from "@/utils/currencyMask";

interface Contract {
  id: string;
  number: string;
  company: string;
  cnpj: string;
  empenho: string;
  object: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  annualValue: number;
  status: 'Ativo' | 'Vencido' | 'Próximo ao Vencimento';
  addendums?: any[];
  addendumType?: string;
  totalValueWithAddendums: number;
  lastRenewalDate?: string;
}

interface ContractsReportsProps {
  onEditContract?: (contractData: any) => void;
}

export function ContractsReports({ onEditContract }: ContractsReportsProps) {
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  type AddendumLike = any;

  const getLatestAddendumEndDate = (addendums?: AddendumLike[]): Date | undefined => {
    if (!addendums || addendums.length === 0) return undefined;
    const dates: Date[] = [];
    for (const a of addendums) {
      if (a && typeof a === 'object') {
        const candidates = [
          (a as any).endDate,
          (a as any).end_date,
          (a as any).renewalDate,
          (a as any).renewal_date,
          (a as any).finalDate,
          (a as any).final_date,
        ].filter(Boolean) as (string | Date)[];
        for (const c of candidates) {
          const d = c instanceof Date ? c : new Date(c);
          if (!isNaN(d.getTime())) dates.push(d);
        }
      }
    }
    if (dates.length === 0) return undefined;
    return new Date(Math.max(...dates.map((d) => d.getTime())));
  };

  const calculateStatus = (
    endDateStr: string,
    addendums?: AddendumLike[],
  ): 'Ativo' | 'Vencido' | 'Próximo ao Vencimento' => {
    const base = new Date(endDateStr);
    const latest = getLatestAddendumEndDate(addendums);
    const effective = latest && latest > base ? latest : base;
    const daysUntilEnd = differenceInDays(effective, new Date());

    if (daysUntilEnd < 0) return 'Vencido';
    if (daysUntilEnd <= 90) return 'Próximo ao Vencimento';
    return 'Ativo';
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContracts: Contract[] = (data || []).map(contract => {
        const addendums = Array.isArray(contract.addendums) ? contract.addendums : [];
        let addendumType = '';
        let totalValueWithAddendums = Number(contract.annual_value);
        let lastRenewalDate: string | undefined;
        
        if (addendums.length > 0) {
          const addendumCount = addendums.length;
          if (addendumCount === 1) addendumType = '1º Aditivo de renovação';
          else if (addendumCount === 2) addendumType = '2º Aditivo de renovação';
          else if (addendumCount === 3) addendumType = '3º Aditivo de renovação';
          else if (addendumCount === 4) addendumType = '4º Aditivo de renovação';
          else if (addendumCount === 5) addendumType = '5º Aditivo de renovação';
          else if (addendumCount === 6) addendumType = '6º Aditivo de renovação';
          else if (addendumCount === 7) addendumType = '7º Aditivo de renovação';
          else if (addendumCount === 8) addendumType = '8º Aditivo de renovação';
          else if (addendumCount === 9) addendumType = '9º Aditivo de renovação';
          else if (addendumCount === 10) addendumType = '10º Aditivo de renovação';
          else if (addendumCount > 10) addendumType = `${addendumCount}º Aditivo de renovação`;
          
          // Calcular valor total com aditivos
          addendums.forEach((addendum: any) => {
            if (addendum && typeof addendum === 'object') {
              if ('finalValue' in addendum && addendum.finalValue) {
                totalValueWithAddendums += parseCurrency(String(addendum.finalValue));
              } else if ('monthlyValue' in addendum && addendum.monthlyValue) {
                totalValueWithAddendums += parseCurrency(String(addendum.monthlyValue)) * 12;
              } else if ('annualValue' in addendum && addendum.annualValue) {
                totalValueWithAddendums += Number(addendum.annualValue);
              }
            }
          });
          
          // Pegar a data da última renovação (preferir data final do aditivo)
          const lastAddendum = addendums[addendums.length - 1] as any;
          if (lastAddendum && typeof lastAddendum === 'object') {
            const possibleDates = [
              lastAddendum.endDate,
              lastAddendum.end_date,
              lastAddendum.renewalDate,
              lastAddendum.renewal_date,
            ].filter(Boolean) as string[];
            if (possibleDates.length > 0) {
              lastRenewalDate = possibleDates[0];
            }
          }
        }
        
        return {
          id: contract.id,
          number: contract.contract_number,
          company: contract.company_name,
          cnpj: contract.cnpj,
          empenho: contract.commitment_number,
          object: contract.contract_object,
          startDate: contract.start_date,
          endDate: contract.end_date,
          monthlyValue: Number(contract.monthly_value),
          annualValue: Number(contract.annual_value),
          status: calculateStatus(contract.end_date, addendums),
          addendums,
          addendumType,
          totalValueWithAddendums,
          lastRenewalDate,
        };
      });

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error("Erro ao carregar contratos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  };

  // Filtrar contratos
  const filteredContracts = contracts.filter(contract => {
    if (filterCompany !== "all" && !contract.company.toLowerCase().includes(filterCompany.toLowerCase())) return false;
    if (filterStatus !== "all" && contract.status !== filterStatus) return false;
    if (searchTerm && !contract.number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !contract.company.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    if (startDate) {
      const contractStart = new Date(contract.startDate);
      if (contractStart < startDate) return false;
    }
    
    if (endDate) {
      const contractEnd = new Date(contract.endDate);
      if (contractEnd > endDate) return false;
    }
    
    return true;
  });

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ["Número", "Empresa", "CNPJ", "Empenho", "Objeto", "Data Inicial", "Data Final", "Valor Mensal", "Valor Anual", "Status", "Aditivos"];
    const csvData = filteredContracts.map(contract => [
      contract.number,
      contract.company,
      contract.cnpj,
      contract.empenho,
      contract.object,
      formatDate(contract.startDate),
      formatDate(contract.endDate),
      contract.monthlyValue,
      contract.annualValue,
      contract.status,
      contract.addendumType || 'Sem aditivos'
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_contratos_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório exportado com sucesso!");
  };

  // Exportar para PDF
  const exportToPDF = async () => {
    try {
      const jspdfMod: any = await import('jspdf');
      const jsPDFCtor = jspdfMod.jsPDF || jspdfMod.default; // compat: named or default export
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDFCtor();

      // Título
      doc.setFontSize(16);
      doc.text('Relatório de Contratos', 14, 15);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 14, 22);

      // Preparar dados para a tabela
      const tableData = filteredContracts.map(contract => [
        contract.number,
        contract.company,
        contract.cnpj,
        formatDate(contract.startDate),
        formatDate(contract.endDate),
        formatCurrency(contract.monthlyValue),
        formatCurrency(contract.annualValue),
        contract.status,
        contract.addendumType || 'Sem aditivos'
      ]);

      // Adicionar tabela usando plugin (evita depender do prototype)
      autoTable(doc, {
        startY: 30,
        head: [['Número', 'Empresa', 'CNPJ', 'Início', 'Fim', 'Valor Mensal', 'Valor Anual', 'Status', 'Aditivos']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 92, 246] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 },
          8: { cellWidth: 30 }
        }
      });

      // Salvar PDF
      doc.save(`relatorio_contratos_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const clearFilters = () => {
    setFilterCompany("all");
    setFilterStatus("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm("");
    toast.success("Filtros limpos!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "text-green-600 bg-green-50 border-green-200";
      case "Vencido":
        return "text-red-600 bg-red-50 border-red-200";
      case "Próximo ao Vencimento":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleEdit = async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;

      if (onEditContract && data) {
        onEditContract(data);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error("Erro ao carregar dados do contrato");
    }
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (contractToDelete) {
      try {
        const { error } = await supabase
          .from('contracts')
          .delete()
          .eq('id', contractToDelete);

        if (error) throw error;

        toast.success("Contrato excluído com sucesso!");
        fetchContracts(); // Refresh list
      } catch (error) {
        console.error('Error deleting contract:', error);
        toast.error("Erro ao excluir contrato");
      }
      setContractToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Relatórios de Contratos</h2>
        <p className="text-muted-foreground">Filtre e exporte relatórios personalizados dos contratos</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-violet-500" />
            Filtros
          </CardTitle>
          <CardDescription>Configure os filtros para personalizar o relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Número ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Adrimak">Adrimak</SelectItem>
                  <SelectItem value="Empro">Empro</SelectItem>
                  <SelectItem value="Licenças">Licenças</SelectItem>
                  <SelectItem value="Sinal BR">Sinal BR</SelectItem>
                  <SelectItem value="TIM">TIM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Próximo ao Vencimento">Próximo ao Vencimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período de Vigência</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                    placeholder="Data inicial"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                    placeholder="Data final"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={exportToCSV} className="ml-auto">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de contratos encontrados */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700 flex items-center justify-center gap-2">
              <FileBarChart className="h-6 w-6" />
              Contratos Encontrados
            </CardTitle>
            <div className="mt-4 space-y-2">
              <p className="text-5xl font-bold text-blue-800">
                {filteredContracts.length}
              </p>
              <CardDescription className="text-lg font-semibold text-blue-600">
                Valor Total: {formatCurrency(filteredContracts.reduce((sum, c) => sum + c.totalValueWithAddendums, 0))}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Card de valor mensal com aditivos */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700 flex items-center justify-center gap-2">
              <DollarSign className="h-6 w-6" />
              Valor Mensal (com Aditivos)
            </CardTitle>
            <div className="mt-4 space-y-2">
              <p className="text-4xl font-bold text-green-800">
                {formatCurrency(filteredContracts.reduce((sum, c) => sum + c.totalValueWithAddendums / 12, 0))}
              </p>
              <CardDescription className="text-sm font-semibold text-green-600">
                {filteredContracts.filter(c => c.addendums && c.addendums.length > 0).length} contratos com aditivos
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Card de valor anual com aditivos */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Valor Anual (com Aditivos)
            </CardTitle>
            <div className="mt-4 space-y-2">
              <p className="text-4xl font-bold text-purple-800">
                {formatCurrency(filteredContracts.reduce((sum, c) => sum + c.totalValueWithAddendums, 0))}
              </p>
              <CardDescription className="text-sm font-semibold text-purple-600">
                Total incluindo todos os aditivos
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Card de alerta de próximos vencimentos - Largura completa */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-orange-700 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Próximos Vencimentos
          </CardTitle>
          <CardContent className="p-0 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {filteredContracts
                .sort((a, b) => {
                  const dateA = new Date(a.lastRenewalDate ?? a.endDate);
                  const dateB = new Date(b.lastRenewalDate ?? b.endDate);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(contract => {
                  const endDate = new Date(contract.lastRenewalDate ?? contract.endDate);
                  const daysUntil = differenceInDays(endDate, new Date());
                  const badgeText = daysUntil >= 0 ? `${daysUntil} dias` : `vencido há ${Math.abs(daysUntil)} dias`;
                  return (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-orange-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-orange-900 truncate">{contract.company}</p>
                        <p className="text-xs text-orange-600">{formatDate(endDate.toISOString())}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-700 border-orange-300 whitespace-nowrap">
                        {badgeText}
                      </Badge>
                    </div>
                  );
                })}
              {filteredContracts.length === 0 && (
                <p className="text-sm text-orange-600 text-center py-4 col-span-full">
                  Nenhum contrato encontrado
                </p>
              )}
            </div>
          </CardContent>
        </CardHeader>
      </Card>

      {/* Tabela de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead className="text-right">Valor Mensal</TableHead>
                  <TableHead className="text-right">Valor Anual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aditivos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.number}</TableCell>
                      <TableCell>{contract.company}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.cnpj}</TableCell>
                      <TableCell className="max-w-xs whitespace-normal break-words">{contract.object}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(contract.monthlyValue)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(contract.annualValue)}
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded-md text-xs font-medium border", getStatusColor(contract.status))}>
                          {contract.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {contract.addendumType ? (
                          <span className="text-sm font-medium text-blue-600">
                            {contract.addendumType}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(contract.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(contract.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContractToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
