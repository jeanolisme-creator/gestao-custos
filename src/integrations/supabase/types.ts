export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          addendums: Json | null
          annual_value: number
          cnpj: string
          commitment_number: string
          company_name: string
          contract_number: string
          contract_object: string
          created_at: string
          end_date: string
          id: string
          monthly_value: number
          signing_date: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          addendums?: Json | null
          annual_value: number
          cnpj: string
          commitment_number: string
          company_name: string
          contract_number: string
          contract_object: string
          created_at?: string
          end_date: string
          id?: string
          monthly_value: number
          signing_date?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          addendums?: Json | null
          annual_value?: number
          cnpj?: string
          commitment_number?: string
          company_name?: string
          contract_number?: string
          contract_object?: string
          created_at?: string
          end_date?: string
          id?: string
          monthly_value?: number
          signing_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      energy_records: {
        Row: {
          bairro: string | null
          cadastro_cliente: string
          consumo_kwh: number | null
          created_at: string
          data_vencimento: string | null
          demanda_kwh: number | null
          descricao_servicos: string | null
          endereco: string | null
          id: string
          macroregiao: string | null
          mes_ano_referencia: string
          nome_escola: string
          numero: string | null
          numero_dias: number | null
          ocorrencias_pendencias: string | null
          proprietario: string | null
          relogio: string | null
          responsavel: string | null
          tipo_escola: string | null
          tipo_instalacao: string | null
          unidade: string | null
          updated_at: string
          user_id: string
          valor_gasto: number | null
          valor_servicos: number | null
        }
        Insert: {
          bairro?: string | null
          cadastro_cliente: string
          consumo_kwh?: number | null
          created_at?: string
          data_vencimento?: string | null
          demanda_kwh?: number | null
          descricao_servicos?: string | null
          endereco?: string | null
          id?: string
          macroregiao?: string | null
          mes_ano_referencia: string
          nome_escola: string
          numero?: string | null
          numero_dias?: number | null
          ocorrencias_pendencias?: string | null
          proprietario?: string | null
          relogio?: string | null
          responsavel?: string | null
          tipo_escola?: string | null
          tipo_instalacao?: string | null
          unidade?: string | null
          updated_at?: string
          user_id: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Update: {
          bairro?: string | null
          cadastro_cliente?: string
          consumo_kwh?: number | null
          created_at?: string
          data_vencimento?: string | null
          demanda_kwh?: number | null
          descricao_servicos?: string | null
          endereco?: string | null
          id?: string
          macroregiao?: string | null
          mes_ano_referencia?: string
          nome_escola?: string
          numero?: string | null
          numero_dias?: number | null
          ocorrencias_pendencias?: string | null
          proprietario?: string | null
          relogio?: string | null
          responsavel?: string | null
          tipo_escola?: string | null
          tipo_instalacao?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Relationships: []
      }
      fixed_line_records: {
        Row: {
          bairro: string | null
          cadastro_cliente: string
          created_at: string
          data_vencimento: string | null
          descricao_servicos: string | null
          endereco: string | null
          id: string
          macroregiao: string | null
          mes_ano_referencia: string
          nome_escola: string
          numero: string | null
          numero_dias: number | null
          numero_linha: string | null
          ocorrencias_pendencias: string | null
          proprietario: string | null
          responsavel: string | null
          tipo_escola: string | null
          updated_at: string
          user_id: string
          valor_gasto: number | null
          valor_servicos: number | null
        }
        Insert: {
          bairro?: string | null
          cadastro_cliente: string
          created_at?: string
          data_vencimento?: string | null
          descricao_servicos?: string | null
          endereco?: string | null
          id?: string
          macroregiao?: string | null
          mes_ano_referencia: string
          nome_escola: string
          numero?: string | null
          numero_dias?: number | null
          numero_linha?: string | null
          ocorrencias_pendencias?: string | null
          proprietario?: string | null
          responsavel?: string | null
          tipo_escola?: string | null
          updated_at?: string
          user_id: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Update: {
          bairro?: string | null
          cadastro_cliente?: string
          created_at?: string
          data_vencimento?: string | null
          descricao_servicos?: string | null
          endereco?: string | null
          id?: string
          macroregiao?: string | null
          mes_ano_referencia?: string
          nome_escola?: string
          numero?: string | null
          numero_dias?: number | null
          numero_linha?: string | null
          ocorrencias_pendencias?: string | null
          proprietario?: string | null
          responsavel?: string | null
          tipo_escola?: string | null
          updated_at?: string
          user_id?: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Relationships: []
      }
      mobile_records: {
        Row: {
          bairro: string | null
          cadastro_cliente: string
          consumo_mb: number | null
          created_at: string
          data_vencimento: string | null
          descricao_servicos: string | null
          endereco: string | null
          id: string
          macroregiao: string | null
          mes_ano_referencia: string
          nome_escola: string
          numero: string | null
          numero_dias: number | null
          numero_linha: string | null
          ocorrencias_pendencias: string | null
          proprietario: string | null
          responsavel: string | null
          tipo_escola: string | null
          updated_at: string
          user_id: string
          valor_gasto: number | null
          valor_servicos: number | null
        }
        Insert: {
          bairro?: string | null
          cadastro_cliente: string
          consumo_mb?: number | null
          created_at?: string
          data_vencimento?: string | null
          descricao_servicos?: string | null
          endereco?: string | null
          id?: string
          macroregiao?: string | null
          mes_ano_referencia: string
          nome_escola: string
          numero?: string | null
          numero_dias?: number | null
          numero_linha?: string | null
          ocorrencias_pendencias?: string | null
          proprietario?: string | null
          responsavel?: string | null
          tipo_escola?: string | null
          updated_at?: string
          user_id: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Update: {
          bairro?: string | null
          cadastro_cliente?: string
          consumo_mb?: number | null
          created_at?: string
          data_vencimento?: string | null
          descricao_servicos?: string | null
          endereco?: string | null
          id?: string
          macroregiao?: string | null
          mes_ano_referencia?: string
          nome_escola?: string
          numero?: string | null
          numero_dias?: number | null
          numero_linha?: string | null
          ocorrencias_pendencias?: string | null
          proprietario?: string | null
          responsavel?: string | null
          tipo_escola?: string | null
          updated_at?: string
          user_id?: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Relationships: []
      }
      outsourced_employees: {
        Row: {
          company: string
          created_at: string
          id: string
          monthly_salary: number
          observations: string | null
          role: string
          school_id: string | null
          status: string
          updated_at: string
          user_id: string
          work_position: string
          workload: string
          workplace: string | null
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          monthly_salary?: number
          observations?: string | null
          role: string
          school_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          work_position: string
          workload: string
          workplace?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          monthly_salary?: number
          observations?: string | null
          role?: string
          school_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          work_position?: string
          workload?: string
          workplace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outsourced_employees_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_demand_records: {
        Row: {
          alunos_creche: number | null
          alunos_fundamental_i: number | null
          alunos_fundamental_ii: number | null
          alunos_infantil: number | null
          alunos_por_turma: number | null
          bairro: string | null
          created_at: string
          email: string | null
          endereco_completo: string | null
          id: string
          macroregiao: string | null
          nome_escola: string
          numero: string | null
          telefone: string | null
          total_alunos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alunos_creche?: number | null
          alunos_fundamental_i?: number | null
          alunos_fundamental_ii?: number | null
          alunos_infantil?: number | null
          alunos_por_turma?: number | null
          bairro?: string | null
          created_at?: string
          email?: string | null
          endereco_completo?: string | null
          id?: string
          macroregiao?: string | null
          nome_escola: string
          numero?: string | null
          telefone?: string | null
          total_alunos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alunos_creche?: number | null
          alunos_fundamental_i?: number | null
          alunos_fundamental_ii?: number | null
          alunos_infantil?: number | null
          alunos_por_turma?: number | null
          bairro?: string | null
          created_at?: string
          email?: string | null
          endereco_completo?: string | null
          id?: string
          macroregiao?: string | null
          nome_escola?: string
          numero?: string | null
          telefone?: string | null
          total_alunos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_records: {
        Row: {
          cadastro: string
          consumo_m3: number | null
          created_at: string
          data_vencimento: string | null
          descricao_servicos: string | null
          endereco_completo: string | null
          hidrometro: string | null
          id: string
          mes_ano_referencia: string
          nome_escola: string
          numero_dias: number | null
          ocorrencias_pendencias: string | null
          responsavel: string | null
          updated_at: string
          user_id: string
          valor_gasto: number | null
          valor_servicos: number | null
        }
        Insert: {
          cadastro: string
          consumo_m3?: number | null
          created_at?: string
          data_vencimento?: string | null
          descricao_servicos?: string | null
          endereco_completo?: string | null
          hidrometro?: string | null
          id?: string
          mes_ano_referencia: string
          nome_escola: string
          numero_dias?: number | null
          ocorrencias_pendencias?: string | null
          responsavel?: string | null
          updated_at?: string
          user_id: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Update: {
          cadastro?: string
          consumo_m3?: number | null
          created_at?: string
          data_vencimento?: string | null
          descricao_servicos?: string | null
          endereco_completo?: string | null
          hidrometro?: string | null
          id?: string
          mes_ano_referencia?: string
          nome_escola?: string
          numero_dias?: number | null
          ocorrencias_pendencias?: string | null
          responsavel?: string | null
          updated_at?: string
          user_id?: string
          valor_gasto?: number | null
          valor_servicos?: number | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          alunos_creche: number | null
          alunos_fundamental_i: number | null
          alunos_fundamental_ii: number | null
          alunos_infantil: number | null
          bairro: string | null
          created_at: string
          email: string | null
          endereco_completo: string | null
          id: string
          macroregiao: string | null
          nome_escola: string
          numero: string | null
          proprietario: string | null
          telefone_celular: string | null
          telefone_fixo: string | null
          tipo_escola: string | null
          total_alunos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alunos_creche?: number | null
          alunos_fundamental_i?: number | null
          alunos_fundamental_ii?: number | null
          alunos_infantil?: number | null
          bairro?: string | null
          created_at?: string
          email?: string | null
          endereco_completo?: string | null
          id?: string
          macroregiao?: string | null
          nome_escola: string
          numero?: string | null
          proprietario?: string | null
          telefone_celular?: string | null
          telefone_fixo?: string | null
          tipo_escola?: string | null
          total_alunos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alunos_creche?: number | null
          alunos_fundamental_i?: number | null
          alunos_fundamental_ii?: number | null
          alunos_infantil?: number | null
          bairro?: string | null
          created_at?: string
          email?: string | null
          endereco_completo?: string | null
          id?: string
          macroregiao?: string | null
          nome_escola?: string
          numero?: string | null
          proprietario?: string | null
          telefone_celular?: string | null
          telefone_fixo?: string | null
          tipo_escola?: string | null
          total_alunos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "administrador" | "operador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "operador"],
    },
  },
} as const
