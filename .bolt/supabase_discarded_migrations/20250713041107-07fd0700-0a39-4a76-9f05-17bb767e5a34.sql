-- Criar as contas de teste conforme especificado

-- 1. Criar organizações de teste
INSERT INTO public.organizations (id, name, type, plano, limite_animais, limite_funcionarios, limite_produtos) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Clínica Vet Demo', 'clinica_veterinaria', 'pro', 100, 10, 50),
('550e8400-e29b-41d4-a716-446655440001', 'Empresa Alimentos Demo', 'empresa_alimentos', 'enterprise', 500, 25, 100),
('550e8400-e29b-41d4-a716-446655440002', 'Fazenda Demo', 'fazenda', 'pro', 1000, 15, 200);

-- 2. Criar usuários de teste
INSERT INTO public.users (id, auth_user_id, org_id, role, nome, email) VALUES
-- Vet Demo
('650e8400-e29b-41d4-a716-446655440000', null, '550e8400-e29b-41d4-a716-446655440000', 'veterinario', 'Dr. Veterinário Demo', 'vetdemo@infinityvet.app'),
-- Empresa Demo  
('650e8400-e29b-41d4-a716-446655440001', null, '550e8400-e29b-41d4-a716-446655440001', 'gerente_produto', 'Gerente Empresa Demo', 'empresa@infinityvet.app'),
-- Fazenda Demo
('650e8400-e29b-41d4-a716-446655440002', null, '550e8400-e29b-41d4-a716-446655440002', 'admin', 'Fazendeiro Demo', 'fazenda@infinityvet.app');

-- 3. Criar alguns dados de exemplo para cada organização

-- Para Clínica Vet: animais, diagnósticos, receitas
INSERT INTO public.animais (id, org_id, nome, especie, raca, peso, data_nascimento, nome_tutor, cpf_tutor) VALUES
('750e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Rex', 'canino', 'Labrador', 25.5, '2020-03-15', 'João Silva', '12345678901'),
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Mimi', 'felino', 'Persa', 4.2, '2021-07-22', 'Maria Santos', '98765432100'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Bela', 'canino', 'Golden Retriever', 28.0, '2019-11-10', 'Carlos Pereira', '11122233344');

INSERT INTO public.diagnosticos (org_id, animal_id, veterinario_id, tipo, descricao, recomendacoes) VALUES
('550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'clinico', 'Displasia de quadril leve', 'Controle de peso e exercícios leves'),
('550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440000', 'clinico', 'Consulta de rotina', 'Animal saudável, manter cuidados habituais');

INSERT INTO public.receitas (org_id, animal_id, veterinario_id, medicamento, dosagem, duracao_dias, observacoes) VALUES
('550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440000', 'Carprofeno', '2mg/kg, 2x ao dia', 7, 'Administrar junto com alimento'),
('550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440000', 'Vitamina Complex', '1 comprimido ao dia', 30, 'Suplemento vitamínico');

-- Para Empresa: produtos
INSERT INTO public.produtos (org_id, nome, tipo, composicao, especie_alvo, fase_alvo, preco_kg) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ração Premium Cães Adultos', 'racao', 'Proteína 28%, Gordura 15%, Fibra 4%', ARRAY['canino'], ARRAY['adulto'], 8.50),
('550e8400-e29b-41d4-a716-446655440001', 'Suplemento Cálcio Plus', 'suplemento', 'Cálcio 40%, Fósforo 20%, Vitamina D3', ARRAY['canino','felino'], ARRAY['filhote','adulto'], 25.00),
('550e8400-e29b-41d4-a716-446655440001', 'Vermífugo Broad Spectrum', 'medicamento', 'Praziquantel 50mg, Pyrantel 144mg', ARRAY['canino','felino'], ARRAY['filhote','adulto','idoso'], 45.00);

-- Para Fazenda: lotes, animais, eventos
INSERT INTO public.lotes (id, org_id, nome, data_inicio, finalidade, quantidade_animais) VALUES
('850e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Lote A - Engorda', '2024-01-15', 'engorda', 50),
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Lote B - Reprodução', '2024-02-01', 'reproducao', 25);

INSERT INTO public.animais (id, org_id, lote_id, nome, especie, raca, peso, data_nascimento) VALUES
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440000', 'Boi 001', 'bovino', 'Nelore', 450.0, '2022-03-10'),
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440000', 'Boi 002', 'bovino', 'Angus', 420.0, '2022-04-15'),
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'Vaca 001', 'bovino', 'Nelore', 380.0, '2021-05-20');

INSERT INTO public.vacinacoes (org_id, animal_id, vacina, data_aplicacao, reforco_previsto) VALUES
('550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440010', 'Aftosa', '2024-06-15', '2024-12-15'),
('550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440011', 'Aftosa', '2024-06-15', '2024-12-15');

INSERT INTO public.eventos_zootecnicos (org_id, animal_id, tipo_evento, data_evento, observacoes) VALUES
('550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440012', 'inseminacao', '2024-06-20', 'Inseminação artificial bem sucedida'),
('550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440010', 'doenca', '2024-05-10', 'Tratamento para verminose concluído');

-- Criar estoque para todas organizações
INSERT INTO public.estoque (org_id, nome, tipo, categoria, quantidade, unidade, alerta_minimo) VALUES
-- Clínica Vet
('550e8400-e29b-41d4-a716-446655440000', 'Ração Terapêutica', 'racao', 'Alimentação', 15, 'kg', 5),
('550e8400-e29b-41d4-a716-446655440000', 'Antibiótico', 'medicamento', 'Medicamentos', 8, 'unidade', 3),
('550e8400-e29b-41d4-a716-446655440000', 'Vacina Múltipla', 'vacina', 'Prevenção', 25, 'dose', 10),
-- Fazenda
('550e8400-e29b-41d4-a716-446655440002', 'Sal Mineral', 'suplemento', 'Nutrição', 500, 'kg', 100),
('550e8400-e29b-41d4-a716-446655440002', 'Vacina Aftosa', 'vacina', 'Prevenção', 100, 'dose', 20),
('550e8400-e29b-41d4-a716-446655440002', 'Ração Concentrado', 'racao', 'Alimentação', 2000, 'kg', 300);

-- Criar métricas de uso
INSERT INTO public.organizacao_metrica_uso (org_id, total_animais, total_funcionarios, total_produtos) VALUES
('550e8400-e29b-41d4-a716-446655440000', 3, 1, 3),
('550e8400-e29b-41d4-a716-446655440001', 0, 1, 3),
('550e8400-e29b-41d4-a716-446655440002', 3, 1, 3);