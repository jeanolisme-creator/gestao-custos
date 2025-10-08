import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OutsourcedEmployee {
  id: string;
  user_id: string;
  company: string;
  work_position: string;
  role: string;
  workload: string;
  monthly_salary: number;
  workplace: string | null;
  school_id: string | null;
  status: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export function useOutsourcedEmployees() {
  const [employees, setEmployees] = useState<OutsourcedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
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

      // Base query ordered by newest first
      const baseQuery = supabase
        .from("outsourced_employees")
        .select("*")
        .order("created_at", { ascending: false });

      // Some Supabase/PostgREST instances cap responses to 1000 rows per request.
      // We page through results to ensure ALL employees are loaded for accurate totals.
      const PAGE_SIZE = 1000;
      let page = 0;
      let allRows: OutsourcedEmployee[] = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const query = isAdmin ? baseQuery : baseQuery.eq("user_id", user.id);
        const { data, error } = await query.range(from, to);
        if (error) throw error;
        const batch = (data as OutsourcedEmployee[]) || [];
        allRows = allRows.concat(batch);
        if (batch.length < PAGE_SIZE) break; // last page
        page++;
      }

      setEmployees(allRows);
    } catch (error) {
      console.error("Error fetching outsourced employees:", error);
      toast({
        title: "Erro ao carregar funcionários terceirizados",
        description: "Não foi possível carregar a lista de funcionários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<OutsourcedEmployee, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("outsourced_employees")
        .insert([{ ...employee, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setEmployees((prev) => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Funcionário cadastrado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o funcionário",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<OutsourcedEmployee>) => {
    try {
      const { error } = await supabase
        .from("outsourced_employees")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setEmployees((prev) => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o funcionário",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from("outsourced_employees")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEmployees((prev) => prev.filter(emp => emp.id !== id));
      toast({
        title: "Sucesso",
        description: "Funcionário excluído com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o funcionário",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { 
    employees, 
    loading, 
    refetch: fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
}
