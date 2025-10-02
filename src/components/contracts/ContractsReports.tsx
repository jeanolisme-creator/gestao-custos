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
import { FileDown, Filter, Calendar as CalendarIcon, FileText, Pencil, Trash2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

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
}

export function ContractsReports() {
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateStatus = (endDateStr: string): 'Ativo' | 'Vencido' | 'Próximo ao Vencimento' => {
    const end = new Date(endDateStr);
    const today = new Date();
    const daysUntilEnd = differenceInDays(end, today);
    
    if (daysUntilEnd < 0) return 'Vencido';
    if (daysUntilEnd <= 30) return 'Próximo ao Vencimento';
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

      const formattedContracts: Contract[] = (data || []).map(contract => ({
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
        status: calculateStatus(contract.end_date),
      }));

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
    if (filterCompany !== "all" && contract.company !== filterCompany) return false;
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
    const headers = ["Número", "Empresa", "CNPJ", "Empenho", "Objeto", "Data Inicial", "Data Final", "Valor Mensal", "Valor Anual", "Status"];
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
      contract.status
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

  // Exportar para PDF (simulado)
  const exportToPDF = () => {
    toast.success("Funcionalidade de exportação para PDF será implementada em breve!");
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

  const handleEdit = (contractId: string) => {
    // Implementar edição
    toast.success(`Editando contrato ${contractId}`);
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yy") : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yy") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
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

      {/* Card de resumo dos contratos encontrados */}
      <div className="flex justify-center">
        <Card className="border-blue-200 bg-blue-50 w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-700">
              Contratos Encontrados
            </CardTitle>
            <div className="mt-4 space-y-2">
              <p className="text-5xl font-bold text-blue-800">
                {filteredContracts.length}
              </p>
              <CardDescription className="text-lg font-semibold text-blue-600">
                Valor Total: {formatCurrency(filteredContracts.reduce((sum, c) => sum + c.annualValue, 0))}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>

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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.number}</TableCell>
                      <TableCell>{contract.company}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{contract.cnpj}</TableCell>
                      <TableCell className="max-w-xs truncate">{contract.object}</TableCell>
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
