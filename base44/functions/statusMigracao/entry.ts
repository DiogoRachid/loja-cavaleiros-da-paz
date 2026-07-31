import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { TABELAS, listar } from "../../shared/supabase.ts";

const MAPA = {
  DadosLoja: "dados_loja", Irmao: "irmao", QuadroOficiais: "quadro_oficiais", Autoridade: "autoridade",
  Comissao: "comissao", MembroComissao: "membro_comissao", Sessao: "sessao", Presenca: "presenca",
  OrdemEntrada: "ordem_entrada", ContatoHospitaleiro: "contato_hospitaleiro", CentroCusto: "centro_custo",
  Mensalidade: "mensalidade", Bibliotecario: "bibliotecario", Item: "item", Emprestimo: "emprestimo",
  AcervoDigital: "acervo_digital", Avaliacao: "avaliacao", LogAcesso: "log_acesso", LogDownload: "log_download",
  MinhaMp3: "minha_mp3", PastaMp3: "pasta_mp3", PastaMusica: "pasta_musica",
  ConfigEtapaHarmonia: "config_etapa_harmonia", RoteiroHarmonia: "roteiro_harmonia",
  PlaylistSessao: "playlist_sessao", TempoEtapa: "tempo_etapa",
};

// Compara a quantidade de registros no Base44 x Supabase externo, tabela por tabela.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;
    const relatorio = {};
    for (const [entidade, tabela] of Object.entries(MAPA)) {
      let origem = "?";
      try { origem = (await svc[entidade].list("-created_date", 10000)).length; } catch (e) { origem = "erro: " + e.message; }
      let destino = "?";
      try { destino = (await listar(tabela)).length; } catch (e) { destino = "erro: " + e.message; }
      relatorio[entidade] = `base44=${origem} supabase=${destino}`;
    }
    return Response.json({ relatorio, tabelasSemMapeamento: TABELAS.filter((t) => !Object.values(MAPA).includes(t)) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});