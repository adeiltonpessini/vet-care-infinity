-- Primeiro, vamos remover as políticas que dependem da função get_current_user_role
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view org members" ON users;
DROP POLICY IF EXISTS "Admins can manage org users" ON users;

-- Remover a função que usa o enum antigo
DROP FUNCTION IF EXISTS get_current_user_role();

-- Adicionar coluna temporária para user_role
ALTER TABLE users ADD COLUMN role_new user_role_new;

-- Migrar os dados dos roles
UPDATE users SET role_new = 
  CASE 
    WHEN role = 'vet' THEN 'veterinario'::user_role_new
    WHEN role = 'empresa' THEN 'vendedor'::user_role_new
    WHEN role = 'fazendeiro' THEN 'colaborador'::user_role_new
    WHEN role = 'admin' THEN 'admin'::user_role_new
    WHEN role = 'superadmin' THEN 'superadmin'::user_role_new
    ELSE 'colaborador'::user_role_new
  END;

-- Remover a coluna antiga e renomear a nova
ALTER TABLE users DROP COLUMN role;
ALTER TABLE users RENAME COLUMN role_new TO role;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'colaborador'::user_role_new;

-- Remover o enum antigo e renomear o novo
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Recriar a função get_current_user_role com o novo enum
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid();
$function$;

-- Recriar as políticas
CREATE POLICY "Users can view their organization" 
ON public.organizations 
FOR SELECT 
USING ((id = get_current_user_org_id()) OR (get_current_user_role() = 'superadmin'::user_role));

CREATE POLICY "Admins can update their organization" 
ON public.organizations 
FOR UPDATE 
USING ((id = get_current_user_org_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])));

CREATE POLICY "Users can view org members" 
ON public.users 
FOR SELECT 
USING ((org_id = get_current_user_org_id()) OR (get_current_user_role() = 'superadmin'::user_role));

CREATE POLICY "Admins can manage org users" 
ON public.users 
FOR ALL 
USING ((org_id = get_current_user_org_id()) AND (get_current_user_role() = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])));