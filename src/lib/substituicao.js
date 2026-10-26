import { db } from "@/api/db";

/**
 * Verifica se um irmão está designado como substituto de um cargo
 * em alguma sessão ainda agendada (preparação da reunião).
 * Retorna a sessão encontrada ou null.
 */
export async function listarSubstituicoesAtivas(irmaoId) {
  if (!irmaoId) return [];
  const substituicoes = [];
  for (let offset = 0; ; offset += 100) {
    const sessoes = await db.Sessao.filter({ status: "Agendada" }, "data,id", 100, offset);
    for (const sessao of sessoes) {
      let dados;
      try { dados = JSON.parse(sessao.preparacao_json || "{}"); }
      catch { continue; }
      if (!Array.isArray(dados?.quadroOficiais)) continue;
      for (const oficial of dados.quadroOficiais) {
        if (oficial?.substituto_id === irmaoId && oficial.cargo) substituicoes.push({ cargo: oficial.cargo, sessao });
      }
    }
    if (sessoes.length < 100) break;
  }
  return substituicoes;
}

export async function buscarSubstituicaoAtiva(cargo, irmaoId) {
  if (!cargo || !irmaoId) return null;
  return (await listarSubstituicoesAtivas(irmaoId)).find((item) => item.cargo === cargo)?.sessao || null;
}