# InfinityVet — Documentação Completa

Este repositório contém o código-fonte do aplicativo web InfinityVet, um sistema de gestão veterinária multi‑tenant com áreas para Fazenda, Veterinário, Empresa e Admin/SuperAdmin. O app é construído com React, Vite, Tailwind CSS, TypeScript e shadcn‑ui, com backend e autenticação via Supabase.

- Tecnologias: React 18, Vite, TypeScript, Tailwind, shadcn‑ui, React Router, Radix UI, TanStack Query (instalado), Supabase JS.
- Deploy: via Lovable (Publish), com suporte a domínio customizado.

Sumário
- Estrutura de Pastas
- Fluxo de Navegação e Rotas
- Funcionalidades por Área (Features)
- Componentes e Layout
- Hooks
- Integrações (Supabase)
- UI Library (shadcn‑ui)
- Estilos e Design System
- SEO
- Como rodar localmente
- Build e Deploy
- Armazenamento (Storage)
- Boas práticas e convenções


1) Estrutura de Pastas

Raiz
- index.html — HTML raiz do Vite. Inclui viewport meta, base para SPA.
- vite.config.ts — Configuração Vite.
- tailwind.config.ts — Configuração Tailwind e tokens do design system.
- src/ — Código-fonte do app.
- public/ — Recursos públicos (favicon, robots.txt, etc.).
- supabase/ — Config do projeto Supabase (config.toml).
- capacitor.config.ts — Configuração para Capacitor (Android/iOS opcional).

src/
- main.tsx — Bootstrap do React + Router + estilos globais.
- index.css — Estilos globais, tokens semânticos (HSL), utilitários Tailwind.
- App.tsx, App.css — Composição raiz da aplicação, layout geral.
- assets/
  - infinityvet-hero.jpg — Imagem usada em hero/landing.
- components/
  - layout/
    - Header.tsx — Cabeçalho global; inclui ícone de notificações com alertas (estoque baixo, itens vencendo e vacinas a vencer), contadores e mensagens. Acessos rápidos a áreas.
    - AppSidebar.tsx — Sidebar de navegação (shadcn sidebar). Ícones, rotas por perfil, colapsável.
    - DashboardLayout.tsx — Layout base para dashboards; organiza grid responsiva, header secundário e conteúdo principal.
  - shared/
    - DataCard.tsx — Cartão de dados/KPI com título, valor, ícone, variações.
    - PageHeader.tsx — Cabeçalho de página com título, descrição e ações.
    - QRCodeScanner.tsx — Componente para escanear QR Codes (biblioteca @zxing/library), com callback para resultados.
    - StatsGrid.tsx — Grid responsiva de estatísticas; aceita children cards.
  - superadmin/
    - SuperAdminDesign.tsx — Customização de tema global/branding.
    - SuperAdminIntegrations.tsx — Gerência de integrações externas (ex.: WhatsApp, Pagamento, IA Diagnóstico).
    - SuperAdminLogs.tsx — Visualização de logs/auditoria.
    - SuperAdminOrganizations.tsx — Gestão de organizações.
    - SuperAdminPlans.tsx — Gestão de planos.
    - SuperAdminUsers.tsx — Gestão de usuários.
  - ui/ — Componentes shadcn‑ui personalizados (accordion, alert, badge, button, calendar, card, dialog, dropdown-menu, input, label, popover, radio-group, select, separator, sheet, sidebar, skeleton, switch, table, tabs, textarea, toast, toaster, tooltip, sonner). Servem como base de UI padronizada.
- hooks/
  - use-mobile.tsx — Hook utilitário para detectar e lidar com viewport móvel.
  - use-toast.ts — Hook do sistema de toasts (shadcn) para feedback ao usuário.
  - useGlobalConfig.tsx — Acesso/gestão de configurações globais (tema/branding) da aplicação.
- lib/
  - utils.ts — Utilitários (cn/classnames, helpers diversos).
- integrations/
  - supabase/
    - client.ts — Cliente do Supabase configurado (URL e anon key do projeto).
    - types.ts — Tipagens geradas do banco (read‑only, não editar).
- pages/ — Páginas de rota (React Router)
  - Index.tsx — Landing/entrada.
  - Auth.tsx — Autenticação (tela de login/fluxo de sessão via Supabase).
  - Onboarding.tsx — Onboarding inicial.
  - Dashboard.tsx — Dashboard geral (visão resumida global quando aplicável).
  - Animals.tsx — Listagem/gestão de animais (visão geral fora de áreas específicas).
  - Diagnostics.tsx — Diagnósticos (visão geral).
  - Events.tsx — Eventos (visão geral).
  - Formulas.tsx — Fórmulas (visão geral).
  - Help.tsx — Ajuda/FAQ.
  - Indicators.tsx — Indicadores gerais.
  - Inventory.tsx — Inventário geral.
  - Lotes.tsx — Lotes gerais.
  - Metrics.tsx — Métricas gerais.
  - NewAnimal.tsx — Cadastro de novo animal (global).
  - NotFound.tsx — 404.
  - Prescriptions.tsx — Receitas/Prescrições gerais.
  - Products.tsx — Produtos gerais.
  - Reports.tsx — Relatórios.
  - Settings.tsx — Configurações da conta/app.
  - SuperAdmin.tsx — Console SuperAdmin (agrega os módulos superadmin/* acima).
  - Team.tsx — Equipe geral.
  - Vaccinations.tsx — Vacinações gerais.
  - admin/
    - AdminAnalytics.tsx — Métricas analíticas admin (organizações, uso, etc.).
    - AdminOrganizations.tsx — Gestão de organizações (nível admin).
    - AdminUsers.tsx — Gestão de usuários (nível admin).
  - empresa/
    - EmpresaBonificacoes.tsx — Bonificações e incentivos.
    - EmpresaMetrics.tsx — Métricas da empresa (KPIs, funil, adoção etc.).
    - EmpresaProducts.tsx — Gestão de produtos.
    - EmpresaTeam.tsx — Equipe da empresa.
  - fazenda/
    - CartaoVacinacao.tsx — Cartão de vacinação dos animais (histórico e agendamentos).
    - FazendaAnimais.tsx — Animais da fazenda (listagem/gestão por organização).
    - FazendaCadastroAnimal.tsx — Cadastro de animal na fazenda.
    - FazendaDashboard.tsx — Dashboard geral da fazenda: KPIs (lotes, animais, vacinas a vencer em 30 dias, eventos dos últimos 7 dias), eventos recentes, alertas de estoque/validade, performance por lote. Integra dados do Supabase.
    - FazendaDesempenho.tsx — Desempenho zootécnico (ganho de peso, conversão alimentar etc.).
    - FazendaEstoque.tsx — Estoque (produtos, insumos) com alertas e validade.
    - FazendaEventos.tsx — Eventos zootécnicos (CRUD/listagem).
    - FazendaLotes.tsx — Lotes (CRUD/listagem e KPIs).
    - FazendaTeam.tsx — Equipe da fazenda.
    - FazendaVacinacao.tsx — Vacinação (cronograma, agendamentos, aplicações).
    - NovoDesempenho.tsx — Registro de novo desempenho.
    - NovoEvento.tsx — Registro de novo evento.
  - vet/
    - VetAnimals.tsx — Animais (visão do veterinário).
    - VetDashboard.tsx — Dashboard do veterinário.
    - VetDiagnostics.tsx — Diagnósticos veterinários.
    - VetFormulas.tsx — Fórmulas (protocolos, receitas modelos).
    - VetIndicacoes.tsx — Indicações de produto/tratamento.
    - VetIndicators.tsx — Indicadores.
    - VetInventory.tsx — Inventário sob gestão do vet.
    - VetPrescriptions.tsx — Prescrições veterinárias.
    - VetTeam.tsx — Equipe do vet.


2) Fluxo de Navegação e Rotas

- React Router DOM organiza as rotas para cada página em src/pages.
- Layouts: Header + Sidebar + DashboardLayout fornecem navegação principal, breadcrumbs simples e responsividade.
- Áreas por perfil: Fazenda (/fazenda/*), Vet (/vet/*), Empresa (/empresa/*), Admin (/admin/*), SuperAdmin (/superadmin).
- Padrões: Cada seção lista/edita suas entidades e mostra KPIs e estatísticas conforme o contexto.


3) Funcionalidades por Área (Features)

Comum/Global
- Autenticação (página Auth.tsx) com Supabase; sessão persistida; hooks de sessão.
- Notificações no Header: 
  - Itens de estoque baixos e produtos com validade a vencer (janela de 30 dias).
  - Vacinas com reforço/agendamento próximo (ex.: 7 dias) e contadores contextuais.
  - Mensagens resumidas e indicadores numéricos.
- QR Code Scanner: leitura via câmera para localizar animal/lote/registro.
- SEO aplicado às páginas principais (title, description, H1 único por página, semântica, lazy‑load de imagens, canonical tag quando apropriado).

Fazenda
- Dashboard (FazendaDashboard.tsx):
  - KPIs: Total de Lotes, Total de Animais, Vacinas a vencer em 30 dias, Eventos últimos 7 dias.
  - Eventos Recentes: lista resumida com data e tipo.
  - Alertas de Estoque/Validade: produtos próximos do vencimento e baixo estoque.
  - Performance por Lote: visão consolidada com métricas chave.
- Animais: CRUD/listagem, filtros por lote/espécie.
- Lotes: criação/gestão de lotes, métricas por lote.
- Vacinação: cronograma, registro de aplicações e reforços, cartão de vacinação por animal.
- Eventos Zootécnicos: registro de eventos (nascimento, pesagem, tratamento etc.).
- Desempenho: registro e análise (ganho de peso, conversão alimentar).
- Estoque: controle de itens, quantidades, validade, alertas.

Veterinário (Vet)
- Dashboard e indicadores gerais.
- Animais e prontuários.
- Diagnósticos e Prescrições.
- Fórmulas/protocolos.
- Inventário sob responsabilidade do vet.
- Equipe (perfis/colaboração).

Empresa
- Produtos: cadastro e gestão.
- Métricas: adoção, indicações, feedback.
- Bonificações: regras e concessões.
- Equipe: permissões e membros.

Admin/SuperAdmin
- Admin: organizações e usuários; métricas de adoção/uso.
- SuperAdmin: configurações globais (tema/cores, integrações), gestão de planos, organizações, usuários,
  e logs/auditoria de ações de alto nível.


4) Componentes e Layout

- Header: pesquisa/atalhos (quando aplicável), cloche de notificações com contadores e mensagens; acessos a perfis/áreas.
- AppSidebar: navegação com ícones por seção, colapsável; destaca rota ativa.
- DashboardLayout: estrutura padrão (header secundário, grid de KPIs, sections) para páginas de dashboard.
- DataCard/StatsGrid/PageHeader: building blocks reutilizáveis para consistência visual.
- QRCodeScanner: wrapper de câmera com callback de resultado, exibe overlay e feedback de leitura.


5) Hooks

- use-toast: dispara toasts (sucesso/erro/info) integrados ao shadcn Toaster.
- use-mobile: auxilia na responsividade (ex.: comportamentos específicos em telas menores).
- useGlobalConfig: acessa/atualiza configurações globais (cores, fonte, logo, modo de cor) quando habilitado.


6) Integrações (Supabase)

Cliente
- src/integrations/supabase/client.ts
  - Configura o cliente com URL e anon key do projeto: bhtujlbcuoiikghwceuy.
  - Persistência de sessão no localStorage; auto refresh de token.

Funções SQL disponíveis (lado banco)
- is_superadmin(user_email text) → boolean
- get_current_user_org_id() → uuid
- get_current_user_role() → user_role
- get_current_user_id() → uuid
- update_updated_at_column() → trigger (atualiza updated_at)
- handle_new_user() → trigger (cria registro em public.users no signup)
- log_superadmin_action(admin_user_id, action, target_type, target_id, details) → uuid (auditoria)
- calcular_metricas_desempenho_produto(produto_uuid uuid) → jsonb (métricas agregadas)

Segurança
- RLS (Row Level Security) habilitado nas tabelas do domínio (ver projeto Supabase).
- Políticas baseadas em organização do usuário e role (superadmin/admin/veterinario/colaborador/vendedor/gerente_produto).

Storage
- Buckets: produtos (público), animais (público).


7) UI Library (shadcn‑ui)

- Componentes em src/components/ui foram adaptados ao design system (tokens HSL) e Tipografia/Tema.
- Toaster/Toast integrados; use import de hooks a partir de src/hooks/use-toast.
- Sidebar (shadcn) com colapso, ícones e destaque de rota; manter um trigger global no header.


8) Estilos e Design System

- index.css e tailwind.config.ts definem tokens semânticos (cores HSL, gradientes, sombras, animações) e variáveis reutilizáveis.
- Não usar cores diretas em componentes; utilizar tokens do design system.
- Responsividade garantida por Tailwind; dark/light mode conforme tokens e configurações globais.


9) SEO

- Páginas principais configuradas com:
  - Title e Meta description concisos, com palavra‑chave.
  - H1 único por página, refletindo a intenção da página.
  - HTML semântico (header, main, section, article, nav, aside quando aplicável).
  - Imagens com alt descritivo; lazy‑load quando não críticas.
  - Canonical quando necessário para evitar duplicidade.
  - Mobile‑first, viewport configurado.


10) Como rodar localmente

Pré‑requisitos
- Node.js LTS e npm.

Passos
- npm i
- npm run dev
- Abrir http://localhost:5173

Observações
- O projeto usa o Supabase já configurado no client.ts. Para outro projeto, ajuste URL e anon key.


11) Build e Deploy

- Build: npm run build
- Preview local do build: npm run preview
- Deploy: via Lovable (Publish) e configuração de domínio customizado nas Settings do projeto.


12) Armazenamento (Storage)

- Buckets públicos para imagens/arquivos de produtos e animais.
- Regras/políticas de leitura/escrita definidas no Supabase (ver console do projeto para políticas atualizadas).


13) Boas práticas e convenções

- Componentes pequenos e focados; reutilizar shared/ui.
- Evitar lógica de negócios dentro de componentes de UI; preferir hooks/services.
- Usar toasts para feedbacks importantes.
- Manter semântica HTML e acessibilidade (aria‑labels, foco, contraste).
- Nunca usar VITE_* em código; usar constantes explícitas (conforme client.ts).
- Para novas páginas, seguir padrão: PageHeader + Stats/DataCards + sections semânticas.


Anexos e Referências
- Docs Lovable: https://docs.lovable.dev/
- Supabase Dashboard (SQL/Policies/Storage): usar o project id bhtujlbcuoiikghwceuy
- Bibliotecas principais: React, React Router, Tailwind, shadcn‑ui, Supabase JS, Radix UI.
