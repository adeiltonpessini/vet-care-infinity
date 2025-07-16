-- Create global_config table for system-wide theming and branding
CREATE TABLE public.global_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color TEXT DEFAULT '#1A73E8',
  secondary_color TEXT DEFAULT '#6366f1',
  background_color TEXT DEFAULT '#ffffff',
  font TEXT DEFAULT 'Inter',
  logo_url TEXT,
  favicon_url TEXT,
  layout_mode TEXT CHECK (layout_mode IN ('light', 'dark', 'auto')) DEFAULT 'light',
  app_title TEXT DEFAULT 'InfinityVet',
  app_slogan TEXT DEFAULT 'Gestão Veterinária Inteligente',
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create external_integrations table for API management
CREATE TABLE public.external_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- ex: 'diagnostico_ia', 'whatsapp', 'pagamento'
  status BOOLEAN DEFAULT false,
  api_key TEXT,
  endpoint_url TEXT,
  config JSONB DEFAULT '{}',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create superadmin_logs table for audit trail
CREATE TABLE public.superadmin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'organization', 'user', 'config', etc.
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default global config
INSERT INTO public.global_config (id) VALUES (gen_random_uuid());

-- Insert default external integrations
INSERT INTO public.external_integrations (name, type, status) VALUES 
  ('OpenAI Diagnóstico', 'diagnostico_ia', false),
  ('WhatsApp Business', 'whatsapp', false),
  ('Stripe Pagamentos', 'pagamento', false),
  ('MercadoPago', 'pagamento', false);

-- Enable RLS on new tables
ALTER TABLE public.global_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmin_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for superadmin access only
CREATE POLICY "Superadmin full access on global_config" ON public.global_config
  FOR ALL USING (true);

CREATE POLICY "Superadmin full access on external_integrations" ON public.external_integrations
  FOR ALL USING (true);

CREATE POLICY "Superadmin full access on superadmin_logs" ON public.superadmin_logs
  FOR ALL USING (true);

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT user_email = 'adeilton.ata@gmail.com';
$$;

-- Create function to log superadmin actions
CREATE OR REPLACE FUNCTION public.log_superadmin_action(
  admin_user_id UUID,
  action TEXT,
  target_type TEXT,
  target_id UUID DEFAULT NULL,
  details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.superadmin_logs (
    admin_user_id,
    action,
    target_type,
    target_id,
    details
  ) VALUES (
    admin_user_id,
    action,
    target_type,
    target_id,
    details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create trigger for updated_at on global_config
CREATE TRIGGER update_global_config_updated_at
  BEFORE UPDATE ON public.global_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on external_integrations
CREATE TRIGGER update_external_integrations_updated_at
  BEFORE UPDATE ON public.external_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();