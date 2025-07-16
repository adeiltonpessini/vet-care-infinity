-- Primeiro, vamos remover o enum antigo e criar um novo mais específico
DROP TYPE IF EXISTS organization_type;

-- Criar o novo enum com tipos mais específicos para empresas de alimento/medicamento
CREATE TYPE organization_type AS ENUM ('clinica_veterinaria', 'empresa_alimentos', 'empresa_medicamentos', 'fazenda');

-- Atualizar a tabela organizations para usar o novo enum
ALTER TABLE organizations ALTER COLUMN type DROP DEFAULT;
ALTER TABLE organizations ALTER COLUMN type TYPE organization_type USING 
  CASE 
    WHEN type::text = 'clinica' THEN 'clinica_veterinaria'::organization_type
    WHEN type::text = 'empresa' THEN 'empresa_alimentos'::organization_type
    WHEN type::text = 'fazenda' THEN 'fazenda'::organization_type
    ELSE 'clinica_veterinaria'::organization_type
  END;

-- Atualizar user_role enum para incluir roles específicos para empresas
DROP TYPE IF EXISTS user_role;
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'veterinario', 'colaborador', 'vendedor', 'gerente_produto');

-- Atualizar coluna role na tabela users
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN role TYPE user_role USING 
  CASE 
    WHEN role::text = 'vet' THEN 'veterinario'::user_role
    WHEN role::text = 'empresa' THEN 'vendedor'::user_role
    WHEN role::text = 'fazendeiro' THEN 'colaborador'::user_role
    ELSE 'colaborador'::user_role
  END;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'colaborador'::user_role;