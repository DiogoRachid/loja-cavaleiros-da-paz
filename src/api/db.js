import { base44 } from "@/api/base44Client";

async function chamar(payload) {
  const res = await base44.functions.invoke("db", payload);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data?.data;
}

// Cria um "repositório" com a mesma interface usada nas telas hoje.
function tabela(nome) {
  return {
    list: (sort, limit) => chamar({ operacao: "listar", tabela: nome, sort, limit }),
    filter: (filtro, sort, limit) => chamar({ operacao: "listar", tabela: nome, filtro, sort, limit }),
    get: (id) => chamar({ operacao: "obter", tabela: nome, id }),
    create: (dados) => chamar({ operacao: "criar", tabela: nome, dados }),
    bulkCreate: (dados) => chamar({ operacao: "criar", tabela: nome, dados }),
    update: (id, dados) => chamar({ operacao: "atualizar", tabela: nome, id, dados }),
    delete: (id) => chamar({ operacao: "excluir", tabela: nome, id }),
    deleteMany: (filtro) => chamar({ operacao: "excluirMuitos", tabela: nome, filtro }),
  };
}

export const db = {
  DadosLoja: tabela("dados_loja"),
  Irmao: tabela("irmao"),
  QuadroOficiais: tabela("quadro_oficiais"),
  Autoridade: tabela("autoridade"),
  Comissao: tabela("comissao"),
  MembroComissao: tabela("membro_comissao"),
  Sessao: tabela("sessao"),
  Presenca: tabela("presenca"),
  OrdemEntrada: tabela("ordem_entrada"),
  ContatoHospitaleiro: tabela("contato_hospitaleiro"),
  CentroCusto: tabela("centro_custo"),
  Mensalidade: tabela("mensalidade"),
  Bibliotecario: tabela("bibliotecario"),
  Item: tabela("item"),
  Emprestimo: tabela("emprestimo"),
  AcervoDigital: tabela("acervo_digital"),
  Avaliacao: tabela("avaliacao"),
  SugestaoAcervo: tabela("sugestao_acervo"),
  LogAcesso: tabela("log_acesso"),
  LogDownload: tabela("log_download"),
  MinhaMp3: tabela("minha_mp3"),
  PastaMp3: tabela("pasta_mp3"),
  PastaMusica: tabela("pasta_musica"),
  ConfigEtapaHarmonia: tabela("config_etapa_harmonia"),
  RoteiroHarmonia: tabela("roteiro_harmonia"),
  PlaylistSessao: tabela("playlist_sessao"),
  TempoEtapa: tabela("tempo_etapa"),
};

export default db;