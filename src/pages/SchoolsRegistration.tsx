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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Building2, Trash2, Upload, Download, Edit, Filter, X, FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { importSchoolsFromCSV } from "@/utils/importSchools";

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

const TIPOS_ESCOLA = ["EMEI", "EMEF", "EMEIF", "PAR", "COMP", "SEDE"];

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
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
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
  const [filters, setFilters] = useState({
    nome_escola: "",
    macroregiao: "",
    bairro: "",
    endereco_completo: "",
    tipo_escola: "",
    alunos_creche_min: "",
    alunos_infantil_min: "",
    alunos_fundamental_i_min: "",
    alunos_fundamental_ii_min: "",
    total_alunos_min: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schools, filters]);

  const applyFilters = () => {
    let filtered = [...schools];

    if (filters.nome_escola) {
      filtered = filtered.filter(s => 
        s.nome_escola.toLowerCase().includes(filters.nome_escola.toLowerCase())
      );
    }
    if (filters.macroregiao) {
      filtered = filtered.filter(s => s.macroregiao === filters.macroregiao);
    }
    if (filters.bairro) {
      filtered = filtered.filter(s => 
        s.bairro?.toLowerCase().includes(filters.bairro.toLowerCase())
      );
    }
    if (filters.endereco_completo) {
      filtered = filtered.filter(s => 
        s.endereco_completo?.toLowerCase().includes(filters.endereco_completo.toLowerCase())
      );
    }
    if (filters.tipo_escola) {
      filtered = filtered.filter(s => s.tipo_escola === filters.tipo_escola);
    }
    if (filters.alunos_creche_min) {
      filtered = filtered.filter(s => 
        (s.alunos_creche || 0) >= parseInt(filters.alunos_creche_min)
      );
    }
    if (filters.alunos_infantil_min) {
      filtered = filtered.filter(s => 
        (s.alunos_infantil || 0) >= parseInt(filters.alunos_infantil_min)
      );
    }
    if (filters.alunos_fundamental_i_min) {
      filtered = filtered.filter(s => 
        (s.alunos_fundamental_i || 0) >= parseInt(filters.alunos_fundamental_i_min)
      );
    }
    if (filters.alunos_fundamental_ii_min) {
      filtered = filtered.filter(s => 
        (s.alunos_fundamental_ii || 0) >= parseInt(filters.alunos_fundamental_ii_min)
      );
    }
    if (filters.total_alunos_min) {
      filtered = filtered.filter(s => 
        (s.total_alunos || 0) >= parseInt(filters.total_alunos_min)
      );
    }

    setFilteredSchools(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFilterSelectChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      nome_escola: "",
      macroregiao: "",
      bairro: "",
      endereco_completo: "",
      tipo_escola: "",
      alunos_creche_min: "",
      alunos_infantil_min: "",
      alunos_fundamental_i_min: "",
      alunos_fundamental_ii_min: "",
      total_alunos_min: "",
    });
  };

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

      // Check if current user is admin
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "administrador")
        .maybeSingle();
      const isAdmin = !!adminRole;

      const baseQuery = supabase
        .from("schools")
        .select("*")
        .order("nome_escola");

      const { data, error } = isAdmin
        ? await baseQuery
        : await baseQuery.eq("user_id", user.id);

      if (error) throw error;
      setSchools(data || []);
      setFilteredSchools(data || []);
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

  const handleTipoEscolaChange = (value: string) => {
    setFormData({
      ...formData,
      tipo_escola: value,
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

      if (editingSchool) {
        const { error } = await supabase
          .from("schools")
          .update({
            ...formData,
          })
          .eq("id", editingSchool.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Escola atualizada com sucesso",
        });
        setEditingSchool(null);
      } else {
        const { error } = await supabase.from("schools").insert({
          ...formData,
          user_id: user.id,
        });

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Escola cadastrada com sucesso",
        });
      }

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
        description: editingSchool ? "Não foi possível atualizar a escola" : "Não foi possível cadastrar a escola",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setEditFormData({
      nome_escola: school.nome_escola,
      proprietario: school.proprietario || "",
      endereco_completo: school.endereco_completo || "",
      numero: school.numero || "",
      bairro: school.bairro || "",
      macroregiao: school.macroregiao || "",
      telefone_fixo: school.telefone_fixo || "",
      telefone_celular: school.telefone_celular || "",
      tipo_escola: school.tipo_escola || "",
      email: school.email || "",
      alunos_creche: school.alunos_creche || 0,
      alunos_infantil: school.alunos_infantil || 0,
      alunos_fundamental_i: school.alunos_fundamental_i || 0,
      alunos_fundamental_ii: school.alunos_fundamental_ii || 0,
    });
    setDialogOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    });
  };

  const handleEditMacroregiaoChange = (value: string) => {
    setEditFormData({
      ...editFormData,
      macroregiao: value,
    });
  };

  const handleEditTipoEscolaChange = (value: string) => {
    setEditFormData({
      ...editFormData,
      tipo_escola: value,
    });
  };

  const getEditTotalAlunos = () => {
    return (
      (editFormData.alunos_creche || 0) +
      (editFormData.alunos_infantil || 0) +
      (editFormData.alunos_fundamental_i || 0) +
      (editFormData.alunos_fundamental_ii || 0)
    );
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.nome_escola.trim()) {
      toast({
        title: "Erro",
        description: "Nome da escola é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (!editingSchool) return;

      const { error } = await supabase
        .from("schools")
        .update(editFormData)
        .eq("id", editingSchool.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Escola atualizada com sucesso",
      });
      
      setDialogOpen(false);
      setEditingSchool(null);
      fetchSchools();
    } catch (error) {
      console.error("Error updating school:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a escola",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingSchool(null);
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

          const schoolsToImport = jsonData.map((row: any) => {
            const alunos_creche = parseInt(row["Creche (0-3 anos)"] || row.alunos_creche || "0") || 0;
            const alunos_infantil = parseInt(row["Infantil/Pré-escola (4-5 anos)"] || row.alunos_infantil || "0") || 0;
            const alunos_fundamental_i = parseInt(row["Ensino Fundamental I (6-10 anos)"] || row.alunos_fundamental_i || "0") || 0;
            const alunos_fundamental_ii = parseInt(row["Ensino Fundamental II (11-14 anos)"] || row.alunos_fundamental_ii || "0") || 0;
            
            return {
              user_id: user.id,
              nome_escola: row["Nome da Escola"] || row.nome_escola || "",
              proprietario: row["Proprietário"] || row.proprietario || null,
              endereco_completo: row["Endereço"] || row.endereco_completo || null,
              numero: row["Número"] || row.numero || null,
              bairro: row["Bairro"] || row.bairro || null,
              macroregiao: (() => {
                const raw = (row["Macrorregião"] ?? row.macroregiao ?? '').toString().trim();
                if (!raw || raw === 'NULL' || raw === 'nan') return null;
                const map: Record<string, string> = { 'CÉU': 'Ceu', 'CEU': 'Ceu', 'Céu': 'Ceu', 'ceu': 'Ceu', 'Ceu': 'Ceu' };
                const normalized = map[raw] ?? raw;
                const allowed = ['HB','Vila Toninho','Schmidt','Represa','Bosque','Talhado','Central','Cidade da Criança','Pinheirinho','Ceu'];
                return allowed.includes(normalized) ? normalized : null;
              })(),
              telefone_fixo: row["Telefone Fixo"] || row.telefone_fixo || null,
              telefone_celular: (row["Telefone Celular"] === 'NULL' || row["Telefone Celular"] === 'nan') ? null : (row["Telefone Celular"] || row.telefone_celular || null),
              tipo_escola: row["Tipo de Escola"] || row.tipo_escola || null,
              email: row["Email"] || row.email || null,
              alunos_creche,
              alunos_infantil,
              alunos_fundamental_i,
              alunos_fundamental_ii,
            };
          });

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

  const handleAutoImport = async () => {
    setImporting(true);
    try {
      const result = await importSchoolsFromCSV();
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        fetchSchools();
      } else {
        toast({
          title: "Erro ao importar",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar os dados",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
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
              {editingSchool ? "Editar Escola" : "Cadastro de Escolas"}
            </h1>
            <p className="text-muted-foreground">
              {editingSchool ? "Atualize as informações da escola" : "Cadastro único de escolas usado em todos os sistemas"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="default"
            onClick={handleAutoImport}
            disabled={importing}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {importing ? "Importando..." : "Importar Dados do Arquivo"}
          </Button>
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
                <Select
                  value={formData.tipo_escola}
                  onValueChange={handleTipoEscolaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ESCOLA.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="w-full md:w-auto">
                {saving ? "Salvando..." : editingSchool ? "Atualizar Escola" : "Cadastrar Escola"}
              </Button>
              {editingSchool && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelEdit}
                  className="w-full md:w-auto"
                >
                  Cancelar Edição
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Relatório de Escolas</h2>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>
          </div>

          {showFilters && (
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Filtros de Busca</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filter_nome">Nome da Escola</Label>
                    <Input
                      id="filter_nome"
                      name="nome_escola"
                      value={filters.nome_escola}
                      onChange={handleFilterChange}
                      placeholder="Digite o nome"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_macroregiao">Macrorregião</Label>
                    <Select
                      value={filters.macroregiao}
                      onValueChange={(value) => handleFilterSelectChange("macroregiao", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todas</SelectItem>
                        {MACROREGIOES.map((macro) => (
                          <SelectItem key={macro} value={macro}>
                            {macro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_bairro">Bairro</Label>
                    <Input
                      id="filter_bairro"
                      name="bairro"
                      value={filters.bairro}
                      onChange={handleFilterChange}
                      placeholder="Digite o bairro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_endereco">Endereço</Label>
                    <Input
                      id="filter_endereco"
                      name="endereco_completo"
                      value={filters.endereco_completo}
                      onChange={handleFilterChange}
                      placeholder="Digite o endereço"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_tipo">Tipo de Escola</Label>
                    <Select
                      value={filters.tipo_escola}
                      onValueChange={(value) => handleFilterSelectChange("tipo_escola", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todas</SelectItem>
                        {TIPOS_ESCOLA.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_creche">Creche (min.)</Label>
                    <Input
                      id="filter_creche"
                      name="alunos_creche_min"
                      type="number"
                      min="0"
                      value={filters.alunos_creche_min}
                      onChange={handleFilterChange}
                      placeholder="Quantidade mínima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_infantil">Infantil/Pré-escola (min.)</Label>
                    <Input
                      id="filter_infantil"
                      name="alunos_infantil_min"
                      type="number"
                      min="0"
                      value={filters.alunos_infantil_min}
                      onChange={handleFilterChange}
                      placeholder="Quantidade mínima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_fundamental_i">Ensino Fundamental I (min.)</Label>
                    <Input
                      id="filter_fundamental_i"
                      name="alunos_fundamental_i_min"
                      type="number"
                      min="0"
                      value={filters.alunos_fundamental_i_min}
                      onChange={handleFilterChange}
                      placeholder="Quantidade mínima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_fundamental_ii">Ensino Fundamental II (min.)</Label>
                    <Input
                      id="filter_fundamental_ii"
                      name="alunos_fundamental_ii_min"
                      type="number"
                      min="0"
                      value={filters.alunos_fundamental_ii_min}
                      onChange={handleFilterChange}
                      placeholder="Quantidade mínima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter_total">Total de Alunos (min.)</Label>
                    <Input
                      id="filter_total"
                      name="total_alunos_min"
                      type="number"
                      min="0"
                      value={filters.total_alunos_min}
                      onChange={handleFilterChange}
                      placeholder="Quantidade mínima"
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </Card>
          )}

          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : filteredSchools.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">
                {showFilters ? "Nenhuma escola encontrada com os filtros aplicados" : "Nenhuma escola cadastrada ainda"}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredSchools.length} de {schools.length} escola(s)
              </p>
              <Card className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {filteredSchools.map((school) => (
                    <AccordionItem key={school.id} value={school.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-semibold">{school.nome_escola}</span>
                          {school.tipo_escola && (
                            <span className="text-sm text-muted-foreground">
                              {school.tipo_escola}
                            </span>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {school.proprietario && (
                              <div>
                                <p className="text-sm font-medium">Proprietário</p>
                                <p className="text-sm text-muted-foreground">{school.proprietario}</p>
                              </div>
                            )}
                            {school.endereco_completo && (
                              <div>
                                <p className="text-sm font-medium">Endereço</p>
                                <p className="text-sm text-muted-foreground">
                                  {school.endereco_completo}
                                  {school.numero && `, ${school.numero}`}
                                </p>
                              </div>
                            )}
                            {school.bairro && (
                              <div>
                                <p className="text-sm font-medium">Bairro</p>
                                <p className="text-sm text-muted-foreground">{school.bairro}</p>
                              </div>
                            )}
                            {school.macroregiao && (
                              <div>
                                <p className="text-sm font-medium">Macrorregião</p>
                                <p className="text-sm text-muted-foreground">{school.macroregiao}</p>
                              </div>
                            )}
                            {school.telefone_fixo && (
                              <div>
                                <p className="text-sm font-medium">Telefone Fixo</p>
                                <p className="text-sm text-muted-foreground">{school.telefone_fixo}</p>
                              </div>
                            )}
                            {school.telefone_celular && (
                              <div>
                                <p className="text-sm font-medium">Telefone Celular</p>
                                <p className="text-sm text-muted-foreground">{school.telefone_celular}</p>
                              </div>
                            )}
                            {school.email && (
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{school.email}</p>
                              </div>
                            )}
                            {school.total_alunos !== null && school.total_alunos > 0 && (
                              <div>
                                <p className="text-sm font-medium">Total de Alunos</p>
                                <p className="text-sm text-muted-foreground">{school.total_alunos}</p>
                              </div>
                            )}
                          </div>

                          {(school.alunos_creche || school.alunos_infantil || school.alunos_fundamental_i || school.alunos_fundamental_ii) && (
                            <div className="space-y-2 pt-2 border-t">
                              <p className="text-sm font-medium">Distribuição de Alunos</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {school.alunos_creche > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Creche:</span>{" "}
                                    <span className="font-medium">{school.alunos_creche}</span>
                                  </div>
                                )}
                                {school.alunos_infantil > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Infantil:</span>{" "}
                                    <span className="font-medium">{school.alunos_infantil}</span>
                                  </div>
                                )}
                                {school.alunos_fundamental_i > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Fund. I:</span>{" "}
                                    <span className="font-medium">{school.alunos_fundamental_i}</span>
                                  </div>
                                )}
                                {school.alunos_fundamental_ii > 0 && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Fund. II:</span>{" "}
                                    <span className="font-medium">{school.alunos_fundamental_ii}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(school)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(school.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSchool} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_nome_escola">Nome da Escola *</Label>
                <Input
                  id="edit_nome_escola"
                  name="nome_escola"
                  value={editFormData.nome_escola}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_proprietario">Proprietário</Label>
                <Input
                  id="edit_proprietario"
                  name="proprietario"
                  value={editFormData.proprietario}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_endereco_completo">Endereço Completo</Label>
                <Input
                  id="edit_endereco_completo"
                  name="endereco_completo"
                  value={editFormData.endereco_completo}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_numero">Número</Label>
                <Input
                  id="edit_numero"
                  name="numero"
                  value={editFormData.numero}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_bairro">Bairro</Label>
                <Input
                  id="edit_bairro"
                  name="bairro"
                  value={editFormData.bairro}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_macroregiao">Macrorregião</Label>
                <Select
                  value={editFormData.macroregiao}
                  onValueChange={handleEditMacroregiaoChange}
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
                <Label htmlFor="edit_telefone_fixo">Telefone Fixo</Label>
                <Input
                  id="edit_telefone_fixo"
                  name="telefone_fixo"
                  value={editFormData.telefone_fixo}
                  onChange={handleEditInputChange}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_telefone_celular">Telefone Celular</Label>
                <Input
                  id="edit_telefone_celular"
                  name="telefone_celular"
                  value={editFormData.telefone_celular}
                  onChange={handleEditInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_tipo_escola">Tipo de Escola</Label>
                <Select
                  value={editFormData.tipo_escola}
                  onValueChange={handleEditTipoEscolaChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ESCOLA.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_alunos_creche">Creche: de 0 a 3 anos</Label>
                <Input
                  id="edit_alunos_creche"
                  name="alunos_creche"
                  type="number"
                  min="0"
                  value={editFormData.alunos_creche}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_alunos_infantil">Infantil/Pré-escola: de 4 a 5 anos</Label>
                <Input
                  id="edit_alunos_infantil"
                  name="alunos_infantil"
                  type="number"
                  min="0"
                  value={editFormData.alunos_infantil}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_alunos_fundamental_i">Ensino Fundamental I: de 6 a 10 anos</Label>
                <Input
                  id="edit_alunos_fundamental_i"
                  name="alunos_fundamental_i"
                  type="number"
                  min="0"
                  value={editFormData.alunos_fundamental_i}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_alunos_fundamental_ii">Ensino Fundamental II: de 11 a 14 anos</Label>
                <Input
                  id="edit_alunos_fundamental_ii"
                  name="alunos_fundamental_ii"
                  type="number"
                  min="0"
                  value={editFormData.alunos_fundamental_ii}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Total de Alunos</Label>
                <Input
                  value={getEditTotalAlunos()}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
