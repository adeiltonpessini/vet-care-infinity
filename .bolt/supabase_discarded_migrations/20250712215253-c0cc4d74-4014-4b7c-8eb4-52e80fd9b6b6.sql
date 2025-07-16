-- Criar o novo enum com tipos mais específicos para empresas de alimento/medicamento
CREATE TYPE organization_type_new AS ENUM ('clinica_veterinaria', 'empresa_alimentos', 'empresa_medicamentos', 'fazenda');

-- Adicionar coluna temporária com o novo tipo
ALTER TABLE organizations ADD COLUMN type_new organization_type_new;

-- Migrar os dados
UPDATE organizations SET type_new = 
  CASE 
    WHEN type = 'clinica' THEN 'clinica_veterinaria'::organization_type_new
    WHEN type = 'empresa' THEN 'empresa_alimentos'::organization_type_new
    WHEN type = 'fazenda' THEN 'fazenda'::organization_type_new
    ELSE 'clinica_veterinaria'::organization_type_new
  END;

-- Remover a coluna antiga e renomear a nova
ALTER TABLE organizations DROP COLUMN type;
ALTER TABLE organizations RENAME COLUMN type_new TO type;
ALTER TABLE organizations ALTER COLUMN type SET NOT NULL;

-- Remover o enum antigo e renomear o novo
DROP TYPE organization_type;
ALTER TYPE organization_type_new RENAME TO organization_type;

-- Criar o novo enum para user_role
CREATE TYPE user_role_new AS ENUM ('superadmin', 'admin', 'veterinario', 'colaborador', 'vendedor', 'gerente_produto');

-- Adicionar coluna temporária
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