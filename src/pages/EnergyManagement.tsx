import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnergyRegistration } from "@/components/energy/EnergyRegistration";
import { Download, Plus, Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { exportToExcel, exportToCSV, exportToPDF } from "@/utils/exportData";
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

interface EnergyRecord {
  id: string;
  nome_escola: string;
  cadastro_cliente: string;
  mes_ano_referencia: string;
  consumo_kwh: number;
  valor_gasto: number;
  data_vencimento: string;
  endereco: string;
  tipo_escola: string;
}

export default function EnergyManagement() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EnergyRecord | null>(null);
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">("create");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("energy_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

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
      fetchRecords();
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

  const handleExport = (format: "excel" | "csv" | "pdf") => {
    const exportData = records.map((record) => ({
      Escola: record.nome_escola,
      Cadastro: record.cadastro_cliente,
      "Mês/Ano": record.mes_ano_referencia,
      "Consumo (kWh)": record.consumo_kwh,
      "Valor (R$)": record.valor_gasto,
      Vencimento: record.data_vencimento,
      Endereço: record.endereco,
      Tipo: record.tipo_escola,
    }));

    const filename = `gestao-energia-${new Date().toISOString().split("T")[0]}`;

    switch (format) {
      case "excel":
        exportToExcel(exportData, filename);
        break;
      case "csv":
        exportToCSV(exportData, filename);
        break;
      case "pdf":
        exportToPDF(
          exportData,
          Object.keys(exportData[0] || {}),
          filename,
          "Gestão de Energia"
        );
        break;
    }

    toast({
      title: "Sucesso",
      description: `Dados exportados em ${format.toUpperCase()}`,
    });
  };

  const columns: ColumnDef<EnergyRecord>[] = [
    {
      accessorKey: "nome_escola",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Escola
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "cadastro_cliente",
      header: "Cadastro",
    },
    {
      accessorKey: "mes_ano_referencia",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mês/Ano
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "consumo_kwh",
      header: "Consumo (kWh)",
      cell: ({ row }) => {
        const value = row.getValue("consumo_kwh") as number;
        return value ? value.toFixed(2) : "-";
      },
    },
    {
      accessorKey: "valor_gasto",
      header: "Valor (R$)",
      cell: ({ row }) => {
        const value = row.getValue("valor_gasto") as number;
        return value
          ? value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "-";
      },
    },
    {
      accessorKey: "data_vencimento",
      header: "Vencimento",
      cell: ({ row }) => {
        const date = row.getValue("data_vencimento") as string;
        return date ? new Date(date).toLocaleDateString("pt-BR") : "-";
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecord(record);
                setViewMode("view");
                setIsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRecord(record);
                setViewMode("edit");
                setIsDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setRecordToDelete(record.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Energia</h1>
          <p className="text-muted-foreground">
            Gerenciamento completo de registros de energia
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("excel")}
            disabled={records.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={records.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={records.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            onClick={() => {
              setSelectedRecord(null);
              setViewMode("create");
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Registro
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <DataTable
          columns={columns}
          data={records}
          searchPlaceholder="Buscar por escola, cadastro..."
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "create"
                ? "Novo Registro"
                : viewMode === "edit"
                ? "Editar Registro"
                : "Visualizar Registro"}
            </DialogTitle>
          </DialogHeader>
          <EnergyRegistration
            onSuccess={() => {
              setIsDialogOpen(false);
              fetchRecords();
            }}
            editData={selectedRecord}
            viewMode={viewMode === "view"}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode
              ser desfeita.
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
    </div>
  );
}
