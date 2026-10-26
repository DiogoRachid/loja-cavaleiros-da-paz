import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { contextoPresenca, irmaosAtivos, salvarLeituras, falha } from "../../shared/presencaFotoRepositorio.ts";
import { decodificarImagem, guardarImagem, lerImagem, apagarImagem } from "../../shared/presencaFotoStorage.ts";
import { extrairLista, conciliarLinhas } from "../../shared/presencaFotoIA.ts";
import { aprovarLeitura } from "../../shared/presencaFotoAprovacao.ts";

function respostaErro(error) {
  const status = Number(error?.status) || 500;
  return Response.json({ error: status === 500 ? "Não foi possível concluir a leitura." : error.message }, { status });
}
export default async function(req) {
  try {
    if (req.method !== "POST") return Response.json({ error: "Método não permitido." }, { status: 405 });
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const acao = body.acao || "listar";
    if (!body.sessao_id || typeof body.sessao_id !== "string") return Response.json({ error: "Selecione uma sessão." }, { status: 400 });
    const contexto = await contextoPresenca(user, body.sessao_id);
    if (acao === "listar") return Response.json({ leituras: contexto.leituras, pode_aprovar: contexto.podeAprovar });
    if (acao === "imagem") {
      const leitura = contexto.leituras.find((item) => item.id === body.leitura_id);
      if (!leitura) throw falha(404, "Leitura não encontrada.");
      return Response.json({ imagem: await lerImagem(leitura.imagem_path) });
    }
    if (acao === "aprovar") return Response.json(await aprovarLeitura(user, contexto, body.leitura_id, body.linhas));
    if (acao !== "processar") return Response.json({ error: "Ação inválida." }, { status: 400 });
    const { bytes, tipo } = decodificarImagem(body.imagem);
    const id = crypto.randomUUID();
    const extensao = tipo === "image/png" ? "png" : tipo === "image/webp" ? "webp" : "jpg";
    const caminho = `${contexto.sessao.id}/${id}.${extensao}`;
    await guardarImagem(caminho, bytes, tipo);
    try {
      const extraido = await extrairLista(body.imagem);
      const irmaos = await irmaosAtivos();
      const conciliado = conciliarLinhas(extraido, irmaos, contexto.sessao.data);
      const leitura = { id, status: "Pendente", imagem_path: caminho, criado_em: new Date().toISOString(), enviado_por: contexto.irmao?.nome_completo || user.full_name || user.email, aviso: conciliado.aviso, linhas: conciliado.linhas };
      const atual = await contextoPresenca(user, body.sessao_id);
      await salvarLeituras(atual, [...atual.leituras, leitura]);
      return Response.json({ leitura, pode_aprovar: contexto.podeAprovar });
    } catch (error) {
      await apagarImagem(caminho);
      throw error;
    }
  } catch (error) {
    console.error("Erro na leitura da lista de presença:", error);
    return respostaErro(error);
  }
}