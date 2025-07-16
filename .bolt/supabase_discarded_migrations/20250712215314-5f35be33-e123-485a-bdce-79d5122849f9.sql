-- Primeiro, vamos criar os novos enums sem afetar os existentes
CREATE TYPE organization_type_new AS ENUM ('clinica_veterinaria', 'empresa_alimentos', 'empresa_medicamentos', 'fazenda');
CREATE TYPE user_role_new AS ENUM ('superadmin', 'admin', 'veterinario', 'colaborador', 'vendedor', 'gerente_produto');

-- Vamos fazer a migração por etapas, começando com organization_type
-- Adicionar coluna temporária
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

-- Agora remover o enum antigo e renomear o novo
DROP TYPE organization_type;
ALTER TYPE organization_type_new RENAME TO organization_type;