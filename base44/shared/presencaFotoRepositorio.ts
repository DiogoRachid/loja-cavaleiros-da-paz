import { secrets } from "base44:runtime";

export function falha(status, mensagem) { return Object.assign(new Error(mensagem), { status }); }
function configuracao() {
  const base = secrets.get("SUPABASE2_URL")?.replace(/\/$/, "");
  const chave = secrets.get("SUPABASE2_SERVICE_ROLE_KEY");
  if (!base || !chave) throw falha(503, "Armazenamento não configurado.");
  return { base, headers: { apikey: chave, Authorization: `Bearer ${chave}` } };
}
export async function acessar(caminho, opcoes = {}) {
  const { base, headers } = configuracao();
  return await fetch(`${base}${caminho}`, { ...opcoes, headers: { ...headers, ...opcoes.headers }, signal: AbortSignal.timeout(20000) });
}
export async function rest(caminho, method = "GET", dados) {
  const resposta = await acessar(`/rest/v1/${caminho}`, { method, headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: dados === undefined ? undefined : JSON.stringify(dados) });
  if (!resposta.ok) throw falha(502, "Não foi possível consultar ou atualizar as presenças.");
  return await resposta.json();
}
export async function contextoPresenca(user, sessaoId) {
  const sessoes = await rest(`sessao?select=*&id=eq.${encodeURIComponent(sessaoId)}`);
  const sessao = sessoes[0];
  if (!sessao) throw falha(404, "Sessão não encontrada.");
  let preparacao;
  try { preparacao = typeof sessao.preparacao_json === "string" ? JSON.parse(sessao.preparacao_json || "{}") : (sessao.preparacao_json || {}); }
  catch { throw falha(409, "A preparação desta sessão precisa ser corrigida antes de anexar uma lista."); }
  if (!preparacao || typeof preparacao !== "object" || Array.isArray(preparacao)) throw falha(409, "Preparação da sessão inválida.");
  const email = String(user.email || "").trim().toLowerCase();
  const candidatos = email ? await rest(`irmao?select=id,nome_completo,email,cargo&ativo=eq.true&email=ilike.${encodeURIComponent(email)}`) : [];
  const iguais = candidatos.filter((item) => String(item.email || "").trim().toLowerCase() === email);
  const irmao = iguais.length === 1 ? iguais[0] : null;
  const designado = (preparacao.quadroOficiais || []).some((item) => item.cargo === "Chanceler" && (item.substituto_id || item.titular_id) === irmao?.id);
  const podeAprovar = !!irmao && (irmao.cargo === "Chanceler" || designado);
  if (user.role !== "admin" && !podeAprovar && !["Venerável Mestre", "Secretário"].includes(irmao?.cargo)) throw falha(403, "Use uma conta autenticada vinculada ao e-mail do Chanceler, Secretário ou Venerável Mestre.");
  return { sessao, preparacao, irmao, podeAprovar, leituras: preparacao.leituras_presenca || [] };
}
export async function irmaosAtivos() {
  const resultado = [];
  for (let offset = 0; ; offset += 500) {
    const pagina = await rest(`irmao?select=id,nome_completo,numero_glp,grau&ativo=eq.true&order=id.asc&limit=500&offset=${offset}`);
    resultado.push(...pagina);
    if (pagina.length < 500) return resultado;
  }
}
export async function salvarLeituras(contexto, leituras) {
  const { sessao, preparacao } = contexto;
  const anterior = sessao.preparacao_json;
  const condicao = anterior == null ? "is.null" : `eq.${encodeURIComponent(typeof anterior === "string" ? anterior : JSON.stringify(anterior))}`;
  const linhas = await rest(`sessao?id=eq.${encodeURIComponent(sessao.id)}&preparacao_json=${condicao}`, "PATCH", { preparacao_json: JSON.stringify({ ...preparacao, leituras_presenca: leituras }) });
  if (!linhas.length) throw falha(409, "A sessão foi alterada durante a operação. Atualize as leituras e tente novamente.");
}