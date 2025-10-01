import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Building2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MACROREGIOES = [
  "HB",
  "Vila Toninho",
  "Schmidt",
  "Represa",
  "Bosque",
  "Talhado",
  "Central",
  "Cidade da Criança",
  "Pinheirinho",
  "Ceu",
];

interface School {
  id: string;
  nome_escola: string;
  proprietario: string | null;
  endereco_completo: string | null;
  numero: string | null;
  bairro: string | null;
  macroregiao: string | null;
  telefone_fixo: string | null;
  telefone_celular: string | null;
}

export default function SchoolsRegistration() {
  const [formData, setFormData] = useState({
    nome_escola: "",
    proprietario: "",
    endereco_completo: "",
    numero: "",
    bairro: "",
    macroregiao: "",
    telefone_fixo: "",
    telefone_celular: "",
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("user_id", user.id)
        .order("nome_escola");

      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Erro ao carregar escolas",
        description: "Não foi possível carregar a lista de escolas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMacroregiaoChange = (value: string) => {
    setFormData({
      ...formData,
      macroregiao: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome_escola.trim()) {
      toast({
        title: "Erro",
        description: "Nome da escola é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("schools").insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Escola cadastrada com sucesso",
      });

      setFormData({
        nome_escola: "",
        proprietario: "",
        endereco_completo: "",
        numero: "",
        bairro: "",
        macroregiao: "",
        telefone_fixo: "",
        telefone_celular: "",
      });

      fetchSchools();
    } catch (error) {
      console.error("Error saving school:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível cadastrar a escola",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta escola?")) return;

    try {
      const { error } = await supabase.from("schools").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Escola excluída com sucesso",
      });

      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a escola",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Cadastro de Escolas
            </h1>
            <p className="text-muted-foreground">
              Cadastro único de escolas usado em todos os sistemas
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_escola">Nome da Escola *</Label>
                <Input
                  id="nome_escola"
                  name="nome_escola"
                  value={formData.nome_escola}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proprietario">Proprietário</Label>
                <Input
                  id="proprietario"
                  name="proprietario"
                  value={formData.proprietario}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco_completo">Endereço Completo</Label>
                <Input
                  id="endereco_completo"
                  name="endereco_completo"
                  value={formData.endereco_completo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="macroregiao">Macrorregião</Label>
                <Select
                  value={formData.macroregiao}
                  onValueChange={handleMacroregiaoChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a macrorregião" />
                  </SelectTrigger>
                  <SelectContent>
                    {MACROREGIOES.map((macro) => (
                      <SelectItem key={macro} value={macro}>
                        {macro}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone_fixo">Telefone Fixo</Label>
                <Input
                  id="telefone_fixo"
                  name="telefone_fixo"
                  value={formData.telefone_fixo}
                  onChange={handleInputChange}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone_celular">Telefone Celular</Label>
                <Input
                  id="telefone_celular"
                  name="telefone_celular"
                  value={formData.telefone_celular}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? "Salvando..." : "Cadastrar Escola"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Escolas Cadastradas</h2>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : schools.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                Nenhuma escola cadastrada ainda
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <Card key={school.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{school.nome_escola}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(school.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {school.proprietario && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Proprietário:</strong> {school.proprietario}
                      </p>
                    )}
                    {school.endereco_completo && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Endereço:</strong> {school.endereco_completo}
                        {school.numero && `, ${school.numero}`}
                      </p>
                    )}
                    {school.bairro && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Bairro:</strong> {school.bairro}
                      </p>
                    )}
                    {school.macroregiao && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Macrorregião:</strong> {school.macroregiao}
                      </p>
                    )}
                    {school.telefone_fixo && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Tel. Fixo:</strong> {school.telefone_fixo}
                      </p>
                    )}
                    {school.telefone_celular && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Tel. Celular:</strong> {school.telefone_celular}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
