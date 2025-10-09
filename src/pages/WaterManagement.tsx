import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WaterRegistration } from "@/components/water/WaterRegistration";
import { Download, Plus, Eye, Pencil, Trash2, ArrowUpDown, FileSpreadsheet, FileText } from "lucide-react";
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

interface WaterRecord {
  id: string;
  nome_escola: string;
  cadastro: string;
  mes_ano_referencia: string;
  consumo_m3: number;
  valor_gasto: number;
  data_vencimento: string;
  endereco_completo: string;
  responsavel: string;
}

export default function WaterManagement() {
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WaterRecord | null>(null);
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
        .from("school_records")
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
        .from("school_records")
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
      Cadastro: record.cadastro,
      "Mês/Ano": record.mes_ano_referencia,
      "Consumo (m³)": record.consumo_m3,
      "Valor (R$)": record.valor_gasto,
      Vencimento: record.data_vencimento,
      Endereço: record.endereco_completo,
      Responsável: record.responsavel,
    }));

    const filename = `gestao-agua-${new Date().toISOString().split("T")[0]}`;

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
          "Gestão de Água"
        );
        break;
    }

    toast({
      title: "Sucesso",
      description: `Dados exportados em ${format.toUpperCase()}`,
    });
  };

  const columns: ColumnDef<WaterRecord>[] = [
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
      accessorKey: "cadastro",
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
      accessorKey: "consumo_m3",
      header: "Consumo (m³)",
      cell: ({ row }) => {
        const value = row.getValue("consumo_m3") as number;
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
          <h1 className="text-3xl font-bold">Gestão de Água</h1>
          <p className="text-muted-foreground">
            Gerenciamento completo de registros de água
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Em desenvolvimento",
                description: "Funcionalidade de importação CSV em breve",
              });
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Em desenvolvimento",
                description: "Funcionalidade de importação XLSX em breve",
              });
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Importar XLSX
          </Button>
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
          <WaterRegistration
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
