-- InfinityVet Multi-tenant Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE public.organization_type AS ENUM ('clinica', 'empresa', 'fazenda');
CREATE TYPE public.user_role AS ENUM ('superadmin', 'admin', 'vet', 'empresa', 'fazendeiro', 'colaborador');
CREATE TYPE public.plano_type AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.animal_especie AS ENUM ('canino', 'felino', 'bovino', 'suino', 'equino', 'ovino', 'caprino', 'aves', 'outros');
CREATE TYPE public.diagnostico_tipo AS ENUM ('clinico', 'laboratorial', 'imagem', 'ia');
CREATE TYPE public.evento_tipo AS ENUM ('parto', 'inseminacao', 'doenca', 'morte', 'vacinacao', 'tratamento');
CREATE TYPE public.produto_tipo AS ENUM ('racao', 'suplemento', 'medicamento', 'vacina', 'equipamento');

-- Organizations table (multi-tenant core)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type organization_type NOT NULL,
  plano plano_type NOT NULL DEFAULT 'free',
  limite_animais INTEGER NOT NULL DEFAULT 10,
  limite_funcionarios INTEGER NOT NULL DEFAULT 2,
  limite_produtos INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced users table with org_id
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'colaborador',
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auth_user_id),
  UNIQUE(org_id, email)
);

-- Planos table
CREATE TABLE public.planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  limite_animais INTEGER NOT NULL,
  limite_funcionarios INTEGER NOT NULL,
  limite_produtos INTEGER NOT NULL,
  mensalidade DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Usage metrics table
CREATE TABLE public.organizacao_metrica_uso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  total_animais INTEGER DEFAULT 0,
  total_funcionarios INTEGER DEFAULT 0,
  total_produtos INTEGER DEFAULT 0,
  ultimo_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Animals table (shared by clinicas and fazendas)
CREATE TABLE public.animais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  lote_id UUID, -- For fazendas
  nome TEXT NOT NULL,
  especie animal_especie NOT NULL,
  raca TEXT,
  peso DECIMAL(8,2),
  data_nascimento DATE,
  cpf_tutor TEXT, -- For clinicas
  nome_tutor TEXT, -- For clinicas
  qr_code_url TEXT,
  foto_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lotes table (fazendas only)
CREATE TABLE public.lotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  finalidade TEXT,
  data_inicio DATE NOT NULL,
  quantidade_animais INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Diagnosticos table
CREATE TABLE public.diagnosticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
  veterinario_id UUID REFERENCES public.users(id),
  tipo diagnostico_tipo NOT NULL,
  modo TEXT,
  confianca_ia DECIMAL(5,2), -- For IA diagnostics
  descricao TEXT NOT NULL,
  recomendacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Receitas table
CREATE TABLE public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
  veterinario_id UUID REFERENCES public.users(id),
  medicamento TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  duracao_dias INTEGER,
  observacoes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos table (empresas)
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo produto_tipo NOT NULL,
  composicao TEXT,
  modo_uso TEXT,
  preco_kg DECIMAL(10,2),
  especie_alvo animal_especie[],
  fase_alvo TEXT[],
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indicações de produtos
CREATE TABLE public.indicacoes_produto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  veterinario_id UUID REFERENCES public.users(id),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fórmulas manipuladas
CREATE TABLE public.formulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ingredientes_json JSONB,
  custo_estimado DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Estoque (clinicas e fazendas)
CREATE TABLE public.estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- categoria, medicamento, racao, etc
  categoria TEXT,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidade TEXT DEFAULT 'kg',
  validade DATE,
  alerta_minimo DECIMAL(10,2) DEFAULT 0,
  entrada DECIMAL(10,2) DEFAULT 0,
  saida DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vacinações
CREATE TABLE public.vacinacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
  vacina TEXT NOT NULL,
  data_aplicacao DATE NOT NULL,
  reforco_previsto DATE,
  veterinario_id UUID REFERENCES public.users(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Eventos zootécnicos
CREATE TABLE public.eventos_zootecnicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animais(id) ON DELETE CASCADE,
  tipo_evento evento_tipo NOT NULL,
  data_evento DATE NOT NULL,
  observacoes TEXT,
  dados_json JSONB, -- Flexible data storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizacao_metrica_uso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicacoes_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacinacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_zootecnicos ENABLE ROW LEVEL SECURITY;

-- Security definer function to get current user's org_id
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.users WHERE auth_user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Security definer function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for multi-tenant access

-- Organizations: Users can only see their own org, superadmins see all
CREATE POLICY "Users can view their organization" ON public.organizations
FOR SELECT USING (
  id = public.get_current_user_org_id() OR public.get_current_user_role() = 'superadmin'
);

CREATE POLICY "Admins can update their organization" ON public.organizations
FOR UPDATE USING (
  id = public.get_current_user_org_id() AND public.get_current_user_role() IN ('admin', 'superadmin')
);

-- Users: Can view users in same org
CREATE POLICY "Users can view org members" ON public.users
FOR SELECT USING (
  org_id = public.get_current_user_org_id() OR public.get_current_user_role() = 'superadmin'
);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage org users" ON public.users
FOR ALL USING (
  org_id = public.get_current_user_org_id() AND public.get_current_user_role() IN ('admin', 'superadmin')
);

-- Generic org-based policy for most tables
CREATE POLICY "Org isolation policy" ON public.animais
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.lotes
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.diagnosticos
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.receitas
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.produtos
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.indicacoes_produto
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.formulas
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.estoque
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.vacinacoes
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.eventos_zootecnicos
FOR ALL USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Org isolation policy" ON public.organizacao_metrica_uso
FOR ALL USING (org_id = public.get_current_user_org_id());

-- Planos are public read for all authenticated users
CREATE POLICY "Authenticated users can view planos" ON public.planos
FOR SELECT TO authenticated USING (true);

-- Trigger to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- This will be updated when user joins an organization
  -- For now, we'll create the user without an org_id
  INSERT INTO public.users (auth_user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables with updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animais_updated_at
  BEFORE UPDATE ON public.animais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estoque_updated_at
  BEFORE UPDATE ON public.estoque
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default planos
INSERT INTO public.planos (nome, limite_animais, limite_funcionarios, limite_produtos, mensalidade) VALUES
('Free', 10, 2, 5, 0.00),
('Pro', 100, 10, 50, 99.90),
('Enterprise', 1000, 50, 500, 299.90);

-- Add foreign key constraint for lote_id in animais table
ALTER TABLE public.animais ADD CONSTRAINT fk_animais_lote_id 
FOREIGN KEY (lote_id) REFERENCES public.lotes(id) ON DELETE SET NULL;