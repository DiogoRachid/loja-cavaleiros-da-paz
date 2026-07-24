import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { listar, criar } from "../../shared/supabase.ts";

const CAMPOS_SESSAO = [
  "numero", "data", "hora", "tipo", "grau", "pauta", "ata",
  "status", "local", "observacoes", "preparacao_json",
];

const CAMPOS_PRESENCA = [
  "sessao_id", "sessao_data", "irmao_id", "irmao_nome", "irmao_cim",
  "presente", "dispensado", "justificativa", "justificativa_aceita",
];

function normalizar(registros, padroes = {}) {
  const chaves = new Set();
  for (const r of registros) Object.keys(r).forEach((k) => chaves.add(k));
  return registros.map((r) => {
    const linha = {};
    for (const k of chaves) {
      const v = r[k];
      linha[k] = v === undefined || v === null || v === "" ? (padroes[k] ?? null) : v;
    }
    return linha;
  });
}

function montar(item, campos) {
  const linha = {};
  for (const campo of campos) linha[campo] = item[campo];
  return linha;
}

// Migra Sessões e Presenças para o Supabase, remapeando os IDs.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;

    const sessoesOrigem = await svc.Sessao.list("-created_date", 1000);
    const sessoesDestino = await listar("sessao");

    const mapSessao = {}; // id antigo -> id novo
    let sessoesInseridas = 0;

    if (sessoesDestino.length === 0 && sessoesOrigem.length > 0) {
      const linhas = normalizar(
        sessoesOrigem.map((s) => montar(s, CAMPOS_SESSAO)),
        { status: "Agendada", grau: "Aprendiz" },
      );
      const criadas = await criar("sessao", linhas);
      sessoesInseridas = criadas.length;
      criadas.forEach((nova, i) => { mapSessao[sessoesOrigem[i].id] = nova.id; });
    } else {
      // já migradas: casa por data + hora + tipo
      for (const antiga of sessoesOrigem) {
        const nova = sessoesDestino.find(
          (s) => s.data === antiga.data && s.hora === antiga.hora && s.tipo === antiga.tipo,
        );
        if (nova) mapSessao[antiga.id] = nova.id;
      }
    }

    // Mapeia irmãos: id antigo -> id novo (via numero_glp)
    const irmaosOrigem = await svc.Irmao.list("-created_date", 1000);
    const irmaosDestino = await listar("irmao");
    const porGlp = {};
    for (const ir of irmaosDestino) porGlp[ir.numero_glp] = ir.id;
    const mapIrmao = {};
    for (const ir of irmaosOrigem) {
      const novo = porGlp[ir.numero_glp];
      if (novo) mapIrmao[ir.id] = novo;
    }

    const presencasOrigem = await svc.Presenca.list("-created_date", 5000);
    const presencasDestino = await listar("presenca");

    let presencasInseridas = 0;
    let ignoradas = 0;
    if (presencasDestino.length === 0) {
      const linhas = [];
      for (const p of presencasOrigem) {
        const sessaoId = mapSessao[p.sessao_id];
        const irmaoId = mapIrmao[p.irmao_id];
        if (!sessaoId || !irmaoId) { ignoradas++; continue; }
        const linha = montar(p, CAMPOS_PRESENCA);
        linha.sessao_id = sessaoId;
        linha.irmao_id = irmaoId;
        linhas.push(linha);
      }
      if (linhas.length > 0) {
        const criadas = await criar("presenca", normalizar(linhas, {
          presente: false, dispensado: false, justificativa_aceita: false,
        }));
        presencasInseridas = criadas.length;
      }
    }

    return Response.json({
      sessoes: { origem: sessoesOrigem.length, jaExistentes: sessoesDestino.length, inseridas: sessoesInseridas },
      presencas: { origem: presencasOrigem.length, jaExistentes: presencasDestino.length, inseridas: presencasInseridas, ignoradas },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});