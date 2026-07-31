// Camada compartilhada de acesso ao Supabase (PostgREST via fetch).
// Usada pelas funções de backend do app.

export const TABELAS = [
  "dados_loja", "irmao", "quadro_oficiais", "autoridade", "comissao", "membro_comissao",
  "sessao", "presenca", "ordem_entrada", "contato_hospitaleiro",
  "centro_custo", "mensalidade",
  "bibliotecario", "item", "emprestimo", "acervo_digital", "avaliacao", "log_acesso", "log_download",
  "sugestao_acervo",
  "minha_mp3", "pasta_mp3", "pasta_musica", "config_etapa_harmonia", "roteiro_harmonia",
  "playlist_sessao", "tempo_etapa"
];

function config() {
  const url = Deno.env.get("SUPABASE2_URL");
  const key = Deno.env.get("SUPABASE2_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE2_URL / SUPABASE2_SERVICE_ROLE_KEY não configurados");
  return { url: url.replace(/\/$/, ""), key };
}

function assertTabela(tabela) {
  if (!TABELAS.includes(tabela)) throw new Error("Tabela não permitida: " + tabela);
}

async function request(method, path, body, extraHeaders) {
  const { url, key } = config();
  const headers = {
    apikey: key,
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
    ...(extraHeaders || {}),
  };
  const res = await fetch(url + "/rest/v1/" + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texto = await res.text();
  if (!res.ok) throw new Error("Supabase " + res.status + ": " + texto);
  return texto ? JSON.parse(texto) : null;
}

// Converte um filtro simples { campo: valor } em query string do PostgREST.
function filtroParaQuery(filtro) {
  const partes = [];
  for (const [campo, valor] of Object.entries(filtro || {})) {
    if (valor === null) partes.push(campo + "=is.null");
    else if (Array.isArray(valor)) partes.push(campo + "=in.(" + valor.map((v) => `"${v}"`).join(",") + ")");
    else partes.push(campo + "=eq." + encodeURIComponent(valor));
  }
  return partes;
}

function ordenacaoParaQuery(sort) {
  if (!sort) return [];
  const desc = sort.startsWith("-");
  const campo = desc ? sort.slice(1) : sort;
  return ["order=" + campo + "." + (desc ? "desc" : "asc")];
}

export async function listar(tabela, { filtro, sort, limit } = {}) {
  assertTabela(tabela);
  const q = ["select=*", ...filtroParaQuery(filtro), ...ordenacaoParaQuery(sort)];
  if (limit) q.push("limit=" + limit);
  return await request("GET", tabela + "?" + q.join("&"));
}

// Lista os nomes das colunas de uma tabela (via OpenAPI do PostgREST).
let _openapi = null;
export async function colunas(tabela) {
  assertTabela(tabela);
  if (!_openapi) _openapi = await request("GET", "");
  const def = _openapi?.definitions?.[tabela];
  return Object.keys(def?.properties || {});
}

export async function obter(tabela, id) {
  assertTabela(tabela);
  const linhas = await request("GET", tabela + "?select=*&id=eq." + encodeURIComponent(id));
  return linhas && linhas[0] ? linhas[0] : null;
}

export async function criar(tabela, dados) {
  assertTabela(tabela);
  const linhas = await request("POST", tabela + "?select=*", dados, { Prefer: "return=representation" });
  return Array.isArray(dados) ? linhas : linhas[0];
}

export async function atualizar(tabela, id, dados) {
  assertTabela(tabela);
  const linhas = await request(
    "PATCH",
    tabela + "?select=*&id=eq." + encodeURIComponent(id),
    dados,
    { Prefer: "return=representation" }
  );
  return linhas && linhas[0] ? linhas[0] : null;
}

export async function excluir(tabela, id) {
  assertTabela(tabela);
  await request("DELETE", tabela + "?id=eq." + encodeURIComponent(id));
  return { success: true };
}

export async function excluirMuitos(tabela, filtro) {
  assertTabela(tabela);
  const partes = filtroParaQuery(filtro);
  if (partes.length === 0) throw new Error("Filtro obrigatório para exclusão em massa");
  await request("DELETE", tabela + "?" + partes.join("&"));
  return { success: true };
}