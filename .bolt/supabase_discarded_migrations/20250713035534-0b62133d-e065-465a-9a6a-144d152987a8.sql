-- Criar organizações de teste
INSERT INTO public.organizations (id, name, type, plano, limite_animais, limite_funcionarios, limite_produtos) VALUES 
('11111111-1111-1111-1111-111111111111', 'Clínica VetDemo', 'clinica_veterinaria', 'pro', 100, 10, 50),
('22222222-2222-2222-2222-222222222222', 'Empresa Demo Produtos', 'empresa_alimentos', 'enterprise', 1000, 20, 500),
('33333333-3333-3333-3333-333333333333', 'Fazenda Demo Agro', 'fazenda', 'pro', 500, 15, 100);

-- Inserir usuários de teste
INSERT INTO public.users (id, auth_user_id, org_id, role, nome, email, telefone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, '11111111-1111-1111-1111-111111111111', 'admin', 'Dr. Veterinário Demo', 'vetdemo@infinityvet.app', '(11) 99999-1111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, '22222222-2222-2222-2222-222222222222', 'admin', 'Gestor Empresa Demo', 'empresa@infinityvet.app', '(11) 99999-2222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, '33333333-3333-3333-3333-333333333333', 'admin', 'Fazendeiro Demo', 'fazenda@infinityvet.app', '(11) 99999-3333');

-- Dados de exemplo para Clínica Veterinária
INSERT INTO public.animais (id, org_id, nome, especie, raca, peso, data_nascimento, nome_tutor, cpf_tutor, observacoes) VALUES
('animal01-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Rex', 'canino', 'Pastor Alemão', 35.5, '2020-05-15', 'João Silva', '123.456.789-00', 'Animal muito dócil'),
('animal02-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Mimi', 'felino', 'Persa', 4.2, '2019-08-20', 'Maria Santos', '987.654.321-00', 'Gata castrada'),
('animal03-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Thor', 'canino', 'Golden Retriever', 28.0, '2021-03-10', 'Pedro Costa', '456.789.123-00', 'Ativo e brincalhão');

-- Estoque para Clínica
INSERT INTO public.estoque (id, org_id, nome, tipo, categoria, quantidade, unidade, alerta_minimo, validade) VALUES
('estoque1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Ração Premium Adulto', 'racao', 'Alimentação', 50, 'kg', 10, '2025-12-31'),
('estoque2-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Vacina Antirrábica', 'vacina', 'Imunização', 25, 'doses', 5, '2025-06-30'),
('estoque3-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Antibiótico Amoxicilina', 'medicamento', 'Medicamento', 8, 'caixas', 10, '2025-08-15');

-- Diagnósticos de exemplo
INSERT INTO public.diagnosticos (id, org_id, animal_id, veterinario_id, tipo, descricao, recomendacoes, confianca_ia) VALUES
('diag1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'animal01-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'clinico', 'Otite externa bilateral', 'Limpeza auricular diária e antibiótico tópico por 7 dias', NULL),
('diag2-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'animal02-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ia', 'Possível conjuntivite', 'Consulta presencial recomendada para confirmação', 0.85);

-- Produtos para Empresa
INSERT INTO public.produtos (id, org_id, nome, tipo, composicao, especie_alvo, fase_alvo, preco_kg, modo_uso) VALUES
('prod1-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Ração Super Premium Filhotes', 'racao', 'Frango, arroz, vitaminas A, D3, E', ARRAY['canino'], ARRAY['filhote'], 25.90, 'Servir 3x ao dia conforme peso do animal'),
('prod2-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Suplemento Vitamínico', 'suplemento', 'Complexo B, Vitamina C, Ferro, Zinco', ARRAY['canino', 'felino'], ARRAY['adulto', 'idoso'], 45.00, '1 comprimido ao dia'),
('prod3-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Antiparasitário Oral', 'medicamento', 'Praziquantel 50mg', ARRAY['canino'], ARRAY['adulto'], 12.50, 'Conforme peso, consultar veterinário');

-- Lotes para Fazenda
INSERT INTO public.lotes (id, org_id, nome, data_inicio, finalidade, quantidade_animais, status) VALUES
('lote1-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Lote Bovinos 2024-A', '2024-01-15', 'Engorda', 50, 'ativo'),
('lote2-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Lote Suínos Reprodução', '2024-02-01', 'Reprodução', 20, 'ativo');

-- Animais da Fazenda
INSERT INTO public.animais (id, org_id, lote_id, nome, especie, raca, peso, data_nascimento, observacoes) VALUES
('fazenda1-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'lote1-3333-3333-3333-333333333333', 'Boi 001', 'bovino', 'Nelore', 450.0, '2022-03-15', 'Animal líder do lote'),
('fazenda2-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'lote1-3333-3333-3333-333333333333', 'Boi 002', 'bovino', 'Angus', 420.0, '2022-04-20', 'Boa conversão alimentar'),
('fazenda3-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'lote2-3333-3333-3333-333333333333', 'Porca 001', 'suino', 'Landrace', 180.0, '2021-06-10', 'Matriz reprodutiva');

-- Vacinações da Fazenda
INSERT INTO public.vacinacoes (id, org_id, animal_id, veterinario_id, vacina, data_aplicacao, reforco_previsto, observacoes) VALUES
('vac1-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'fazenda1-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Febre Aftosa', '2024-01-20', '2024-07-20', 'Primeira dose do ano'),
('vac2-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'fazenda2-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Brucelose', '2024-02-15', '2025-02-15', 'Vacinação anual'),
('vac3-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'fazenda3-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Parvovirose', '2024-01-10', '2024-04-10', 'Reforço em 3 meses');

-- Eventos Zootécnicos
INSERT INTO public.eventos_zootecnicos (id, org_id, animal_id, tipo_evento, data_evento, observacoes, dados_json) VALUES
('evento1-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'fazenda3-3333-3333-3333-333333333333', 'parto', '2024-03-15', 'Parto natural, 8 leitões nascidos', '{"leitoes": 8, "peso_medio": 1.2, "mortalidade": 0}'),
('evento2-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'fazenda1-3333-3333-3333-333333333333', 'tratamento', '2024-02-20', 'Tratamento preventivo carrapatos', '{"medicamento": "Ivermectina", "dosagem": "1ml/50kg"}');

-- Receitas da Clínica
INSERT INTO public.receitas (id, org_id, animal_id, veterinario_id, medicamento, dosagem, duracao_dias, observacoes) VALUES
('rec1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'animal01-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Amoxicilina 250mg', '1 comprimido 2x ao dia', 7, 'Administrar com alimento'),
('rec2-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'animal02-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Colírio Antibiótico', '2 gotas 3x ao dia', 5, 'Aplicar no olho afetado');

-- Indicações de Produtos
INSERT INTO public.indicacoes_produto (id, org_id, animal_id, produto_id, veterinario_id) VALUES
('ind1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'animal01-1111-1111-1111-111111111111', 'prod1-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('ind2-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'animal02-1111-1111-1111-111111111111', 'prod2-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Fórmulas da Clínica
INSERT INTO public.formulas (id, org_id, nome, ingredientes_json, custo_estimado) VALUES
('form1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Xarope Expectorante Pet', '{"mel": "50ml", "própolis": "10ml", "água": "100ml", "conservante": "2ml"}', 25.00),
('form2-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pomada Cicatrizante', '{"lanolina": "30g", "óxido_zinco": "5g", "vitamina_e": "2ml"}', 18.50);

-- Métricas de uso das organizações
INSERT INTO public.organizacao_metrica_uso (id, org_id, total_animais, total_funcionarios, total_produtos) VALUES
('metric1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 3, 2, 15),
('metric2-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 0, 3, 3),
('metric3-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 3, 4, 0);