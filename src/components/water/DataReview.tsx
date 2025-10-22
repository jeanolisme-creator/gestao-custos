import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface WaterRecord {
  id: string;
  nome_escola: string;
  cadastro: string;
  mes_ano_referencia: string;
  consumo_m3: number;
  valor_gasto: number;
  data_vencimento: string;
  data_leitura_atual: string;
  data_leitura_anterior: string;
  numero_dias: number;
  hidrometro: string;
  responsavel: string;
  descricao_servicos: string;
  valor_servicos: number;
  ocorrencias_pendencias: string;
}

interface DataReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataReview({ open, onOpenChange }: DataReviewProps) {
  const [schools, setSchools] = useState<string[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WaterRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const years = ["2025", "2026", "2027"];
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useEffect(() => {
    if (open && user) {
      fetchSchools();
    }
  }, [open, user]);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from("schools")
        .select("nome_escola")
        .order("nome_escola");

      if (error) throw error;
      const uniqueSchools = [...new Set(data.map(s => s.nome_escola))].sort();
      setSchools(uniqueSchools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as escolas",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    if (!selectedSchool || !selectedYear) {
      toast({
        title: "Atenção",
        description: "Selecione a escola e o ano",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("school_records")
        .select("*")
        .eq("nome_escola", selectedSchool)
        .like("mes_ano_referencia", `%/${selectedYear}`)
        .order("mes_ano_referencia");

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
      handleSearch();
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

  const getMonthRecords = (month: string) => {
    const monthIndex = months.indexOf(month);
    return records.filter(r => {
      // Check by mes_ano_referencia
      const mesAnoMatch = r.mes_ano_referencia === `${month}/${selectedYear}`;
      
      // Check by data_vencimento month
      let vencimentoMatch = false;
      if (r.data_vencimento) {
        try {
          const vencDate = new Date(r.data_vencimento + 'T12:00:00');
          vencimentoMatch = vencDate.getMonth() === monthIndex && vencDate.getFullYear() === parseInt(selectedYear);
        } catch {}
      }
      
      return mesAnoMatch || vencimentoMatch;
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conferência de Dados - Água</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Escola</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {schools.map(school => (
                      <SelectItem key={school} value={school}>{school}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={!selectedSchool || !selectedYear || loading}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>

            {records.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Registros de {selectedSchool} - {selectedYear}</h3>
                
                {months.map(month => {
                  const monthRecords = getMonthRecords(month);
                  if (monthRecords.length === 0) return null;

                  return (
                    <Card key={month}>
                      <CardHeader>
                        <CardTitle className="text-base">{month}/{selectedYear}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {monthRecords.map(record => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1 grid grid-cols-4 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">Cadastro:</span>
                                <p className="font-medium">{record.cadastro}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Consumo:</span>
                                <p className="font-medium">{record.consumo_m3?.toFixed(2) || "-"} m³</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Valor:</span>
                                <p className="font-medium">
                                  {record.valor_gasto?.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }) || "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Vencimento:</span>
                                <p className="font-medium">
                                  {record.data_vencimento 
                                    ? new Date(record.data_vencimento + 'T12:00:00').toLocaleDateString("pt-BR")
                                    : "-"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setEditDialogOpen(true);
                                }}
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
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {records.length === 0 && selectedSchool && selectedYear && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum registro encontrado para esta escola e ano.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <WaterEditForm
              record={selectedRecord}
              onSave={async (updatedData) => {
                try {
                  // Remove user_id from update if present to avoid RLS issues
                  const updateData = { ...updatedData };
                  delete updateData.user_id;
                  
                  const { error } = await supabase
                    .from("school_records")
                    .update(updateData)
                    .eq("id", selectedRecord.id);

                  if (error) {
                    console.error("Supabase error:", error);
                    throw error;
                  }

                  toast({
                    title: "Sucesso",
                    description: "Registro atualizado com sucesso",
                  });
                  setEditDialogOpen(false);
                  handleSearch();
                } catch (error: any) {
                  console.error("Error updating record:", error);
                  toast({
                    title: "Erro",
                    description: error?.message || "Não foi possível atualizar o registro",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
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
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
