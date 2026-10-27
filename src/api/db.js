import { base44 } from "@/api/base44Client";
import mascararLinksArquivos from "@/lib/linksArquivos";

// Endpoint externo (deploy no Vercel, sem dependência do Base44).
// Defina VITE_DB_API_URL no ambiente para apontar para a sua própria API
// (ex: uma serverless function no Vercel que fala com o Supabase externo).
const DB_API_URL = import.meta.env.VITE_DB_API_URL;

async function chamar(payload) {
  const biblioteca = ["acervo_digital", "sugestao_acervo"].includes(payload.tabela);
  if (biblioteca && payload.dados) payload = { ...payload, dados: mascararLinksArquivos(payload.dados) };
  if (DB_API_URL) {
    const res = await fetch(DB_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json?.error) throw new Error(json.error);
    return biblioteca ? mascararLinksArquivos(json?.data) : json?.data;
  }
  const res = await base44.functions.invoke("db", payload).catch(error => {
    const detalhe = error.response?.data?.error;
    if (typeof detalhe === "string" && detalhe) throw new Error(detalhe);
    throw error;
  });
  if (res.data?.error) throw new Error(res.data.error);
  return biblioteca ? mascararLinksArquivos(res.data?.data) : res.data?.data;
}

// Cria um "repositório" com a mesma interface usada nas telas hoje.
function tabela(nome) {
  return {
    list: (sort, limit, offset) => chamar({ operacao: "listar", tabela: nome, sort, limit, offset }),
    filter: (filtro, sort, limit, offset) => chamar({ operacao: "listar", tabela: nome, filtro, sort, limit, offset }),
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
  TrabalhoIrmao: tabela("trabalho_irmao"),
  Expediente: tabela("expediente"),
  VisitanteSessao: tabela("visitante_sessao"),
  Parecer: tabela("parecer"),
  PedidoAcaoSocial: tabela("pedido_acao_social"),
  CargoExercido: tabela("cargo_exercido"),
  BeneficiarioMutua: tabela("beneficiario_mutua"),
  Familiar: tabela("familiar"),
  FamiliarCadastro: tabela("familiar_cadastro"),
  FamiliaIrmao: tabela("familia_irmao"),
  Aniversariante: tabela("aniversariante"),
};

export default db;