export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      animais: {
        Row: {
          cpf_tutor: string | null
          created_at: string
          data_nascimento: string | null
          especie: Database["public"]["Enums"]["animal_especie"]
          foto_url: string | null
          id: string
          lote_id: string | null
          nome: string
          nome_tutor: string | null
          observacoes: string | null
          org_id: string | null
          peso: number | null
          qr_code_url: string | null
          raca: string | null
          updated_at: string
        }
        Insert: {
          cpf_tutor?: string | null
          created_at?: string
          data_nascimento?: string | null
          especie: Database["public"]["Enums"]["animal_especie"]
          foto_url?: string | null
          id?: string
          lote_id?: string | null
          nome: string
          nome_tutor?: string | null
          observacoes?: string | null
          org_id?: string | null
          peso?: number | null
          qr_code_url?: string | null
          raca?: string | null
          updated_at?: string
        }
        Update: {
          cpf_tutor?: string | null
          created_at?: string
          data_nascimento?: string | null
          especie?: Database["public"]["Enums"]["animal_especie"]
          foto_url?: string | null
          id?: string
          lote_id?: string | null
          nome?: string
          nome_tutor?: string | null
          observacoes?: string | null
          org_id?: string | null
          peso?: number | null
          qr_code_url?: string | null
          raca?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animais_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_animais_lote_id"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnosticos: {
        Row: {
          animal_id: string | null
          confianca_ia: number | null
          created_at: string
          descricao: string
          id: string
          modo: string | null
          org_id: string | null
          recomendacoes: string | null
          tipo: Database["public"]["Enums"]["diagnostico_tipo"]
          veterinario_id: string | null
        }
        Insert: {
          animal_id?: string | null
          confianca_ia?: number | null
          created_at?: string
          descricao: string
          id?: string
          modo?: string | null
          org_id?: string | null
          recomendacoes?: string | null
          tipo: Database["public"]["Enums"]["diagnostico_tipo"]
          veterinario_id?: string | null
        }
        Update: {
          animal_id?: string | null
          confianca_ia?: number | null
          created_at?: string
          descricao?: string
          id?: string
          modo?: string | null
          org_id?: string | null
          recomendacoes?: string | null
          tipo?: Database["public"]["Enums"]["diagnostico_tipo"]
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnosticos_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnosticos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnosticos_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          alerta_minimo: number | null
          categoria: string | null
          created_at: string
          entrada: number | null
          id: string
          nome: string
          org_id: string | null
          quantidade: number
          saida: number | null
          tipo: string
          unidade: string | null
          updated_at: string
          validade: string | null
        }
        Insert: {
          alerta_minimo?: number | null
          categoria?: string | null
          created_at?: string
          entrada?: number | null
          id?: string
          nome: string
          org_id?: string | null
          quantidade?: number
          saida?: number | null
          tipo: string
          unidade?: string | null
          updated_at?: string
          validade?: string | null
        }
        Update: {
          alerta_minimo?: number | null
          categoria?: string | null
          created_at?: string
          entrada?: number | null
          id?: string
          nome?: string
          org_id?: string | null
          quantidade?: number
          saida?: number | null
          tipo?: string
          unidade?: string | null
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estoque_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_zootecnicos: {
        Row: {
          animal_id: string | null
          created_at: string
          dados_json: Json | null
          data_evento: string
          id: string
          observacoes: string | null
          org_id: string | null
          tipo_evento: Database["public"]["Enums"]["evento_tipo"]
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          dados_json?: Json | null
          data_evento: string
          id?: string
          observacoes?: string | null
          org_id?: string | null
          tipo_evento: Database["public"]["Enums"]["evento_tipo"]
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          dados_json?: Json | null
          data_evento?: string
          id?: string
          observacoes?: string | null
          org_id?: string | null
          tipo_evento?: Database["public"]["Enums"]["evento_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "eventos_zootecnicos_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_zootecnicos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          created_at: string
          custo_estimado: number | null
          id: string
          ingredientes_json: Json | null
          nome: string
          org_id: string | null
        }
        Insert: {
          created_at?: string
          custo_estimado?: number | null
          id?: string
          ingredientes_json?: Json | null
          nome: string
          org_id?: string | null
        }
        Update: {
          created_at?: string
          custo_estimado?: number | null
          id?: string
          ingredientes_json?: Json | null
          nome?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formulas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes_produto: {
        Row: {
          animal_id: string | null
          created_at: string
          id: string
          org_id: string | null
          produto_id: string | null
          veterinario_id: string | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          id?: string
          org_id?: string | null
          produto_id?: string | null
          veterinario_id?: string | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          id?: string
          org_id?: string | null
          produto_id?: string | null
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_produto_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_produto_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_produto_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_produto_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lotes: {
        Row: {
          created_at: string
          data_inicio: string
          finalidade: string | null
          id: string
          nome: string
          org_id: string | null
          quantidade_animais: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_inicio: string
          finalidade?: string | null
          id?: string
          nome: string
          org_id?: string | null
          quantidade_animais?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_inicio?: string
          finalidade?: string | null
          id?: string
          nome?: string
          org_id?: string | null
          quantidade_animais?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lotes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizacao_metrica_uso: {
        Row: {
          id: string
          org_id: string | null
          total_animais: number | null
          total_funcionarios: number | null
          total_produtos: number | null
          ultimo_update: string
        }
        Insert: {
          id?: string
          org_id?: string | null
          total_animais?: number | null
          total_funcionarios?: number | null
          total_produtos?: number | null
          ultimo_update?: string
        }
        Update: {
          id?: string
          org_id?: string | null
          total_animais?: number | null
          total_funcionarios?: number | null
          total_produtos?: number | null
          ultimo_update?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizacao_metrica_uso_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          limite_animais: number
          limite_funcionarios: number
          limite_produtos: number
          name: string
          plano: Database["public"]["Enums"]["plano_type"]
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          limite_animais?: number
          limite_funcionarios?: number
          limite_produtos?: number
          name: string
          plano?: Database["public"]["Enums"]["plano_type"]
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          limite_animais?: number
          limite_funcionarios?: number
          limite_produtos?: number
          name?: string
          plano?: Database["public"]["Enums"]["plano_type"]
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Relationships: []
      }
      planos: {
        Row: {
          created_at: string
          id: string
          limite_animais: number
          limite_funcionarios: number
          limite_produtos: number
          mensalidade: number
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          limite_animais: number
          limite_funcionarios: number
          limite_produtos: number
          mensalidade: number
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          limite_animais?: number
          limite_funcionarios?: number
          limite_produtos?: number
          mensalidade?: number
          nome?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          composicao: string | null
          created_at: string
          especie_alvo: Database["public"]["Enums"]["animal_especie"][] | null
          fase_alvo: string[] | null
          id: string
          imagem_url: string | null
          modo_uso: string | null
          nome: string
          org_id: string | null
          preco_kg: number | null
          tipo: Database["public"]["Enums"]["produto_tipo"]
          updated_at: string
        }
        Insert: {
          composicao?: string | null
          created_at?: string
          especie_alvo?: Database["public"]["Enums"]["animal_especie"][] | null
          fase_alvo?: string[] | null
          id?: string
          imagem_url?: string | null
          modo_uso?: string | null
          nome: string
          org_id?: string | null
          preco_kg?: number | null
          tipo: Database["public"]["Enums"]["produto_tipo"]
          updated_at?: string
        }
        Update: {
          composicao?: string | null
          created_at?: string
          especie_alvo?: Database["public"]["Enums"]["animal_especie"][] | null
          fase_alvo?: string[] | null
          id?: string
          imagem_url?: string | null
          modo_uso?: string | null
          nome?: string
          org_id?: string | null
          preco_kg?: number | null
          tipo?: Database["public"]["Enums"]["produto_tipo"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          animal_id: string | null
          created_at: string
          dosagem: string
          duracao_dias: number | null
          id: string
          medicamento: string
          observacoes: string | null
          org_id: string | null
          pdf_url: string | null
          veterinario_id: string | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          dosagem: string
          duracao_dias?: number | null
          id?: string
          medicamento: string
          observacoes?: string | null
          org_id?: string | null
          pdf_url?: string | null
          veterinario_id?: string | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          dosagem?: string
          duracao_dias?: number | null
          id?: string
          medicamento?: string
          observacoes?: string | null
          org_id?: string | null
          pdf_url?: string | null
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receitas_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          nome: string
          org_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vacinacoes: {
        Row: {
          animal_id: string | null
          created_at: string
          data_aplicacao: string
          id: string
          observacoes: string | null
          org_id: string | null
          reforco_previsto: string | null
          vacina: string
          veterinario_id: string | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          data_aplicacao: string
          id?: string
          observacoes?: string | null
          org_id?: string | null
          reforco_previsto?: string | null
          vacina: string
          veterinario_id?: string | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          data_aplicacao?: string
          id?: string
          observacoes?: string | null
          org_id?: string | null
          reforco_previsto?: string | null
          vacina?: string
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacinacoes_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacoes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacinacoes_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      animal_especie:
        | "canino"
        | "felino"
        | "bovino"
        | "suino"
        | "equino"
        | "ovino"
        | "caprino"
        | "aves"
        | "outros"
      diagnostico_tipo: "clinico" | "laboratorial" | "imagem" | "ia"
      evento_tipo:
        | "parto"
        | "inseminacao"
        | "doenca"
        | "morte"
        | "vacinacao"
        | "tratamento"
      organization_type: "clinica" | "empresa" | "fazenda"
      plano_type: "free" | "pro" | "enterprise"
      produto_tipo:
        | "racao"
        | "suplemento"
        | "medicamento"
        | "vacina"
        | "equipamento"
      user_role:
        | "superadmin"
        | "admin"
        | "vet"
        | "empresa"
        | "fazendeiro"
        | "colaborador"
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
      animal_especie: [
        "canino",
        "felino",
        "bovino",
        "suino",
        "equino",
        "ovino",
        "caprino",
        "aves",
        "outros",
      ],
      diagnostico_tipo: ["clinico", "laboratorial", "imagem", "ia"],
      evento_tipo: [
        "parto",
        "inseminacao",
        "doenca",
        "morte",
        "vacinacao",
        "tratamento",
      ],
      organization_type: ["clinica", "empresa", "fazenda"],
      plano_type: ["free", "pro", "enterprise"],
      produto_tipo: [
        "racao",
        "suplemento",
        "medicamento",
        "vacina",
        "equipamento",
      ],
      user_role: [
        "superadmin",
        "admin",
        "vet",
        "empresa",
        "fazendeiro",
        "colaborador",
      ],
    },
  },
} as const
