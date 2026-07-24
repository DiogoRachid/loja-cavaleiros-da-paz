import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { listar, criar } from "../../shared/supabase.ts";

const CAMPOS = [
  "irmao_id", "irmao_nome", "faltas_consecutivas", "status",
  "descricao", "data_contato", "registrado_por",
];

// Migra ContatoHospitaleiro para o Supabase, remapeando o irmao_id.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;

    const destino = await listar("contato_hospitaleiro");
    const origem = await svc.ContatoHospitaleiro.list("-created_date", 2000);

    const irmaosOrigem = await svc.Irmao.list("-created_date", 1000);
    const irmaosDestino = await listar("irmao");
    const porGlp = {};
    for (const ir of irmaosDestino) porGlp[ir.numero_glp] = ir.id;
    const mapIrmao = {};
    for (const ir of irmaosOrigem) {
      if (porGlp[ir.numero_glp]) mapIrmao[ir.id] = porGlp[ir.numero_glp];
    }

    let inseridos = 0;
    let ignorados = 0;
    if (destino.length === 0) {
      const linhas = [];
      for (const c of origem) {
        const irmaoId = mapIrmao[c.irmao_id];
        if (!irmaoId) { ignorados++; continue; }
        const linha = {};
        for (const campo of CAMPOS) {
          const v = c[campo];
          linha[campo] = v === undefined || v === "" ? null : v;
        }
        linha.irmao_id = irmaoId;
        linha.status = linha.status || "Pendente";
        linhas.push(linha);
      }
      if (linhas.length > 0) {
        const criados = await criar("contato_hospitaleiro", linhas);
        inseridos = criados.length;
      }
    }

    return Response.json({ origem: origem.length, jaExistentes: destino.length, inseridos, ignorados });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});