-- LOJA CAVALEIROS DA PAZ Nº25 - Conferência das atualizações de 26/10/2026.
-- Execute DEPOIS de supabase-atualizacoes-2026-10-26.sql no mesmo projeto.
-- Somente consultas: não altera dados, não exibe senhas/chaves e não envia mensagens.
-- O resultado consulta o banco em que este arquivo for executado;
-- não significa que ele já foi executado ou que todos os fluxos foram testados.
-- Se houver AUSENTE ou REVISAR, não considere a atualização concluída.
-- Alguns editores mostram apenas o último resultado; execute cada SELECT
-- separadamente para ver seus detalhes, se necessário.

-- 1. Campos consumidos pelas últimas funcionalidades.
with esperados(tabela, coluna, tipos) as (values
  ('irmao','id',array['uuid']),
  ('irmao','numero_glp',array['text','character varying']),
  ('irmao','cargo',array['text','character varying']),
  ('irmao','ativo',array['boolean']),
  ('irmao','data_nascimento',array['date']),
  ('quadro_oficiais','exercicio',array['text','character varying']),
  ('quadro_oficiais','cargo',array['text','character varying']),
  ('quadro_oficiais','titular_id',array['uuid']),
  ('quadro_oficiais','substituto_id',array['uuid']),
  ('quadro_oficiais','publicado',array['boolean']),
  ('sessao','ata',array['text','character varying']),
  ('sessao','preparacao_json',array['jsonb','json','text','character varying']),
  ('sessao','status',array['text','character varying']),
  ('sessao','data',array['date']),
  ('expediente','classe',array['text','character varying']),
  ('expediente','conteudo',array['text','character varying']),
  ('minha_mp3','silence_start',array['double precision','real','numeric']),
  ('minha_mp3','silence_end',array['double precision','real','numeric']),
  ('config_etapa_harmonia','observacao',array['text','character varying']),
  ('familiar','id',array['uuid']),
  ('familiar','irmao_id',array['uuid']),
  ('familiar','nome_completo',array['text','character varying']),
  ('familiar','tipo',array['text','character varying']),
  ('familiar','data_nascimento',array['date']),
  ('familiar','ativo',array['boolean']),
  ('aniversariante','mes',array['integer']),
  ('aniversariante','dia',array['integer']),
  ('aniversariante','tipo',array['text','character varying'])
)
select e.tabela, e.coluna, c.data_type as tipo_encontrado,
  case when c.column_name is null then 'AUSENTE'
       when c.data_type = any(e.tipos) then 'OK'
       else 'REVISAR TIPO (nenhuma conversão automática foi feita)' end as situacao
from esperados e left join information_schema.columns c
  on c.table_schema = 'public' and c.table_name = e.tabela and c.column_name = e.coluna
order by e.tabela, e.coluna;

-- 2. As três visões precisam existir e ser consultáveis pela API externa.
with esperadas(nome) as (values ('familia_irmao'),('familiar_cadastro'),('aniversariante'))
select e.nome,
  case when v.table_name is null then 'AUSENTE'
       when has_table_privilege('service_role', format('public.%I', e.nome), 'SELECT') then 'OK'
       else 'REVISAR PERMISSÃO SERVICE_ROLE' end as situacao
from esperadas e left join information_schema.views v
  on v.table_schema = 'public' and v.table_name = e.nome
order by e.nome;

-- 3. Bucket existente e privado. Não exibe o conteúdo dos arquivos.
with esperados(id) as (values ('loja-system-config'),('listas-presenca'))
select e.id as bucket,
  case when b.id is null then 'AUSENTE'
       when b.public is false then 'OK: PRIVADO'
       else 'REVISAR: BUCKET PÚBLICO' end as situacao,
  b.file_size_limit, b.allowed_mime_types
from esperados e left join storage.buckets b on b.id = e.id
order by e.id;

-- 4. Confere apenas se há um arquivo de configuração; nunca lê a chave.
-- PENDENTE é esperado enquanto a configuração não foi salva pelo VM.
select case when exists (
  select 1 from storage.objects
  where bucket_id = 'loja-system-config' and name = 'evolution.json'
) then 'CONFIGURAÇÃO PRESENTE (conteúdo não validado por este SQL)'
  else 'PENDENTE: salve a configuração Evolution no aplicativo' end as configuracao_whatsapp;

-- 5. Índices das novas consultas. Não cria índices adicionais.
with esperados(nome) as (values
  ('quadro_oficiais_acesso_titular_idx'),
  ('quadro_oficiais_acesso_substituto_idx'),
  ('sessao_status_data_id_idx'),('familiar_irmao_idx')
)
select e.nome as indice,
  case when i.indexname is null then 'AUSENTE' else 'OK' end as situacao
from esperados e left join pg_indexes i
  on i.schemaname = 'public' and i.indexname = e.nome
order by e.nome;

-- 6. Aviso final: o SQL verifica a estrutura, não a entrega de mensagens
-- nem a agenda de execução, que permanecem na configuração do aplicativo.
select 'Conferência encerrada: revise os resultados anteriores. Configuração Evolution ausente exige preenchimento no aplicativo; este arquivo não testa o envio nem o login.' as observacao;