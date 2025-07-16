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
          tutor_id: string | null
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
          tutor_id?: string | null
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
          tutor_id?: string | null
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
            foreignKeyName: "animais_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
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
      bonificacoes: {
        Row: {
          created_at: string
          data_bonificacao: string
          data_pagamento: string | null
          descricao: string | null
          id: string
          indicacao_id: string | null
          org_id: string | null
          produto_id: string | null
          status: string
          updated_at: string
          valor: number
          veterinario_id: string | null
        }
        Insert: {
          created_at?: string
          data_bonificacao?: string
          data_pagamento?: string | null
          descricao?: string | null
          id?: string
          indicacao_id?: string | null
          org_id?: string | null
          produto_id?: string | null
          status?: string
          updated_at?: string
          valor: number
          veterinario_id?: string | null
        }
        Update: {
          created_at?: string
          data_bonificacao?: string
          data_pagamento?: string | null
          descricao?: string | null
          id?: string
          indicacao_id?: string | null
          org_id?: string | null
          produto_id?: string | null
          status?: string
          updated_at?: string
          valor?: number
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonificacoes_indicacao_id_fkey"
            columns: ["indicacao_id"]
            isOneToOne: false
            referencedRelation: "indicacoes_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonificacoes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonificacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonificacoes_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bonificacoes_veterinario: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          empresa_id: string
          id: string
          meta_indicacoes: number | null
          org_id: string | null
          percentual: number | null
          produto_id: string
          status: string | null
          tipo_bonificacao: string
          updated_at: string
          valor: number | null
          veterinario_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          empresa_id: string
          id?: string
          meta_indicacoes?: number | null
          org_id?: string | null
          percentual?: number | null
          produto_id: string
          status?: string | null
          tipo_bonificacao: string
          updated_at?: string
          valor?: number | null
          veterinario_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          empresa_id?: string
          id?: string
          meta_indicacoes?: number | null
          org_id?: string | null
          percentual?: number | null
          produto_id?: string
          status?: string | null
          tipo_bonificacao?: string
          updated_at?: string
          valor?: number | null
          veterinario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonificacoes_veterinario_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonificacoes_veterinario_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonificacoes_veterinario_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonificacoes_veterinario_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cartao_vacinacao: {
        Row: {
          animal_id: string
          created_at: string
          data_criacao: string
          id: string
          observacoes_gerais: string | null
          org_id: string | null
          updated_at: string
          veterinario_responsavel_id: string | null
        }
        Insert: {
          animal_id: string
          created_at?: string
          data_criacao?: string
          id?: string
          observacoes_gerais?: string | null
          org_id?: string | null
          updated_at?: string
          veterinario_responsavel_id?: string | null
        }
        Update: {
          animal_id?: string
          created_at?: string
          data_criacao?: string
          id?: string
          observacoes_gerais?: string | null
          org_id?: string | null
          updated_at?: string
          veterinario_responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cartao_vacinacao_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cartao_vacinacao_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cartao_vacinacao_veterinario_responsavel_id_fkey"
            columns: ["veterinario_responsavel_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dados_nutricionais: {
        Row: {
          calcio: number | null
          cinzas: number | null
          confianca_ia: number | null
          created_at: string
          energia_metabolizavel: number | null
          extraido_por_ia: boolean | null
          fibra_bruta: number | null
          fosforo: number | null
          gordura_bruta: number | null
          id: string
          outros_nutrientes: Json | null
          produto_id: string
          proteina_bruta: number | null
          revisado_por_humano: boolean | null
          umidade: number | null
        }
        Insert: {
          calcio?: number | null
          cinzas?: number | null
          confianca_ia?: number | null
          created_at?: string
          energia_metabolizavel?: number | null
          extraido_por_ia?: boolean | null
          fibra_bruta?: number | null
          fosforo?: number | null
          gordura_bruta?: number | null
          id?: string
          outros_nutrientes?: Json | null
          produto_id: string
          proteina_bruta?: number | null
          revisado_por_humano?: boolean | null
          umidade?: number | null
        }
        Update: {
          calcio?: number | null
          cinzas?: number | null
          confianca_ia?: number | null
          created_at?: string
          energia_metabolizavel?: number | null
          extraido_por_ia?: boolean | null
          fibra_bruta?: number | null
          fosforo?: number | null
          gordura_bruta?: number | null
          id?: string
          outros_nutrientes?: Json | null
          produto_id?: string
          proteina_bruta?: number | null
          revisado_por_humano?: boolean | null
          umidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_nutricionais_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      desempenho_alimentos: {
        Row: {
          animal_id: string | null
          consumo_racao_kg: number | null
          conversao_alimentar: number | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          fazenda_id: string
          ganho_peso_dia: number | null
          id: string
          lote_id: string | null
          observacoes: string | null
          periodo_dias: number
          peso_atual: number | null
          peso_inicial: number | null
          produto_id: string
        }
        Insert: {
          animal_id?: string | null
          consumo_racao_kg?: number | null
          conversao_alimentar?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          fazenda_id: string
          ganho_peso_dia?: number | null
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          periodo_dias: number
          peso_atual?: number | null
          peso_inicial?: number | null
          produto_id: string
        }
        Update: {
          animal_id?: string | null
          consumo_racao_kg?: number | null
          conversao_alimentar?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          fazenda_id?: string
          ganho_peso_dia?: number | null
          id?: string
          lote_id?: string | null
          observacoes?: string | null
          periodo_dias?: number
          peso_atual?: number | null
          peso_inicial?: number | null
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "desempenho_alimentos_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desempenho_alimentos_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desempenho_alimentos_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desempenho_alimentos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
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
      external_integrations: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string
          endpoint_url: string | null
          id: string
          last_sync: string | null
          name: string
          status: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          last_sync?: string | null
          name: string
          status?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string
          endpoint_url?: string | null
          id?: string
          last_sync?: string | null
          name?: string
          status?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      global_config: {
        Row: {
          app_slogan: string | null
          app_title: string | null
          background_color: string | null
          created_at: string
          favicon_url: string | null
          font: string | null
          id: string
          layout_mode: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          app_slogan?: string | null
          app_title?: string | null
          background_color?: string | null
          created_at?: string
          favicon_url?: string | null
          font?: string | null
          id?: string
          layout_mode?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          app_slogan?: string | null
          app_title?: string | null
          background_color?: string | null
          created_at?: string
          favicon_url?: string | null
          font?: string | null
          id?: string
          layout_mode?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
      receita_itens: {
        Row: {
          created_at: string
          dosagem: string
          duracao_dias: number | null
          frequencia: string | null
          id: string
          medicamento_nome: string
          observacoes: string | null
          produto_id: string | null
          receita_id: string | null
        }
        Insert: {
          created_at?: string
          dosagem: string
          duracao_dias?: number | null
          frequencia?: string | null
          id?: string
          medicamento_nome: string
          observacoes?: string | null
          produto_id?: string | null
          receita_id?: string | null
        }
        Update: {
          created_at?: string
          dosagem?: string
          duracao_dias?: number | null
          frequencia?: string | null
          id?: string
          medicamento_nome?: string
          observacoes?: string | null
          produto_id?: string | null
          receita_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receita_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_itens_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          animal_id: string | null
          created_at: string
          id: string
          observacoes: string | null
          org_id: string | null
          pdf_url: string | null
          status: string | null
          tipo_receita: string | null
          veterinario_id: string | null
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          org_id?: string | null
          pdf_url?: string | null
          status?: string | null
          tipo_receita?: string | null
          veterinario_id?: string | null
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          org_id?: string | null
          pdf_url?: string | null
          status?: string | null
          tipo_receita?: string | null
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
      sugestoes_diagnostico_ia: {
        Row: {
          aceito_pelo_veterinario: boolean | null
          animal_id: string | null
          confianca_geral: number | null
          created_at: string
          diagnostico_final_id: string | null
          id: string
          sintomas: string
          sugestoes_ia: Json
          veterinario_id: string | null
        }
        Insert: {
          aceito_pelo_veterinario?: boolean | null
          animal_id?: string | null
          confianca_geral?: number | null
          created_at?: string
          diagnostico_final_id?: string | null
          id?: string
          sintomas: string
          sugestoes_ia: Json
          veterinario_id?: string | null
        }
        Update: {
          aceito_pelo_veterinario?: boolean | null
          animal_id?: string | null
          confianca_geral?: number | null
          created_at?: string
          diagnostico_final_id?: string | null
          id?: string
          sintomas?: string
          sugestoes_ia?: Json
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sugestoes_diagnostico_ia_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_diagnostico_ia_diagnostico_final_id_fkey"
            columns: ["diagnostico_final_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_diagnostico_ia_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmin_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      tutores: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          org_id: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          org_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          org_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutores_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      calcular_metricas_desempenho_produto: {
        Args: { produto_uuid: string }
        Returns: Json
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_superadmin: {
        Args: { user_email: string }
        Returns: boolean
      }
      log_superadmin_action: {
        Args: {
          admin_user_id: string
          action: string
          target_type: string
          target_id?: string
          details?: Json
        }
        Returns: string
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
      organization_type:
        | "clinica_veterinaria"
        | "empresa_alimentos"
        | "empresa_medicamentos"
        | "fazenda"
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
        | "veterinario"
        | "colaborador"
        | "vendedor"
        | "gerente_produto"
        | "veterinario_fazenda"
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
      organization_type: [
        "clinica_veterinaria",
        "empresa_alimentos",
        "empresa_medicamentos",
        "fazenda",
      ],
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
        "veterinario",
        "colaborador",
        "vendedor",
        "gerente_produto",
        "veterinario_fazenda",
      ],
    },
  },
} as const
