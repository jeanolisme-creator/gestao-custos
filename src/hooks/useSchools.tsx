import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface School {
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
  created_at: string;
  updated_at: string;
}

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchSchools();
  }, []);

  return { schools, loading, refetch: fetchSchools };
}
