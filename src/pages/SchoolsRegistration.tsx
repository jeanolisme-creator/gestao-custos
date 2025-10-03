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
import { ArrowLeft, Building2, Trash2, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

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
  tipo_escola: string | null;
  email: string | null;
  alunos_creche: number | null;
  alunos_infantil: number | null;
  alunos_fundamental_i: number | null;
  alunos_fundamental_ii: number | null;
  total_alunos: number | null;
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
    tipo_escola: "",
    email: "",
    alunos_creche: 0,
    alunos_infantil: 0,
    alunos_fundamental_i: 0,
    alunos_fundamental_ii: 0,
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
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
  };

  const getTotalAlunos = () => {
    return (
      (formData.alunos_creche || 0) +
      (formData.alunos_infantil || 0) +
      (formData.alunos_fundamental_i || 0) +
      (formData.alunos_fundamental_ii || 0)
    );
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
        tipo_escola: "",
        email: "",
        alunos_creche: 0,
        alunos_infantil: 0,
        alunos_fundamental_i: 0,
        alunos_fundamental_ii: 0,
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

  const handleExportCSV = () => {
    if (schools.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const csvData = schools.map(school => ({
      "Nome da Escola": school.nome_escola,
      "Proprietário": school.proprietario || "",
      "Endereço": school.endereco_completo || "",
      "Número": school.numero || "",
      "Bairro": school.bairro || "",
      "Macrorregião": school.macroregiao || "",
      "Telefone Fixo": school.telefone_fixo || "",
      "Telefone Celular": school.telefone_celular || "",
      "Tipo de Escola": school.tipo_escola || "",
      "Email": school.email || "",
      "Creche (0-3 anos)": school.alunos_creche || 0,
      "Infantil/Pré-escola (4-5 anos)": school.alunos_infantil || 0,
      "Ensino Fundamental I (6-10 anos)": school.alunos_fundamental_i || 0,
      "Ensino Fundamental II (11-14 anos)": school.alunos_fundamental_ii || 0,
      "Total de Alunos": school.total_alunos || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `escolas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Sucesso!",
      description: "Dados exportados em CSV",
    });
  };

  const handleExportXLSX = () => {
    if (schools.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const xlsxData = schools.map(school => ({
      "Nome da Escola": school.nome_escola,
      "Proprietário": school.proprietario || "",
      "Endereço": school.endereco_completo || "",
      "Número": school.numero || "",
      "Bairro": school.bairro || "",
      "Macrorregião": school.macroregiao || "",
      "Telefone Fixo": school.telefone_fixo || "",
      "Telefone Celular": school.telefone_celular || "",
      "Tipo de Escola": school.tipo_escola || "",
      "Email": school.email || "",
      "Creche (0-3 anos)": school.alunos_creche || 0,
      "Infantil/Pré-escola (4-5 anos)": school.alunos_infantil || 0,
      "Ensino Fundamental I (6-10 anos)": school.alunos_fundamental_i || 0,
      "Ensino Fundamental II (11-14 anos)": school.alunos_fundamental_ii || 0,
      "Total de Alunos": school.total_alunos || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(xlsxData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Escolas");
    XLSX.writeFile(wb, `escolas_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Sucesso!",
      description: "Dados exportados em XLSX",
    });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({
              title: "Erro",
              description: "Usuário não autenticado",
              variant: "destructive",
            });
            return;
          }

          const schoolsToImport = jsonData.map((row: any) => ({
            user_id: user.id,
            nome_escola: row["Nome da Escola"] || row.nome_escola || "",
            proprietario: row["Proprietário"] || row.proprietario || null,
            endereco_completo: row["Endereço"] || row.endereco_completo || null,
            numero: row["Número"] || row.numero || null,
            bairro: row["Bairro"] || row.bairro || null,
            macroregiao: row["Macrorregião"] || row.macroregiao || null,
            telefone_fixo: row["Telefone Fixo"] || row.telefone_fixo || null,
            telefone_celular: row["Telefone Celular"] || row.telefone_celular || null,
            tipo_escola: row["Tipo de Escola"] || row.tipo_escola || null,
            email: row["Email"] || row.email || null,
            alunos_creche: parseInt(row["Creche (0-3 anos)"] || row.alunos_creche || "0") || 0,
            alunos_infantil: parseInt(row["Infantil/Pré-escola (4-5 anos)"] || row.alunos_infantil || "0") || 0,
            alunos_fundamental_i: parseInt(row["Ensino Fundamental I (6-10 anos)"] || row.alunos_fundamental_i || "0") || 0,
            alunos_fundamental_ii: parseInt(row["Ensino Fundamental II (11-14 anos)"] || row.alunos_fundamental_ii || "0") || 0,
          }));

          const { error } = await supabase.from("schools").insert(schoolsToImport);

          if (error) throw error;

          toast({
            title: "Sucesso!",
            description: `${schoolsToImport.length} escola(s) importada(s)`,
          });

          fetchSchools();
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            title: "Erro ao importar",
            description: "Verifique o formato do arquivo",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo",
        variant: "destructive",
      });
    }
    e.target.value = "";
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

        <div className="flex gap-2 flex-wrap">
          <input
            type="file"
            id="import-file"
            accept=".csv,.xlsx,.xls"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-file")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-file")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar XLSX
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportXLSX}>
            <Download className="h-4 w-4 mr-2" />
            Exportar XLSX
          </Button>
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

              <div className="space-y-2">
                <Label htmlFor="tipo_escola">Tipo de Escola</Label>
                <Input
                  id="tipo_escola"
                  name="tipo_escola"
                  value={formData.tipo_escola}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alunos_creche">Creche: de 0 a 3 anos</Label>
                <Input
                  id="alunos_creche"
                  name="alunos_creche"
                  type="number"
                  min="0"
                  value={formData.alunos_creche}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alunos_infantil">Infantil/Pré-escola: de 4 a 5 anos</Label>
                <Input
                  id="alunos_infantil"
                  name="alunos_infantil"
                  type="number"
                  min="0"
                  value={formData.alunos_infantil}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alunos_fundamental_i">Ensino Fundamental I: de 6 a 10 anos</Label>
                <Input
                  id="alunos_fundamental_i"
                  name="alunos_fundamental_i"
                  type="number"
                  min="0"
                  value={formData.alunos_fundamental_i}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alunos_fundamental_ii">Ensino Fundamental II: de 11 a 14 anos</Label>
                <Input
                  id="alunos_fundamental_ii"
                  name="alunos_fundamental_ii"
                  type="number"
                  min="0"
                  value={formData.alunos_fundamental_ii}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Total de Alunos</Label>
                <Input
                  value={getTotalAlunos()}
                  disabled
                  className="bg-muted"
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
                    {school.tipo_escola && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Tipo:</strong> {school.tipo_escola}
                      </p>
                    )}
                    {school.email && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Email:</strong> {school.email}
                      </p>
                    )}
                    {school.total_alunos !== null && school.total_alunos > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Total de Alunos:</strong> {school.total_alunos}
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
