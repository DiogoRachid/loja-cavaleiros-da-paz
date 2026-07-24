import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { listar, criar, colunas } from "../../shared/supabase.ts";

const IGNORAR = ["id", "created_date", "updated_date", "created_by_id", "created_by", "is_sample", "sample_data"];

// entidade -> tabela, referências a remapear e valores padrão para colunas obrigatórias
const PLANO = [
  { entidade: "DadosLoja", tabela: "dados_loja" },
  { entidade: "Autoridade", tabela: "autoridade", chave: (r) => r.nome },
  { entidade: "CentroCusto", tabela: "centro_custo", chave: (r) => r.nome },
  { entidade: "Comissao", tabela: "comissao", chave: (r) => r.nome, padroes: { tipo: "Permanente", ativa: true } },
  { entidade: "Bibliotecario", tabela: "bibliotecario", chave: (r) => r.nome },
  { entidade: "Item", tabela: "item", chave: (r) => r.titulo || r.nome },
  { entidade: "AcervoDigital", tabela: "acervo_digital", chave: (r) => r.titulo, padroes: { grau_minimo: "Aprendiz", ativo: true, disponivel: true } },
  { entidade: "MinhaMp3", tabela: "minha_mp3", chave: (r) => r.file_url },
  { entidade: "PastaMp3", tabela: "pasta_mp3", chave: (r) => r.nome },
  { entidade: "ConfigEtapaHarmonia", tabela: "config_etapa_harmonia", refs: { playlist_id: "PastaMp3" }, padroes: { ordem: 0 } },
  { entidade: "MembroComissao", tabela: "membro_comissao", refs: { comissao_id: "Comissao", irmao_id: "Irmao" } },
  { entidade: "QuadroOficiais", tabela: "quadro_oficiais", refs: { titular_id: "Irmao", substituto_id: "Irmao" }, padroes: { publicado: false } },
  { entidade: "Mensalidade", tabela: "mensalidade", refs: { irmao_id: "Irmao" }, padroes: { status: "Pendente" } },
  { entidade: "OrdemEntrada", tabela: "ordem_entrada", refs: { sessao_id: "Sessao", autoridade_id: "Autoridade" }, padroes: { presente: false, confirmado: false } },
  { entidade: "Emprestimo", tabela: "emprestimo", refs: { item_id: "Item", irmao_id: "Irmao" }, padroes: { status: "Ativo" } },
  { entidade: "Avaliacao", tabela: "avaliacao", refs: { item_id: "Item", documento_id: "AcervoDigital", irmao_id: "Irmao" } },
  { entidade: "LogAcesso", tabela: "log_acesso", refs: { irmao_id: "Irmao" }, padroes: { tipo_acesso: "Login" } },
  { entidade: "LogDownload", tabela: "log_download", refs: { irmao_id: "Irmao", documento_id: "AcervoDigital" } },
  { entidade: "PastaMusica", tabela: "pasta_musica", refs: { pasta_id: "PastaMp3", mp3_id: "MinhaMp3" }, padroes: { ordem: 0 } },
  { entidade: "RoteiroHarmonia", tabela: "roteiro_harmonia", refs: { sessao_id: "Sessao" } },
  { entidade: "PlaylistSessao", tabela: "playlist_sessao", refs: { sessao_id: "Sessao" }, padroes: { ordem: 0 } },
  { entidade: "TempoEtapa", tabela: "tempo_etapa", refs: { sessao_id: "Sessao" } },
];

function limpar(item, permitidos) {
  const linha = {};
  for (const [k, v] of Object.entries(item)) {
    if (IGNORAR.includes(k) || k.startsWith("_")) continue;
    if (permitidos && !permitidos.has(k)) continue;
    linha[k] = v === "" ? null : v;
  }
  return linha;
}

function normalizar(registros, padroes = {}) {
  const chaves = new Set();
  for (const r of registros) Object.keys(r).forEach((k) => chaves.add(k));
  return registros.map((r) => {
    const linha = {};
    for (const k of chaves) {
      const v = r[k];
      linha[k] = v === undefined || v === null ? (padroes[k] ?? null) : v;
    }
    return linha;
  });
}

// Migra todas as entidades restantes, remapeando os IDs entre as tabelas.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;
    const mapas = {};

    // Irmãos e Sessões já foram migrados: reconstrói os mapas
    const irmaosOrigem = await svc.Irmao.list("-created_date", 2000);
    const irmaosDestino = await listar("irmao");
    mapas.Irmao = {};
    const porGlp = {};
    for (const ir of irmaosDestino) porGlp[ir.numero_glp] = ir.id;
    for (const ir of irmaosOrigem) if (porGlp[ir.numero_glp]) mapas.Irmao[ir.id] = porGlp[ir.numero_glp];

    const sessoesOrigem = await svc.Sessao.list("-created_date", 2000);
    const sessoesDestino = await listar("sessao");
    mapas.Sessao = {};
    for (const s of sessoesOrigem) {
      const nova = sessoesDestino.find((d) => d.data === s.data && d.hora === s.hora && d.tipo === s.tipo);
      if (nova) mapas.Sessao[s.id] = nova.id;
    }

    const resultado = {};

    for (const passo of PLANO) {
      const { entidade, tabela, refs = {}, padroes = {}, chave } = passo;
      const origem = await svc[entidade].list("-created_date", 5000);
      const destino = await listar(tabela);
      const permitidos = new Set(await colunas(tabela));
      mapas[entidade] = mapas[entidade] || {};

      // Se já migrado, reconstrói o mapa de IDs pela chave natural
      if (destino.length > 0 && chave) {
        const porChave = {};
        for (const d of destino) porChave[chave(d)] = d.id;
        for (const o of origem) {
          const novo = porChave[chave(o)];
          if (novo) mapas[entidade][o.id] = novo;
        }
      }

      if (destino.length > 0 || origem.length === 0) {
        resultado[entidade] = { origem: origem.length, jaExistentes: destino.length, inseridos: 0, ignorados: 0 };
        continue;
      }

      const usados = [];
      const linhas = [];
      let ignorados = 0;
      for (const item of origem) {
        const linha = limpar(item, permitidos.size > 0 ? permitidos : null);
        let ok = true;
        for (const [campo, alvo] of Object.entries(refs)) {
          const antigo = linha[campo];
          if (!antigo) { linha[campo] = null; continue; }
          const novo = mapas[alvo]?.[antigo];
          if (!novo) { ok = false; break; }
          linha[campo] = novo;
        }
        if (!ok) { ignorados++; continue; }
        usados.push(item);
        linhas.push(linha);
      }

      let inseridos = 0;
      try {
        if (linhas.length > 0) {
          const criados = await criar(tabela, normalizar(linhas, padroes));
          inseridos = criados.length;
          criados.forEach((novo, i) => { mapas[entidade][usados[i].id] = novo.id; });
        }
      } catch (e) {
        resultado[entidade] = { origem: origem.length, erro: e.message };
        continue;
      }

      resultado[entidade] = { origem: origem.length, jaExistentes: 0, inseridos, ignorados };
    }

    const compacto = {};
    for (const [k, v] of Object.entries(resultado)) {
      compacto[k] = v.erro ? "ERRO: " + v.erro : `${v.origem}→${v.inseridos}+${v.jaExistentes}${v.ignorados ? " ign:" + v.ignorados : ""}`;
    }
    return Response.json(compacto);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});