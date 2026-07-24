import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { listar, criar } from "../../shared/supabase.ts";

// Copia registros do banco interno (entidades) para o Supabase.
// payload: { entidade: "Irmao", tabela: "irmao", campos: ["a","b"] }
Deno.serve(async (req) => {
  try {
    const { entidade, tabela, campos, padroes } = await req.json();
    if (!entidade || !tabela) {
      return Response.json({ error: "Informe entidade e tabela" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const origem = await base44.asServiceRole.entities[entidade].list("-created_date", 1000);
    const destino = await listar(tabela);

    const registros = [];
    for (const item of origem) {
      const linha = {};
      for (const campo of campos || Object.keys(item)) {
        if (["id", "created_date", "updated_date", "created_by_id"].includes(campo)) continue;
        const valor = item[campo];
        if (valor === undefined || valor === "") continue;
        linha[campo] = valor;
      }
      registros.push(linha);
    }

    // PostgREST exige as mesmas chaves em todas as linhas do lote
    const todasChaves = new Set();
    for (const r of registros) Object.keys(r).forEach((k) => todasChaves.add(k));
    const normalizados = registros.map((r) => {
      const linha = {};
      for (const k of todasChaves) {
        const v = r[k];
        linha[k] = v === undefined || v === null ? (padroes?.[k] ?? null) : v;
      }
      return linha;
    });

    let inseridos = 0;
    if (normalizados.length > 0 && destino.length === 0) {
      const criados = await criar(tabela, normalizados);
      inseridos = Array.isArray(criados) ? criados.length : 1;
    }

    return Response.json({
      origem: origem.length,
      jaExistentes: destino.length,
      inseridos,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});