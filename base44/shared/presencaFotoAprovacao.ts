import { contextoPresenca, irmaosAtivos, rest, salvarLeituras, falha } from "./presencaFotoRepositorio.ts";
export async function aprovarLeitura(user, contexto, leituraId, linhas) {
  if (!contexto.podeAprovar) throw falha(403, "Somente o Chanceler titular ou designado para esta sessão pode aprovar.");
  const leitura = contexto.leituras.find((item) => item.id === leituraId);
  if (!leitura) throw falha(404, "Leitura não encontrada.");
  if (leitura.status === "Aprovada") throw falha(409, "Esta leitura já foi aprovada. Atualize a página.");
  if (!Array.isArray(linhas) || linhas.length !== leitura.linhas.length) throw falha(400, "Revise todas as linhas da leitura.");
  const irmaos = await irmaosAtivos();
  const idsLinhas = new Set(), idsIrmaos = new Set();
  const revisadas = leitura.linhas.map((original) => {
    const candidatas = linhas.filter((item) => item.id === original.id);
    if (candidatas.length !== 1 || idsLinhas.has(original.id)) throw falha(400, "Linha duplicada ou inválida.");
    idsLinhas.add(original.id);
    const linha = candidatas[0];
    const presente = linha.presente === true;
    const irmao = irmaos.find((item) => item.id === linha.irmao_id);
    if (presente && (!irmao || idsIrmaos.has(irmao.id))) throw falha(400, "Selecione um irmão cadastrado diferente para cada presença aprovada.");
    if (presente) idsIrmaos.add(irmao.id);
    return { ...original, presente, irmao_id: irmao?.id || "", irmao_nome: irmao?.nome_completo || "" };
  });
  const selecionados = irmaos.filter((item) => idsIrmaos.has(item.id));
  if (!selecionados.length) throw falha(400, "Selecione ao menos uma presença para aprovar.");
  const sessaoId = encodeURIComponent(contexto.sessao.id);
  const filtroIds = selecionados.map((item) => encodeURIComponent(item.id)).join(",");
  const existentes = await rest(`presenca?select=id,irmao_id&sessao_id=eq.${sessaoId}&irmao_id=in.(${filtroIds})`);
  const novos = selecionados.filter((item) => !existentes.some((p) => p.irmao_id === item.id)).map((ir) => ({ sessao_id: contexto.sessao.id, sessao_data: contexto.sessao.data, irmao_id: ir.id, irmao_nome: ir.nome_completo, irmao_cim: ir.numero_glp, presente: true, dispensado: false, justificativa: "", justificativa_aceita: false }));
  if (novos.length) await rest("presenca", "POST", novos);
  const registros = await rest(`presenca?sessao_id=eq.${sessaoId}&irmao_id=in.(${filtroIds})`, "PATCH", { presente: true, dispensado: false });
  const atual = await contextoPresenca(user, contexto.sessao.id);
  const aprovada = { ...leitura, linhas: revisadas, status: "Aprovada", aprovado_em: new Date().toISOString(), aprovado_por: contexto.irmao.nome_completo, aprovado_por_id: user.id };
  await salvarLeituras(atual, atual.leituras.map((item) => item.id === leituraId ? aprovada : item));
  return { leitura: aprovada, presencas: registros };
}