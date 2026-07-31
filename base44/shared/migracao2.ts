// Helpers da migração Supabase (atual) -> Supabase novo.
import { secrets } from "base44:runtime";

export const BUCKET = "arquivos";

// Ordem importa: tabelas referenciadas vêm antes das que as referenciam.
export const TABELAS = [
  "dados_loja",
  "irmao",
  "autoridade",
  "comissao",
  "membro_comissao",
  "quadro_oficiais",
  "sessao",
  "presenca",
  "ordem_entrada",
  "contato_hospitaleiro",
  "centro_custo",
  "mensalidade",
  "bibliotecario",
  "item",
  "acervo_digital",
  "emprestimo",
  "avaliacao",
  "log_acesso",
  "log_download",
  "pasta_mp3",
  "minha_mp3",
  "pasta_musica",
  "config_etapa_harmonia",
  "roteiro_harmonia",
  "playlist_sessao",
  "tempo_etapa",
];

function cfg(chaveUrl: string, chaveKey: string) {
  const url = secrets.get(chaveUrl);
  const key = secrets.get(chaveKey);
  if (!url || !key) throw new Error(chaveUrl + " / " + chaveKey + " não configurados");
  return { url: url.replace(/\/$/, ""), key };
}

export function origem() {
  return cfg("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY");
}

export function destino() {
  return cfg("SUPABASE2_URL", "SUPABASE2_SERVICE_ROLE_KEY");
}

function headers(c: { key: string }, extra: Record<string, string> = {}) {
  return { apikey: c.key, Authorization: "Bearer " + c.key, ...extra };
}

export async function contar(c: any, tabela: string) {
  const res = await fetch(c.url + "/rest/v1/" + tabela + "?select=id&limit=1", {
    headers: headers(c, { Prefer: "count=exact", Range: "0-0" }),
  });
  if (!res.ok) throw new Error("Contagem falhou em " + tabela + ": " + res.status);
  return Number((res.headers.get("content-range") || "*/0").split("/")[1] || 0);
}

export async function buscarPagina(c: any, tabela: string, offset: number, limite: number) {
  const url = c.url + "/rest/v1/" + tabela +
    "?select=*&order=created_date.asc&offset=" + offset + "&limit=" + limite;
  const res = await fetch(url, { headers: headers(c) });
  if (!res.ok) throw new Error("Leitura falhou em " + tabela + ": " + (await res.text()));
  return await res.json();
}

// Insere preservando os IDs; regravar é seguro (merge por id).
export async function gravar(c: any, tabela: string, linhas: any[]) {
  if (linhas.length === 0) return 0;
  const res = await fetch(c.url + "/rest/v1/" + tabela + "?on_conflict=id", {
    method: "POST",
    headers: headers(c, {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify(linhas),
  });
  if (!res.ok) throw new Error("Gravação falhou em " + tabela + ": " + (await res.text()));
  return linhas.length;
}

export async function garantirBucket(c: any) {
  const res = await fetch(c.url + "/storage/v1/bucket", {
    method: "POST",
    headers: headers(c, { "Content-Type": "application/json" }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (res.ok) return true;
  const texto = await res.text();
  if (res.status === 409 || texto.includes("already exists") || texto.includes("Duplicate")) return false;
  throw new Error("Erro ao criar bucket: " + texto);
}

// Baixa de qualquer URL pública e envia para o Storage do destino.
export async function copiarArquivo(c: any, origemUrl: string, caminho: string) {
  const download = await fetch(origemUrl);
  if (!download.ok) throw new Error("Falha ao baixar (" + download.status + "): " + origemUrl);
  const bytes = new Uint8Array(await download.arrayBuffer());
  const contentType = download.headers.get("content-type") || "application/octet-stream";

  const upload = await fetch(c.url + "/storage/v1/object/" + BUCKET + "/" + caminho, {
    method: "POST",
    headers: headers(c, { "Content-Type": contentType, "x-upsert": "true" }),
    body: bytes,
  });
  if (!upload.ok) throw new Error("Falha no upload: " + (await upload.text()));

  return {
    publicUrl: c.url + "/storage/v1/object/public/" + BUCKET + "/" + caminho,
    bytes: bytes.length,
  };
}

export function nomeSeguro(origemUrl: string, id: string) {
  const base = (origemUrl.split("?")[0].split("/").pop() || "arquivo").replace(/[^a-zA-Z0-9._-]/g, "_");
  return id + "_" + base;
}

export async function atualizarCampo(c: any, tabela: string, id: string, campo: string, valor: string) {
  const res = await fetch(c.url + "/rest/v1/" + tabela + "?id=eq." + id, {
    method: "PATCH",
    headers: headers(c, { "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({ [campo]: valor }),
  });
  if (!res.ok) throw new Error("Update falhou em " + tabela + "/" + id + ": " + (await res.text()));
}