-- LOJA CAVALEIROS DA PAZ Nº25
-- Atualizações acumuladas conferidas no aplicativo em 26/10/2026.
-- Destino: projeto Supabase externo já utilizado pelo aplicativo.
-- 1. Faça um backup antes de executar.
-- 2. Execute este arquivo inteiro no SQL Editor, com a conta proprietária.
-- 3. Execute depois supabase-conferencia-2026-10-26.sql.
-- Este arquivo NÃO foi executado automaticamente no seu banco.
-- É incremental: não apaga registros, não muda IDs, senhas ou cargos.
-- Pode ser executado novamente; não recria registros de configuração.
-- Não execute o esquema completo antigo por cima deste para atualizar o banco.
--
-- O que já utiliza campos existentes, sem exigir novas tabelas:
-- * Balaústre: sessao.ata (texto contendo JSON com secoes, aprovacao,
--   calendario, assinaturas, leituras, oradores e tronco).
-- * Substituições e OCR: sessao.preparacao_json.
-- * Documentos ricos e período solar: expediente.conteudo.
-- * Escolha de função no login: irmao.cargo e quadro_oficiais.
-- * Credenciais Evolution e controle diário: arquivos no Storage privado,
--   NÃO colunas com chaves de API nas tabelas públicas.
-- A escolha de função é mantida no navegador; não é um novo cargo permanente.
-- O SQL não instala nem agenda serviços externos e não envia WhatsApp.

begin;
set local lock_timeout = '10s';

-- Verifica se estamos atualizando o banco-base correto.
do $$
declare
  tabela text;
begin
  foreach tabela in array array['irmao','quadro_oficiais','sessao','expediente','minha_mp3','config_etapa_harmonia'] loop
    if to_regclass(format('public.%I', tabela)) is null then
      raise exception 'Tabela-base public.% ausente. Confira o projeto selecionado. Em um banco novo, execute primeiro o esquema-base do aplicativo.', tabela;
    end if;
  end loop;
  if to_regprocedure('public.set_updated_date()') is null then
    raise exception 'Função-base public.set_updated_date() ausente. Execute primeiro o esquema-base do aplicativo.';
  end if;
end $$;

-- CADASTRO E ESCOLHA ENTRE TITULAR / SUBSTITUTO.
-- Não preenche nem altera as nomeações existentes.
alter table public.irmao
  add column if not exists cargo text not null default 'Nenhum',
  add column if not exists data_nascimento date;

alter table public.quadro_oficiais
  add column if not exists exercicio text,
  add column if not exists cargo text,
  add column if not exists titular_id uuid,
  add column if not exists titular_nome text,
  add column if not exists titular_cim text,
  add column if not exists substituto_id uuid,
  add column if not exists substituto_nome text,
  add column if not exists publicado boolean not null default false,
  add column if not exists data_publicacao date;

create index if not exists quadro_oficiais_acesso_titular_idx
  on public.quadro_oficiais (exercicio, publicado, titular_id);
create index if not exists quadro_oficiais_acesso_substituto_idx
  on public.quadro_oficiais (exercicio, publicado, substituto_id);

-- BALAÚSTRE, PREPARAÇÃO DA REUNIÃO E LEITURA DE PRESENÇAS.
-- Preserva o tipo e o conteúdo de colunas já existentes.
-- preparacao_json foi definido como jsonb no esquema-base; a aplicação
-- também aceita seu conteúdo serializado. Não converter o conteúdo aqui.
alter table public.sessao
  add column if not exists ata text,
  add column if not exists preparacao_json jsonb;
create index if not exists sessao_status_data_id_idx
  on public.sessao (status, data, id);

-- SECRETARIA: PRANCHAS, EXPEDIENTES E DOCUMENTOS AVULSOS.
-- HTML e metadados permanecem no campo conteudo, sem conversão de textos antigos.
alter table public.expediente
  add column if not exists classe text not null default 'Prancha',
  add column if not exists conteudo text;

-- HARMONIA: MARCAÇÕES DE SILÊNCIO E OBSERVAÇÕES DO ROTEIRO.
-- Nulos preservam a ausência de análise; nenhuma faixa é reprocessada.
alter table public.minha_mp3
  add column if not exists silence_start double precision,
  add column if not exists silence_end double precision;
alter table public.config_etapa_harmonia
  add column if not exists observacao text;

-- FAMILIARES E VISÕES UTILIZADAS PELA LISTA DE ANIVERSARIANTES.
create table if not exists public.familiar (
  id uuid primary key default gen_random_uuid(),
  irmao_id uuid not null references public.irmao(id) on delete cascade,
  nome_completo text not null check (length(btrim(nome_completo)) > 0),
  tipo text not null check (tipo in ('Cunhada','Sobrinho','Sobrinha','Outro')),
  data_nascimento date check (data_nascimento is null or data_nascimento <= current_date),
  telefone text,
  observacoes text,
  ativo boolean not null default true,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
-- Compatibilidade com uma tabela familiar criada parcialmente antes.
-- Campos de identificação novos ficam nulos nos registros antigos até revisão.
alter table public.familiar
  add column if not exists irmao_id uuid,
  add column if not exists nome_completo text,
  add column if not exists tipo text,
  add column if not exists data_nascimento date,
  add column if not exists telefone text,
  add column if not exists observacoes text,
  add column if not exists ativo boolean not null default true,
  add column if not exists created_date timestamptz not null default now(),
  add column if not exists updated_date timestamptz not null default now();
create index if not exists familiar_irmao_idx on public.familiar(irmao_id);
drop trigger if exists set_updated_date_familiar on public.familiar;
create trigger set_updated_date_familiar before update on public.familiar
  for each row execute function public.set_updated_date();

-- Mesmas projeções do cadastro familiar existente, sem senhas.
create or replace view public.familia_irmao as
select id, nome_completo, numero_glp, ativo,
  concat_ws(' ', nome_completo, numero_glp) as busca
from public.irmao;

create or replace view public.familiar_cadastro as
select f.*, i.nome_completo as irmao_nome, i.numero_glp as irmao_numero_glp,
  concat_ws(' ', f.nome_completo, i.nome_completo, i.numero_glp) as busca
from public.familiar f join public.irmao i on i.id = f.irmao_id;

create or replace view public.aniversariante as
select i.id, i.nome_completo, 'Irmão'::text as tipo, i.id as irmao_id,
  i.nome_completo as irmao_nome, i.data_nascimento,
  extract(month from i.data_nascimento)::integer as mes,
  extract(day from i.data_nascimento)::integer as dia,
  concat_ws(' ', i.nome_completo, i.numero_glp) as busca
from public.irmao i where i.ativo = true and i.data_nascimento is not null
union all
select f.id, f.nome_completo, f.tipo, f.irmao_id, i.nome_completo,
  f.data_nascimento, extract(month from f.data_nascimento)::integer,
  extract(day from f.data_nascimento)::integer,
  concat_ws(' ', f.nome_completo, i.nome_completo, i.numero_glp)
from public.familiar f join public.irmao i on i.id = f.irmao_id
where f.ativo = true and i.ativo = true and f.data_nascimento is not null;

-- Mantém o acesso destas tabelas/visões somente pela API externa existente.
revoke all on public.familiar, public.familia_irmao, public.familiar_cadastro, public.aniversariante from public, anon, authenticated;
grant all on public.familiar to service_role;
grant select on public.familia_irmao, public.familiar_cadastro, public.aniversariante to service_role;

-- STORAGE PRIVADO: CONFIGURAÇÕES EVOLUTION E FOTOS DE PRESENÇA.
-- Não grava chaves, não substitui evolution.json nem os registros de envios.
-- Não cria políticas públicas de leitura/escrita. O backend utiliza service_role.
-- Em buckets existentes, apenas garante public=false e mantém limites anteriores.
insert into storage.buckets (id, name, public)
values ('loja-system-config', 'loja-system-config', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listas-presenca', 'listas-presenca', false, 8388608,
  array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set public = false;

-- Atualiza o catálogo exposto pela API do Supabase após o commit.
notify pgrst, 'reload schema';
commit;

select 'Atualização estrutural concluída. Execute agora o arquivo de conferência. Nenhum envio de mensagem foi disparado.' as resultado;