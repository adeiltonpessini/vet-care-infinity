
-- Criar tabela para bonificações de veterinários
CREATE TABLE public.bonificacoes_veterinario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES organizations(id) NOT NULL,
  veterinario_id UUID REFERENCES users(id) NOT NULL,
  produto_id UUID REFERENCES produtos(id) NOT NULL,
  tipo_bonificacao TEXT NOT NULL CHECK (tipo_bonificacao IN ('percentual', 'valor_fixo', 'produto_gratis')),
  valor NUMERIC,
  percentual NUMERIC,
  meta_indicacoes INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'expirado')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para dados nutricionais extraídos por IA
CREATE TABLE public.dados_nutricionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) NOT NULL,
  proteina_bruta NUMERIC,
  gordura_bruta NUMERIC,
  fibra_bruta NUMERIC,
  umidade NUMERIC,
  cinzas NUMERIC,
  calcio NUMERIC,
  fosforo NUMERIC,
  energia_metabolizavel NUMERIC,
  outros_nutrientes JSONB,
  extraido_por_ia BOOLEAN DEFAULT false,
  confianca_ia NUMERIC,
  revisado_por_humano BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para tutores (área veterinária)
CREATE TABLE public.tutores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sugestões de diagnóstico por IA
CREATE TABLE public.sugestoes_diagnostico_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID REFERENCES animais(id),
  sintomas TEXT NOT NULL,
  sugestoes_ia JSONB NOT NULL,
  confianca_geral NUMERIC,
  aceito_pelo_veterinario BOOLEAN DEFAULT false,
  diagnostico_final_id UUID REFERENCES diagnosticos(id),
  veterinario_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para itens de receita (produtos prescritos)
CREATE TABLE public.receita_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID REFERENCES receitas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  medicamento_nome TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  frequencia TEXT,
  duracao_dias INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para desempenho de alimentos nas fazendas
CREATE TABLE public.desempenho_alimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fazenda_id UUID REFERENCES organizations(id) NOT NULL,
  produto_id UUID REFERENCES produtos(id) NOT NULL,
  animal_id UUID REFERENCES animais(id),
  lote_id UUID REFERENCES lotes(id),
  peso_inicial NUMERIC,
  peso_atual NUMERIC,
  ganho_peso_dia NUMERIC,
  consumo_racao_kg NUMERIC,
  conversao_alimentar NUMERIC,
  periodo_dias INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para cartão de vacinação
CREATE TABLE public.cartao_vacinacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID REFERENCES animais(id) NOT NULL,
  org_id UUID REFERENCES organizations(id),
  veterinario_responsavel_id UUID REFERENCES users(id),
  data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes_gerais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de animais para incluir tutor_id
ALTER TABLE public.animais ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES tutores(id);

-- Atualizar tabela de receitas para remover campos antigos e usar tabela de itens
ALTER TABLE public.receitas DROP COLUMN IF EXISTS medicamento;
ALTER TABLE public.receitas DROP COLUMN IF EXISTS dosagem;
ALTER TABLE public.receitas DROP COLUMN IF EXISTS duracao_dias;

-- Adicionar novos campos para receitas
ALTER TABLE public.receitas ADD COLUMN IF NOT EXISTS tipo_receita TEXT DEFAULT 'medicamento' CHECK (tipo_receita IN ('medicamento', 'racao', 'suplemento'));
ALTER TABLE public.receitas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'cancelada'));

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bonificacoes_empresa ON bonificacoes_veterinario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_bonificacoes_veterinario ON bonificacoes_veterinario(veterinario_id);
CREATE INDEX IF NOT EXISTS idx_dados_nutricionais_produto ON dados_nutricionais(produto_id);
CREATE INDEX IF NOT EXISTS idx_desempenho_fazenda ON desempenho_alimentos(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_desempenho_produto ON desempenho_alimentos(produto_id);
CREATE INDEX IF NOT EXISTS idx_tutores_org ON tutores(org_id);
CREATE INDEX IF NOT EXISTS idx_receita_itens_receita ON receita_itens(receita_id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.bonificacoes_veterinario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_nutricionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes_diagnostico_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receita_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desempenho_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartao_vacinacao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para as novas tabelas
CREATE POLICY "Org isolation policy" ON public.bonificacoes_veterinario
  FOR ALL USING (empresa_id = get_current_user_org_id() OR veterinario_id IN (
    SELECT id FROM users WHERE org_id = get_current_user_org_id()
  ));

CREATE POLICY "Org isolation policy" ON public.dados_nutricionais
  FOR ALL USING (produto_id IN (
    SELECT id FROM produtos WHERE org_id = get_current_user_org_id()
  ));

CREATE POLICY "Org isolation policy" ON public.tutores
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.sugestoes_diagnostico_ia
  FOR ALL USING (animal_id IN (
    SELECT id FROM animais WHERE org_id = get_current_user_org_id()
  ));

CREATE POLICY "Org isolation policy" ON public.receita_itens
  FOR ALL USING (receita_id IN (
    SELECT id FROM receitas WHERE org_id = get_current_user_org_id()
  ));

CREATE POLICY "Org isolation policy" ON public.desempenho_alimentos
  FOR ALL USING (fazenda_id = get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.cartao_vacinacao
  FOR ALL USING (org_id = get_current_user_org_id());

-- Atualizar enum de roles para incluir veterinário de fazenda
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'veterinario_fazenda';

-- Função para calcular métricas de desempenho
CREATE OR REPLACE FUNCTION public.calcular_metricas_desempenho_produto(produto_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  resultado JSONB;
BEGIN
  SELECT jsonb_build_object(
    'ganho_peso_medio', COALESCE(AVG(ganho_peso_dia), 0),
    'conversao_alimentar_media', COALESCE(AVG(conversao_alimentar), 0),
    'total_fazendas_usando', COUNT(DISTINCT fazenda_id),
    'total_animais', COUNT(DISTINCT animal_id),
    'periodo_medio_uso', COALESCE(AVG(periodo_dias), 0)
  ) INTO resultado
  FROM desempenho_alimentos
  WHERE produto_id = produto_uuid
    AND data_fim IS NOT NULL;
  
  RETURN resultado;
END;
$$;
