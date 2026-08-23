import { db } from "@/api/db";

/**
 * Verifica se um irmão está designado como substituto de um cargo
 * em alguma sessão ainda agendada (preparação da reunião).
 * Retorna a sessão encontrada ou null.
 */
export async function buscarSubstituicaoAtiva(cargo, irmaoId) {
  if (!cargo || !irmaoId) return null;
  const sessoes = await db.Sessao.filter({ status: "Agendada" });
  for (const s of sessoes) {
    if (!s.preparacao_json) continue;
    try {
      const dados = JSON.parse(s.preparacao_json);
      const encontrado = (dados.quadroOficiais || []).find(
        o => o.cargo === cargo && o.substituto_id === irmaoId
      );
      if (encontrado) return s;
    } catch (e) {
      // json inválido, ignora
    }
  }
  return null;
}