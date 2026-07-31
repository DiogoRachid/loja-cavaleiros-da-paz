import { listar } from "../../shared/supabase.ts";

const CAMPOS = {
  irmao: ["foto_url"],
  item: ["imagem_capa"],
  acervo_digital: ["arquivo_url", "capa_url"],
  minha_mp3: ["file_url"],
  dados_loja: ["logo_url"],
};

// Conta, no Supabase externo, quantos registros ainda apontam para arquivos hospedados no Base44.
Deno.serve(async () => {
  try {
    const relatorio = {};
    for (const [tabela, campos] of Object.entries(CAMPOS)) {
      const linhas = await listar(tabela);
      for (const campo of campos) {
        const pendentes = linhas.filter((l) => typeof l[campo] === "string" && /base44\.com|base44\.app/.test(l[campo]));
        relatorio[`${tabela}.${campo}`] = { total: linhas.length, noBase44: pendentes.length, exemplos: pendentes.slice(0, 2).map((l) => l[campo]) };
      }
    }
    return Response.json(relatorio);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});