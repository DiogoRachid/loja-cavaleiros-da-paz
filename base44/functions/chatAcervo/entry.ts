// base44/functions/chatAcervo/entry.ts
//
// Recebe uma pergunta do usuário, busca os trechos mais relevantes do acervo
// (via embedding + pgvector) e gera uma resposta usando o LLM configurado
// (roteado pela API própria em api.arquitetus.com -> OpenRouter).
//
// Variáveis de ambiente necessárias (configurar no painel do base44):
//   SUPABASE2_URL             - já existente no projeto
//   SUPABASE2_SERVICE_ROLE_KEY- já existente no projeto
//   EMBED_API_URL             - https://supabase.rachid.dpdns.org/embed-api/embed
//   EMBED_API_SECRET          - a mesma chave usada no .env do VPS
//   ARQUITETUS_API_URL        - https://api.arquitetus.com/v1
//   ARQUITETUS_API_TOKEN      - seu token
//   ARQUITETUS_MODEL          - openrouter/free (ajustar se der erro de modelo)

interface PedidoChat {
  pergunta: string;
  grau_usuario: string; // ex: "Aprendiz", "Companheiro", "Mestre"
}

interface TrechoEncontrado {
  acervo_id: string;
  conteudo: string;
  titulo: string;
  similarity: number;
}

const SUPABASE_URL = Deno.env.get("SUPABASE2_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE2_SERVICE_ROLE_KEY")!;
const EMBED_API_URL = Deno.env.get("EMBED_API_URL")!;
const EMBED_API_SECRET = Deno.env.get("EMBED_API_SECRET")!;
const ARQUITETUS_API_URL = Deno.env.get("ARQUITETUS_API_URL")!;
const ARQUITETUS_API_TOKEN = Deno.env.get("ARQUITETUS_API_TOKEN")!;
const ARQUITETUS_MODEL = Deno.env.get("ARQUITETUS_MODEL") ?? "openrouter/free";

const MATCH_COUNT = 10; // quantos trechos trazer para o contexto
const SIMILARITY_MIN = 0.15; // abaixo disso, ignora (RPC já filtra, mas fica de guarda aqui também)

async function gerarEmbedding(texto: string): Promise<number[]> {
  const resp = await fetch(EMBED_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": EMBED_API_SECRET,
    },
    body: JSON.stringify({ texto }),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Falha ao gerar embedding (${resp.status}): ${erro}`);
  }

  const data = await resp.json();
  return data.embedding as number[];
}

async function buscarTrechos(
  embedding: number[],
  grauUsuario: string,
): Promise<TrechoEncontrado[]> {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_chunks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_count: MATCH_COUNT,
      grau_usuario: grauUsuario,
    }),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Falha ao buscar trechos (${resp.status}): ${erro}`);
  }

  const trechos = (await resp.json()) as TrechoEncontrado[];
  return trechos.filter((t) => t.similarity >= SIMILARITY_MIN);
}

function montarPrompt(pergunta: string, trechos: TrechoEncontrado[]): string {
  if (trechos.length === 0) {
    return (
      `O usuário perguntou: "${pergunta}"\n\n` +
      `Não foram encontrados trechos relevantes no acervo para essa pergunta. ` +
      `Responda educadamente que não encontrou informação sobre isso no acervo digital disponível, ` +
      `sem inventar conteúdo.`
    );
  }

  const contexto = trechos
    .map(
      (t, i) =>
        `[Fonte ${i + 1} - "${t.titulo}"]\n${t.conteudo.slice(0, 1000)}`,
    )
    .join("\n\n---\n\n");

  return (
    `Você é um assistente de biblioteca digital. Responda a pergunta do usuário ` +
    `usando APENAS as informações dos trechos abaixo, extraídos do acervo. ` +
    `Se a resposta não estiver nos trechos, diga que não encontrou essa informação no acervo. ` +
    `Sempre que possível, cite o título da fonte usada entre parênteses ao final da afirmação.\n\n` +
    `=== TRECHOS DO ACERVO ===\n\n${contexto}\n\n=== FIM DOS TRECHOS ===\n\n` +
    `Pergunta do usuário: ${pergunta}`
  );
}

async function chamarLLM(prompt: string): Promise<string> {
  const resp = await fetch(`${ARQUITETUS_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARQUITETUS_API_TOKEN}`,
    },
    body: JSON.stringify({
      model: ARQUITETUS_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de consulta bibliográfica, objetivo e preciso, que só responde com base nos trechos fornecidos.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    throw new Error(`Falha ao chamar LLM (${resp.status}): ${erro}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "Não foi possível gerar uma resposta.";
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ erro: "Método não permitido" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as PedidoChat;

    if (!body.pergunta || !body.pergunta.trim()) {
      return new Response(JSON.stringify({ erro: "Pergunta vazia" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const grauUsuario = body.grau_usuario || "Aprendiz";

    // 1. Embedding da pergunta
    const embedding = await gerarEmbedding(body.pergunta);

    // 2. Busca de trechos relevantes (já filtrando por grau_minimo dentro do match_chunks)
    const trechos = await buscarTrechos(embedding, grauUsuario);

    // 3. Monta prompt e chama o LLM
    const prompt = montarPrompt(body.pergunta, trechos);
    const resposta = await chamarLLM(prompt);

    // 4. Monta lista de fontes únicas citadas
    const fontesUnicas = Array.from(
      new Map(trechos.map((t) => [t.acervo_id, t.titulo])).entries(),
    ).map(([acervo_id, titulo]) => ({ acervo_id, titulo }));

    return new Response(
      JSON.stringify({
        resposta,
        fontes: fontesUnicas,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Erro em chatAcervo:", err);
    return new Response(
      JSON.stringify({ erro: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
