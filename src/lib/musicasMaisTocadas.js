import { db } from "@/api/db";

/**
 * Calcula as músicas mais tocadas por etapa do roteiro, considerando apenas
 * sessões realizadas de um mesmo grau + tipo. Retorna um Map etapaNome -> array
 * de { track, total } ordenado por total (desc).
 *
 * A chave de contagem é o nome da música (name/nome), mas preservamos o objeto
 * track completo (com id e file_url) para que possa ser inserido no roteiro.
 */
export async function carregarMaisTocadasPorEtapa({ grau, tipoSessao, limite = 3 }) {
  const [sessoes, roteiros] = await Promise.all([
    db.Sessao.filter({ status: "Realizada" }),
    db.RoteiroHarmonia.list("-created_date", 500),
  ]);
  const realizadas = new Map(sessoes.map((s) => [s.id, s]));

  const porEtapa = new Map();

  roteiros.forEach((r) => {
    const s = realizadas.get(r.sessao_id);
    if (!s) return;
    // Filtra pelo grau e tipo da sessão alvo
    if (grau && (s.grau || r.grau) !== grau) return;
    if (tipoSessao && (s.tipo || r.sessao_tipo) !== tipoSessao) return;

    let etapas = [];
    try { etapas = r.etapas ? JSON.parse(r.etapas) : []; } catch { etapas = []; }
    if (!Array.isArray(etapas)) return;

    etapas.forEach((e) => {
      const nomeEtapa = (e.nome || "Etapa").trim();
      if (!porEtapa.has(nomeEtapa)) porEtapa.set(nomeEtapa, new Map());
      const contagem = porEtapa.get(nomeEtapa);
      (e.tracks || []).forEach((t) => {
        if (!t || !t.file_url) return; // só conta músicas reproduzíveis
        const chave = (t.name || t.nome || "").trim();
        if (!chave) return;
        const atual = contagem.get(chave);
        if (atual) {
          atual.total += 1;
        } else {
          contagem.set(chave, {
            total: 1,
            track: {
              id: t.id,
              name: t.name || t.nome || chave,
              artists: t.artists || t.artista || "",
              file_url: t.file_url,
              is_mp3: t.is_mp3 !== false,
            },
          });
        }
      });
    });
  });

  const resultado = new Map();
  porEtapa.forEach((contagem, etapa) => {
    const ordenadas = [...contagem.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, limite)
      .map((item) => ({ track: item.track, total: item.total }));
    if (ordenadas.length > 0) resultado.set(etapa, ordenadas);
  });

  return resultado;
}