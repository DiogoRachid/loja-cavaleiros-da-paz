import { listar, atualizar } from "../../shared/supabase.ts";

// Sincroniza o campo "cargo" da tabela irmao com o Quadro de Oficiais,
// casando pelo nome do titular (tolerante a nomes abreviados).
const MAPA_CARGO = {
  "Cobridor": "Cobrador",
  "Guarda do Templo": "Guarda Interno",
  "Mestre de Cerimônias Adjunto": "Mestre de Cerimônias",
  "Secretário de Ação Social": "Secretário",
};

function normalizar(txt) {
  return (txt || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

const IGNORAR = ["de", "da", "do", "dos", "das", "e", "junior", "filho", "neto", "neia"];

function tokens(nome) {
  return normalizar(nome).split(" ").filter(t => t.length > 1 && !IGNORAR.includes(t));
}

export default async function (req) {
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const aplicar = body.aplicar !== false;

    const [oficiais, irmaos] = await Promise.all([
      listar("quadro_oficiais", {}),
      listar("irmao", {}),
    ]);

    const resultados = [];

    for (const of_ of oficiais) {
      const alvo = tokens(of_.titular_nome);
      if (alvo.length === 0) continue;

      let melhor = null;
      let melhorScore = 0;
      for (const irmao of irmaos) {
        const t = tokens(irmao.nome_completo);
        if (t.length === 0) continue;
        const comuns = alvo.filter(x => t.includes(x)).length;
        const score = comuns / Math.min(alvo.length, t.length);
        // exige primeiro nome igual
        if (alvo[0] !== t[0]) continue;
        if (score > melhorScore) { melhorScore = score; melhor = irmao; }
      }

      if (!melhor || melhorScore < 0.6) {
        resultados.push({ cargo: of_.cargo, titular: of_.titular_nome, status: "nao_encontrado" });
        continue;
      }

      const cargoFinal = MAPA_CARGO[of_.cargo] || of_.cargo;

      if (aplicar) {
        await atualizar("irmao", melhor.id, { cargo: cargoFinal });
        if (!of_.titular_id) {
          await atualizar("quadro_oficiais", of_.id, { titular_id: melhor.id });
        }
      }

      resultados.push({
        cargo: of_.cargo,
        cargo_aplicado: cargoFinal,
        titular: of_.titular_nome,
        irmao: melhor.nome_completo,
        glp: melhor.numero_glp,
        status: aplicar ? "atualizado" : "casado",
      });
    }

    return Response.json({
      total: resultados.length,
      atualizados: resultados.filter(r => r.status !== "nao_encontrado").length,
      nao_encontrados: resultados.filter(r => r.status === "nao_encontrado"),
      resultados,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}