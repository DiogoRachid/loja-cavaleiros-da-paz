// Função chatAcervo: recebe uma pergunta do irmão, busca os trechos mais
// relevantes do acervo digital (via embedding + pgvector) e usa a API própria
// (que roteia para o OpenRouter, modelo free) para gerar a resposta com base
// apenas nesses trechos, citando as fontes.

function configSupabase() {
  const url = Deno.env.get("SUPABASE2_URL");
  const key = Deno.env.get("SUPABASE2_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE2_URL / SUPABASE2_SERVICE_ROLE_KEY não configurados");
  return { url: url.replace(/\/$/, ""), key };
}

function configEmbedApi() {
  const url = Deno.env.get("EMBED_API_URL"); // ex: https://supabase.rachid.dpdns.org/embed-api/embed
  const key = Deno.env.get("EMBED_API_SECRET");
  if (!url || !key) throw new Error("EMBED_API_URL / EMBED_API_SECRET não configurados");
  return { url, key };
}

function configLLM() {
  const url = Deno.env.get("ARQUITETUS_API_URL"); // ex: https://api.arquitetus.com/v1
  const token = Deno.env.get("ARQUITETUS_API_TOKEN");
  const modelo = Deno.env.get("ARQUITETUS_MODEL"); // ex: "nvidia/nemotron-...-free" ou o id que você usa
  if (!url || !token || !modelo) {
    throw new Error("ARQUITETUS_API_URL / ARQUITETUS_API_TOKEN / ARQUITETUS_MODEL não configurados");
  }
  return { url: url.replace(/\/$/, ""), token, modelo };
}

// Gera o embedding da pergunta chamando o serviço no VPS
async function embedPergunta(texto) {
  const { url, key } = configEmbedApi();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": key },
    body: JSON.stringify({ texto }),
  });
  if (!res.ok) throw new Error("Falha ao gerar embedding: " + (await res.text()));
  const data = await res.json();
  return data.embedding;
}

// Busca os trechos mais relevantes no Supabase via a função match_chunks (RPC)
async function buscarTrechos(embedding, grauUsuario, quantidade = 6) {
  const { url, key } = configSupabase();
  const res = await fetch(url + "/rest/v1/rpc/match_chunks", {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: quantidade,
      grau_usuario: grauUsuario || "Aprendiz",
    }),
  });
  if (!res.ok) throw new Error("Falha na busca de trechos: " + (await res.text()));
  return await res.json();
}

// Monta o prompt com os trechos encontrados e chama a API própria (OpenRouter)
async function gerarResposta(pergunta, trechos) {
  const { url, token, modelo } = configLLM();

  const contexto = trechos
    .map((t, i) => `[Fonte ${i + 1}: "${t.titulo}"${t.autor ? " — " + t.autor : ""}]\n${t.conteudo}`)
    .join("\n\n---\n\n");

  const systemPrompt =
    "Você é o assistente de consulta da biblioteca digital de uma loja maçônica. " +
    "Responda à pergunta do irmão usando APENAS as informações presentes nos trechos fornecidos abaixo. " +
    "Se a resposta não estiver nos trechos, diga claramente que não encontrou essa informação no acervo, " +
    "sem inventar conteúdo. Sempre que possível, cite de qual fonte (livro/documento) veio cada informação, " +
    "usando o formato (Fonte: \"Título\"). Responda em português, de forma clara e respeitosa.";

  const userPrompt = `Trechos do acervo:\n\n${contexto}\n\n---\n\nPergunta do irmão: ${pergunta}`;

  const res = await fetch(url + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) throw new Error("Falha ao chamar o modelo: " + (await res.text()));
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  try {
    const { pergunta, grau_usuario } = await req.json();

    if (!pergunta || !pergunta.trim()) {
      return Response.json({ error: "Pergunta vazia" }, { status: 400 });
    }

    const embedding = await embedPergunta(pergunta);
    const trechos = await buscarTrechos(embedding, grau_usuario, 6);

    // filtra trechos muito pouco relevantes (ruído), mantendo só os realmente próximos
    const trechosRelevantes = trechos.filter((t) => t.similarity > 0.35);

    if (trechosRelevantes.length === 0) {
      return Response.json({
        resposta:
          "Não encontrei nenhum trecho relevante no acervo digital para responder essa pergunta. " +
          "Tente reformular ou consulte diretamente o bibliotecário.",
        fontes: [],
      });
    }

    const resposta = await gerarResposta(pergunta, trechosRelevantes);

    // remove duplicatas de fonte (mesmo livro pode aparecer em vários trechos)
    const fontesMap = new Map();
    for (const t of trechosRelevantes) {
      if (!fontesMap.has(t.acervo_id)) {
        fontesMap.set(t.acervo_id, {
          titulo: t.titulo,
          autor: t.autor,
          arquivo_url: t.arquivo_url,
          similaridade: Math.round(t.similarity * 100) / 100,
        });
      }
    }

    return Response.json({
      resposta,
      fontes: Array.from(fontesMap.values()),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
