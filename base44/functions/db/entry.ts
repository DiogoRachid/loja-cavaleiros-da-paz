import { listar, obter, criar, atualizar, excluir, excluirMuitos } from "../../shared/supabase.ts";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { operacao, tabela, id, dados, filtro, sort, limit } = body || {};

    let resultado;
    switch (operacao) {
      case "listar":
        resultado = await listar(tabela, { filtro, sort, limit });
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

    return Response.json({ data: resultado });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});