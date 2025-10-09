import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { EnergyRegistration } from "./EnergyRegistration";

interface PendingRecord {
  id: string;
  nome_escola: string;
  mes_ano_referencia: string;
  ocorrencias_pendencias: string;
}

interface PendingSchoolsProps {
  onClose: () => void;
}

export function PendingSchools({ onClose }: PendingSchoolsProps) {
  const { toast } = useToast();
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingRecords();
  }, []);

  const fetchPendingRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("energy_records")
        .select("*")
        .eq("cadastro_cliente", "PENDENTE")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingRecords(data || []);
    } catch (error) {
      console.error("Error fetching pending records:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as pendências",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: PendingRecord) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
    fetchPendingRecords();
    toast({
      title: "Sucesso",
      description: "Pendência resolvida com sucesso",
    });
  };

  if (loading) {
    return <div className="text-center py-12">Carregando pendências...</div>;
  }

  if (pendingRecords.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Não há pendências no momento. Todas as escolas foram preenchidas!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Pendências ({pendingRecords.length})</h2>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="space-y-3">
        {pendingRecords.map((record) => (
          <Card key={record.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{record.nome_escola}</h3>
                <p className="text-sm text-muted-foreground">
                  Mês: {record.mes_ano_referencia}
                </p>
                <p className="text-sm text-muted-foreground">
                  {record.ocorrencias_pendencias}
                </p>
              </div>
              <Button onClick={() => handleEdit(record)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pendência</DialogTitle>
          </DialogHeader>
          <EnergyRegistration
            onSuccess={handleSuccess}
            editData={selectedRecord}
            viewMode={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
