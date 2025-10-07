import { supabase } from "@/integrations/supabase/client";

export interface OutsourcedQuota {
  id: string;
  user_id: string;
  school_id: string | null;
  school_name: string;
  position: string;
  total: number;
  created_at: string;
  updated_at: string;
}

export function useOutsourcedQuotas() {
  const fetchSchoolQuotas = async (schoolName: string): Promise<OutsourcedQuota[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("outsourced_quotas")
      .select("*")
      .eq("user_id", user.id)
      .eq("school_name", schoolName);

    if (error) throw error;
    return (data || []) as OutsourcedQuota[];
  };

  const upsertSchoolQuotas = async (
    schoolName: string,
    positions: Array<{ position: string; total: number }>,
    schoolId?: string | null
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const payload = positions.map((p) => ({
      user_id: user.id,
      school_id: schoolId ?? null,
      school_name: schoolName,
      position: p.position,
      total: Math.max(0, Number(p.total) || 0),
    }));

    const { error } = await supabase
      .from("outsourced_quotas")
      .upsert(payload, { onConflict: "user_id,school_name,position" });

    if (error) throw error;
  };

  return { fetchSchoolQuotas, upsertSchoolQuotas };
}
