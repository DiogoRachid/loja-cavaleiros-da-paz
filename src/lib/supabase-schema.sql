-- =====================================================================
-- A.R.L.S. CAVALEIROS DA PAZ Nº 25 - Esquema completo (Supabase/PostgreSQL)
-- Execute este arquivo inteiro no SQL Editor do Supabase.
-- Todas as tabelas usam id UUID + created_date/updated_date automáticos.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Função e trigger genéricos para updated_date
-- ---------------------------------------------------------------------
create or replace function public.set_updated_date()
returns trigger as $$
begin
  new.updated_date = now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- 1. CADASTRO / ESTRUTURA DA LOJA
-- =====================================================================

create table if not exists public.dados_loja (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  numero text not null,
  potencia text,
  oriente text,
  endereco text,
  telefone text,
  email text,
  valor_mensalidade numeric(10,2),
  dia_reuniao text,
  hora_reuniao text,
  logo_url text,
  logo_potencia_url text,
  exercicio_atual text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

alter table public.dados_loja add column if not exists logo_potencia_url text;

create table if not exists public.irmao (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  numero_glp text not null unique,
  senha text,
  primeiro_acesso boolean not null default true,
  email text,
  telefone text,
  grau text check (grau in ('Aprendiz','Companheiro','Mestre')),
  cargo text not null default 'Nenhum',
  data_iniciacao date,
  data_elevacao date,
  data_exaltacao date,
  situacao text not null default 'Regular' check (situacao in ('Regular','Irregular','Suspenso','Afastado')),
  ativo boolean not null default true,
  foto_url text,
  profissao text,
  data_nascimento date,
  endereco text,
  observacoes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists irmao_ativo_idx on public.irmao (ativo);
create index if not exists irmao_grau_idx on public.irmao (grau);

create table if not exists public.quadro_oficiais (
  id uuid primary key default gen_random_uuid(),
  exercicio text not null,
  cargo text not null,
  titular_id uuid references public.irmao (id) on delete set null,
  titular_nome text,
  titular_cim text,
  substituto_id uuid references public.irmao (id) on delete set null,
  substituto_nome text,
  publicado boolean not null default false,
  data_publicacao date,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid,
  unique (exercicio, cargo)
);

create table if not exists public.autoridade (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  nome text not null,
  potencia text,
  cargo_potencia text,
  ordem_protocolar integer,
  email text,
  telefone text,
  ativa boolean not null default true,
  observacoes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.comissao (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null default 'Permanente' check (tipo in ('Permanente','Especial','Temporária')),
  descricao text,
  ativa boolean not null default true,
  data_criacao date,
  exercicio text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.membro_comissao (
  id uuid primary key default gen_random_uuid(),
  comissao_id uuid not null references public.comissao (id) on delete cascade,
  comissao_nome text,
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text,
  funcao text not null default 'Membro' check (funcao in ('Presidente','Secretário','Membro')),
  ativo boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

-- =====================================================================
-- 2. SESSÕES / PRESENÇAS / PROTOCOLO
-- =====================================================================

create table if not exists public.sessao (
  id uuid primary key default gen_random_uuid(),
  numero text,
  data date not null,
  hora text not null,
  tipo text not null check (tipo in ('Ordinária','Magna','Pública','Instrução','Fúnebre')),
  grau text not null default 'Aprendiz' check (grau in ('Aprendiz','Companheiro','Mestre')),
  pauta text,
  ata text,
  status text not null default 'Agendada' check (status in ('Agendada','Realizada','Cancelada')),
  local text,
  observacoes text,
  preparacao_json jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists sessao_data_idx on public.sessao (data desc);

create table if not exists public.presenca (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessao (id) on delete cascade,
  sessao_data text,
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text,
  irmao_cim text,
  presente boolean not null default false,
  dispensado boolean not null default false,
  justificativa text,
  justificativa_aceita boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid,
  unique (sessao_id, irmao_id)
);

create table if not exists public.ordem_entrada (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid references public.sessao (id) on delete cascade,
  sessao_data text,
  posicao integer not null,
  tipo_participante text not null check (tipo_participante in ('Autoridade','Oficial')),
  autoridade_id uuid references public.autoridade (id) on delete set null,
  autoridade_titulo text,
  autoridade_nome text,
  oficial_cargo text,
  oficial_nome text,
  presente boolean not null default false,
  confirmado boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.contato_hospitaleiro (
  id uuid primary key default gen_random_uuid(),
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text not null,
  faltas_consecutivas integer,
  status text not null default 'Pendente' check (status in ('Pendente','Contatado','Sem Contato')),
  descricao text,
  data_contato timestamptz,
  registrado_por text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

-- =====================================================================
-- 3. TESOURARIA
-- =====================================================================

create table if not exists public.centro_custo (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  ativo boolean not null default true,
  ordem integer,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.mensalidade (
  id uuid primary key default gen_random_uuid(),
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text,
  irmao_cim text,
  competencia text not null,
  valor_mensalidade numeric(10,2),
  valor numeric(10,2) not null,
  centros_custo jsonb not null default '{}'::jsonb,
  vencimento date not null,
  data_pagamento date,
  status text not null default 'Pendente' check (status in ('Pendente','Pago','Atrasado','Isento')),
  forma_pagamento text check (forma_pagamento in ('Dinheiro','PIX','Transferência','Outro')),
  observacoes text,
  registrado_por text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid,
  unique (irmao_id, competencia)
);
create index if not exists mensalidade_status_idx on public.mensalidade (status);

-- =====================================================================
-- 4. BIBLIOTECA (ACERVO FÍSICO E DIGITAL)
-- =====================================================================

create table if not exists public.bibliotecario (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  login text not null unique,
  senha text not null,
  ativo boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.item (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo text not null check (tipo in ('Livro','Revista','Periódico','Outro')),
  autor text,
  descricao text,
  data_publicacao date,
  grau_minimo text not null default 'Aprendiz' check (grau_minimo in ('Aprendiz','Companheiro','Mestre')),
  quantidade_total integer not null default 1,
  quantidade_disponivel integer not null default 1,
  quantidade_emprestada integer not null default 0,
  codigo_qr text unique,
  imagem_capa text,
  localizacao text,
  ativo boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.emprestimo (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.item (id) on delete cascade,
  item_nome text,
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text,
  irmao_email text,
  data_retirada date not null,
  data_prevista_devolucao date,
  data_devolucao date,
  status text not null default 'Ativo' check (status in ('Ativo','Devolvido','Atrasado')),
  tipo_operacao text check (tipo_operacao in ('QR Code','Manual')),
  observacoes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists emprestimo_status_idx on public.emprestimo (status);

create table if not exists public.acervo_digital (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text,
  tipo text not null check (tipo in ('Livro','Trabalho','Artigo','Instrução','Ritual','Outro')),
  descricao text,
  data_publicacao date,
  grau_minimo text not null default 'Aprendiz' check (grau_minimo in ('Aprendiz','Companheiro','Mestre')),
  arquivo_url text not null,
  capa_url text,
  ativo boolean not null default true,
  disponivel boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.avaliacao (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.item (id) on delete cascade,
  documento_id uuid references public.acervo_digital (id) on delete cascade,
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text,
  nota integer not null check (nota between 1 and 5),
  comentario text,
  data_avaliacao timestamptz not null default now(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.log_acesso (
  id uuid primary key default gen_random_uuid(),
  irmao_id uuid references public.irmao (id) on delete set null,
  irmao_nome text not null,
  irmao_numero_glp text,
  data_acesso timestamptz not null default now(),
  tipo_acesso text not null default 'Login' check (tipo_acesso in ('Login','Logout')),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.log_download (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid references public.acervo_digital (id) on delete set null,
  documento_titulo text not null,
  irmao_id uuid references public.irmao (id) on delete set null,
  irmao_nome text,
  irmao_numero_glp text,
  data_download timestamptz not null default now(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.sugestao_acervo (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text,
  tipo text not null check (tipo in ('Livro','Trabalho','Artigo','Instrução','Ritual','Outro')),
  descricao text,
  data_publicacao date,
  grau_minimo text not null default 'Aprendiz' check (grau_minimo in ('Aprendiz','Companheiro','Mestre')),
  arquivo_url text not null,
  capa_url text,
  irmao_id uuid references public.irmao (id) on delete set null,
  irmao_nome text,
  irmao_numero_glp text,
  status text not null default 'Pendente' check (status in ('Pendente','Aprovado','Reprovado','Em Revisão')),
  observacoes_revisao text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists sugestao_acervo_status_idx on public.sugestao_acervo (status);

-- =====================================================================
-- 5. HARMONIA (MP3, PASTAS, ROTEIROS, TEMPOS)
-- =====================================================================

create table if not exists public.minha_mp3 (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  artista text,
  file_url text not null,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.pasta_mp3 (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.pasta_musica (
  id uuid primary key default gen_random_uuid(),
  pasta_id uuid not null references public.pasta_mp3 (id) on delete cascade,
  mp3_id uuid not null references public.minha_mp3 (id) on delete cascade,
  ordem integer not null default 0,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid,
  unique (pasta_id, mp3_id)
);
create index if not exists pasta_musica_pasta_idx on public.pasta_musica (pasta_id, ordem);

create table if not exists public.config_etapa_harmonia (
  id uuid primary key default gen_random_uuid(),
  grau text not null check (grau in ('Aprendiz','Companheiro','Mestre')),
  tipo_sessao text not null check (tipo_sessao in ('Ordinária','Magna','Pública','Instrução','Fúnebre')),
  etapa_nome text not null,
  ordem integer not null default 0,
  playlist_id uuid references public.pasta_mp3 (id) on delete set null,
  playlist_name text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid,
  observacao text,
  unique (grau, tipo_sessao, etapa_nome)
);
alter table public.config_etapa_harmonia add column if not exists observacao text;

create table if not exists public.roteiro_harmonia (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessao (id) on delete cascade,
  sessao_data text,
  sessao_tipo text,
  grau text,
  etapas jsonb not null default '[]'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid,
  unique (sessao_id)
);

create table if not exists public.playlist_sessao (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessao (id) on delete cascade,
  sessao_data text,
  sessao_tipo text,
  spotify_playlist_id text not null,
  spotify_playlist_name text not null,
  spotify_playlist_image text,
  spotify_playlist_uri text,
  tracks_selecionadas jsonb,
  ordem integer not null default 0,
  notas text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);

create table if not exists public.tempo_etapa (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessao (id) on delete cascade,
  sessao_data text,
  sessao_tipo text,
  grau text,
  etapa_nome text not null,
  hora_inicio timestamptz not null,
  hora_fim timestamptz not null,
  duracao_segundos integer not null,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists tempo_etapa_sessao_idx on public.tempo_etapa (sessao_id);

-- =====================================================================
-- 5.1 TRABALHOS E INSTRUÇÕES (PORTAL DOS VIGILANTES)
-- =====================================================================

create table if not exists public.trabalho_irmao (
  id uuid primary key default gen_random_uuid(),
  irmao_id uuid not null references public.irmao (id) on delete cascade,
  irmao_nome text,
  grau text,
  tipo text not null default 'Instrução' check (tipo in ('Instrução','Trabalho','Peça de Arquitetura','Balaústre')),
  titulo text not null,
  sessao_id uuid references public.sessao (id) on delete set null,
  sessao_data text,
  data_apresentacao date,
  arquivo_url text,
  status text not null default 'Pendente' check (status in ('Pendente','Aprovado','Reprovado')),
  observacoes text,
  registrado_por text,
  avaliado_por text,
  data_avaliacao timestamptz,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists trabalho_irmao_irmao_idx on public.trabalho_irmao (irmao_id);
create index if not exists trabalho_irmao_status_idx on public.trabalho_irmao (status);

-- =====================================================================
-- 5.2 SECRETARIA (EXPEDIENTES E VISITANTES)
-- =====================================================================

create table if not exists public.expediente (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'Recebido' check (tipo in ('Recebido','Expedido')),
  classe text not null default 'Prancha',
  numero text,
  data date,
  remetente text,
  destinatario text,
  assunto text not null,
  conteudo text,
  arquivo_url text,
  sessao_id uuid references public.sessao (id) on delete set null,
  sessao_data text,
  status text not null default 'Pendente' check (status in ('Pendente','Lido','Respondido','Arquivado')),
  registrado_por text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists expediente_tipo_idx on public.expediente (tipo);
create index if not exists expediente_sessao_idx on public.expediente (sessao_id);

create table if not exists public.visitante_sessao (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessao (id) on delete cascade,
  sessao_data text,
  nome text not null,
  grau text,
  loja text,
  potencia text,
  cargo text,
  observacoes text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists visitante_sessao_sessao_idx on public.visitante_sessao (sessao_id);

-- =====================================================================
-- 5.3 ORADOR (PARECERES)
-- =====================================================================

create table if not exists public.parecer (
  id uuid primary key default gen_random_uuid(),
  tipo text not null default 'Expediente' check (tipo in ('Expediente','Trabalho','Proposta','Balaústre','Sindicância','Outro')),
  titulo text not null,
  referencia_id uuid,
  referencia_descricao text,
  sessao_id uuid references public.sessao (id) on delete set null,
  sessao_data text,
  teor text,
  conclusao text not null default 'Favorável' check (conclusao in ('Favorável','Contrário','Com ressalvas')),
  status text not null default 'Rascunho' check (status in ('Rascunho','Concluído','Lido em Sessão')),
  autor_nome text,
  data_parecer date,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists parecer_sessao_idx on public.parecer (sessao_id);
create index if not exists parecer_status_idx on public.parecer (status);

-- =====================================================================
-- 5.4 AÇÃO SOCIAL (PEDIDOS EXTERNOS DE AUXÍLIO E PARECERES)
-- =====================================================================

create table if not exists public.pedido_acao_social (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  solicitante text,
  tipo_auxilio text not null default 'Financeiro' check (tipo_auxilio in ('Financeiro','Arrecadação','Ajuda Externa','Outro')),
  descricao text,
  valor_solicitado numeric(10,2),
  arquivo_url text,
  expediente_id uuid references public.expediente (id) on delete set null,
  prancha_referencia text,
  grau text not null default 'Aprendiz' check (grau in ('Aprendiz','Companheiro','Mestre')),
  data_recebimento date,
  registrado_por text,
  status text not null default 'Pendente' check (status in ('Pendente','Em Análise','Parecer Emitido')),
  parecer_teor text,
  parecer_conclusao text check (parecer_conclusao in ('Favorável','Contrário','Com ressalvas')),
  parecer_valor_sugerido numeric(10,2),
  parecer_autor text,
  parecer_data date,
  leitura_status text not null default 'Pendente' check (leitura_status in ('Pendente','Lido','Não Constará')),
  sessao_leitura_id uuid references public.sessao (id) on delete set null,
  sessao_leitura_data text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  created_by_id uuid
);
create index if not exists pedido_acao_social_status_idx on public.pedido_acao_social (status);
create index if not exists pedido_acao_social_grau_idx on public.pedido_acao_social (grau, leitura_status);

-- =====================================================================
-- 6. TRIGGERS DE updated_date PARA TODAS AS TABELAS
-- =====================================================================
do $$
declare
  t text;
  tabelas text[] := array[
    'dados_loja','irmao','quadro_oficiais','autoridade','comissao','membro_comissao',
    'sessao','presenca','ordem_entrada','contato_hospitaleiro',
    'centro_custo','mensalidade',
    'bibliotecario','item','emprestimo','acervo_digital','avaliacao','log_acesso','log_download',
    'minha_mp3','pasta_mp3','pasta_musica','config_etapa_harmonia','roteiro_harmonia',
    'playlist_sessao','tempo_etapa','trabalho_irmao','expediente','visitante_sessao','sugestao_acervo','parecer','pedido_acao_social'
  ];
begin
  foreach t in array tabelas loop
    execute format('drop trigger if exists set_updated_date_%1$s on public.%1$I;', t);
    execute format(
      'create trigger set_updated_date_%1$s before update on public.%1$I
       for each row execute function public.set_updated_date();', t);
  end loop;
end $$;

-- =====================================================================
-- 7. ROW LEVEL SECURITY (habilitada; ajuste as políticas conforme o uso)
-- Padrão: leitura/escrita apenas para usuários autenticados.
-- =====================================================================
do $$
declare
  t text;
  tabelas text[] := array[
    'dados_loja','irmao','quadro_oficiais','autoridade','comissao','membro_comissao',
    'sessao','presenca','ordem_entrada','contato_hospitaleiro',
    'centro_custo','mensalidade',
    'bibliotecario','item','emprestimo','acervo_digital','avaliacao','log_acesso','log_download',
    'minha_mp3','pasta_mp3','pasta_musica','config_etapa_harmonia','roteiro_harmonia',
    'playlist_sessao','tempo_etapa','trabalho_irmao','expediente','visitante_sessao','sugestao_acervo','parecer','pedido_acao_social'
  ];
begin
  foreach t in array tabelas loop
    execute format('alter table public.%1$I enable row level security;', t);
    execute format('drop policy if exists authenticated_all_%1$s on public.%1$I;', t);
    execute format(
      'create policy authenticated_all_%1$s on public.%1$I
       for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- =====================================================================
-- FIM DO ESQUEMA
-- =====================================================================