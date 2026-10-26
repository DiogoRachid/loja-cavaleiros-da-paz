-- Cadastro familiar no Supabase externo. Não cria entidades Base44.
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
create index if not exists familiar_irmao_idx on public.familiar(irmao_id);
drop trigger if exists set_updated_date_familiar on public.familiar;
create trigger set_updated_date_familiar before update on public.familiar
  for each row execute function public.set_updated_date();

-- Projeções sem senha ou outros dados de autenticação dos irmãos.
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

-- O acesso permanece na API externa existente, nunca por chave pública.
revoke all on public.familiar, public.familia_irmao, public.familiar_cadastro, public.aniversariante from public, anon, authenticated;
grant all on public.familiar to service_role;
grant select on public.familia_irmao, public.familiar_cadastro, public.aniversariante to service_role;
notify pgrst, 'reload schema';