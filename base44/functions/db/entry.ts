import { listar, obter, criar, atualizar, excluir, excluirMuitos } from "../../shared/supabase.ts";
import { mascararLinks, origemApp } from "../../shared/storage.ts";
import listarAvaliacoes from "../../shared/listarAvaliacoes.ts";

export default async function(req) {
  try {
    const body = await req.json();
    const { operacao, tabela, id, filtro, sort, limit, offset } = body || {};
    const supabaseUrl = Deno.env.get("SUPABASE2_URL") || "";
    // Nunca grava o endereço direto do Supabase: salva sempre o link mascarado.
    const dados = mascararLinks(body?.dados, supabaseUrl, origemApp(req));

    let resultado;
    switch (operacao) {
      case "listar":
        resultado = tabela === "avaliacao"
          ? await listarAvaliacoes({ filtro, sort, limit, offset })
          : await listar(tabela, { filtro, sort, limit, offset });
        break;
      case "obter":
        resultado = await obter(tabela, id);
        break;
      case "criar":
        resultado = await criar(tabela, dados);
        break;
      case "atualizar":
        resultado = await atualizar(tabela, id, dados);
        break;
      case "excluir":
        resultado = await excluir(tabela, id);
        break;
      case "excluirMuitos":
        resultado = await excluirMuitos(tabela, filtro);
        break;
      default:
        return Response.json({ error: "Operação inválida: " + operacao }, { status: 400 });
    }

    return Response.json({ data: mascararLinks(resultado, supabaseUrl, origemApp(req)) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}