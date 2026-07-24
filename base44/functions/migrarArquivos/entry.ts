import { listar, atualizar } from "../../shared/supabase.ts";
import { garantirBucket, migrarArquivo, nomeSeguro, BUCKET } from "../../shared/storage.ts";

// Grupos de arquivos: tabela + campos que guardam URLs.
const GRUPOS: Record<string, { tabela: string; campos: string[] }> = {
  fotos: { tabela: "irmao", campos: ["foto_url"] },
  acervo: { tabela: "acervo_digital", campos: ["arquivo_url", "capa_url"] },
  logo: { tabela: "dados_loja", campos: ["logo_url"] },
  musicas: { tabela: "minha_mp3", campos: ["file_url"] },
};

Deno.serve(async (req) => {
  try {
    const { grupo, limite = 20, apenasContar = false } = (await req.json()) || {};
    const cfg = GRUPOS[grupo];
    if (!cfg) {
      return Response.json({ error: "Grupo inválido. Use: " + Object.keys(GRUPOS).join(", ") }, { status: 400 });
    }

    const linhas = await listar(cfg.tabela, { limit: 5000 });

    // Pendentes = ainda apontam para o storage do Base44
    const pendentes = linhas.filter((l: any) =>
      cfg.campos.some((c) => typeof l[c] === "string" && l[c].includes("base44"))
    );

    if (apenasContar) {
      return Response.json({ grupo, total_registros: linhas.length, pendentes: pendentes.length });
    }

    await garantirBucket();

    const lote = pendentes.slice(0, limite);
    let migrados = 0;
    let bytesTotal = 0;
    const erros: string[] = [];

    for (const linha of lote) {
      const patch: Record<string, string> = {};
      for (const campo of cfg.campos) {
        const origem = linha[campo];
        if (typeof origem !== "string" || !origem.includes("base44")) continue;
        try {
          const caminho = grupo + "/" + nomeSeguro(origem, linha.id);
          const { publicUrl, bytes } = await migrarArquivo(origem, caminho);
          patch[campo] = publicUrl;
          bytesTotal += bytes;
        } catch (e) {
          erros.push(linha.id + " (" + campo + "): " + e.message);
        }
      }
      if (Object.keys(patch).length > 0) {
        await atualizar(cfg.tabela, linha.id, patch);
        migrados++;
      }
    }

    return Response.json({
      grupo,
      bucket: BUCKET,
      migrados,
      mb_enviados: +(bytesTotal / 1024 / 1024).toFixed(2),
      restantes: pendentes.length - lote.length,
      erros,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});