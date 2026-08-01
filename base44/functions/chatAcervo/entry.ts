// base44/functions/chatAcervo/entry.ts
//
// Recebe uma pergunta do usuário, busca os trechos mais relevantes do acervo
// (via embedding + pgvector, COMPLEMENTADA por busca direta de autor/título
// quando a pergunta contém nomes próprios) e gera uma resposta usando o LLM
// configurado (roteado pela API própria em api.arquitetus.com -> OpenRouter).
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

interface DocumentoAcervo {
  id: string;
  titulo: string;
  autor: string | null;
  grau_minimo: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE2_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE2_SERVICE_ROLE_KEY")!;
const EMBED_API_URL = Deno.env.get("EMBED_API_URL")!;
const EMBED_API_SECRET = Deno.env.get("EMBED_API_SECRET")!;
const ARQUITETUS_API_URL = Deno.env.get("ARQUITETUS_API_URL")!;
const ARQUITETUS_API_TOKEN = Deno.env.get("ARQUITETUS_API_TOKEN")!;
const ARQUITETUS_MODEL = Deno.env.get("ARQUITETUS_MODEL") ?? "openrouter/free";

const MATCH_COUNT = 12; // mais trechos = mais material para uma resposta completa com múltiplas fontes
const SIMILARITY_MIN = 0.15; // abaixo disso, ignora (RPC já filtra, mas fica de guarda aqui também)
const CHUNKS_POR_DOC_AUTOR = 4; // quantos chunks trazer de cada documento achado por nome de autor/título

const GRAU_ORDEM: Record<string, number> = { Aprendiz: 1, Companheiro: 2, Mestre: 3 };

// Palavras comuns em português que começam maiúscula só por estarem no início
// de frase, ou que aparecem capitalizadas com frequência sem serem nomes próprios.
// Filtra essas para não gerar buscas inúteis (ex: "O", "Livro", "Da", "Lei").
const PALAVRAS_IGNORADAS = new Set([
  "O", "A", "Os", "As", "Um", "Uma", "De", "Do", "Da", "Dos", "Das",
  "Em", "No", "Na", "Nos", "Nas", "E", "Ou", "Que", "Qual", "Quais",
  "Como", "Quando", "Onde", "Por", "Para", "Com", "Sem", "Sobre",
  "Fale", "Fala", "Me", "Meu", "Minha", "Explique", "Explica", "Diga",
  "Livro", "Lei", "Grau", "Loja", "Ritual", "Maçonaria", "Maçônica",
  "Maçônico", "Segundo", "Conforme", "Grande",
]);

function gerarEmbedding(texto: string): Promise<number[]> {
  return fetch(EMBED_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": EMBED_API_SECRET,
    },
    body: JSON.stringify({ texto }),
  }).then(async (resp) => {
    if (!resp.ok) {
      const erro = await resp.text();
      throw new Error(`Falha ao gerar embedding (${resp.status}): ${erro}`);
    }
    const data = await resp.json();
    return data.embedding as number[];
  });
}

async function buscarTrechosSemanticos(
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

/**
 * Extrai possíveis nomes próprios (de autor ou parte de título) da pergunta,
 * com base em palavras capitalizadas que não são o início de frase nem
 * palavras comuns do domínio (ex: "Livro", "Lei", "Grau").
 */
function extrairNomesProprios(pergunta: string): string[] {
  const palavras = pergunta
    .replace(/[?!.,;:]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const candidatos: string[] = [];

  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    const pareceNomeProprio = /^[A-ZÀ-Ý][a-zà-ÿ]+$/.test(palavra);
    if (!pareceNomeProprio) continue;
    if (PALAVRAS_IGNORADAS.has(palavra)) continue;
    // Ignora a primeira palavra da frase inteira (normalmente é só a
    // capitalização natural do início da pergunta, ex: "Fale sobre...").
    if (i === 0) continue;
    candidatos.push(palavra);
  }

  // Junta nomes consecutivos (ex: "Charles Boller" em vez de duas buscas separadas)
  const agrupados: string[] = [];
  let atual = "";
  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    const ehCandidato = candidatos.includes(palavra);
    if (ehCandidato) {
      atual = atual ? `${atual} ${palavra}` : palavra;
    } else if (atual) {
      agrupados.push(atual);
      atual = "";
    }
  }
  if (atual) agrupados.push(atual);

  return [...new Set(agrupados)];
}

/**
 * Busca documentos cujo autor ou título contenha algum dos termos extraídos
 * da pergunta, respeitando o grau do usuário. Retorna os primeiros chunks
 * de cada documento encontrado (não é busca semântica, é busca estrutural).
 */
async function buscarPorAutorOuTitulo(
  termos: string[],
  grauUsuario: string,
): Promise<TrechoEncontrado[]> {
  if (termos.length === 0) return [];

  const grauMax = GRAU_ORDEM[grauUsuario] ?? 1;
  const graisPermitidos = Object.entries(GRAU_ORDEM)
    .filter(([, v]) => v <= grauMax)
    .map(([k]) => k);

  const filtroOu = termos
    .map((t) => `autor.ilike.*${encodeURIComponent(t)}*,titulo.ilike.*${encodeURIComponent(t)}*`)
    .join(",");

  const filtroGrau = graisPermitidos.map((g) => `"${g}"`).join(",");

  const url =
    `${SUPABASE_URL}/rest/v1/acervo_digital` +
    `?select=id,titulo,autor,grau_minimo` +
    `&ativo=eq.true&disponivel=eq.true` +
    `&grau_minimo=in.(${filtroGrau})` +
    `&or=(${filtroOu})`;

  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!resp.ok) {
    // Não trava a resposta principal por causa dessa busca complementar;
    // apenas loga e segue sem esses resultados extras.
    console.error("Falha na busca por autor/título:", await resp.text());
    return [];
  }

  const documentos = (await resp.json()) as DocumentoAcervo[];
  if (documentos.length === 0) return [];

  const trechosExtras: TrechoEncontrado[] = [];

  for (const doc of documentos) {
    const respChunks = await fetch(
      `${SUPABASE_URL}/rest/v1/acervo_chunk` +
        `?select=conteudo,acervo_id` +
        `&acervo_id=eq.${doc.id}` +
        `&order=ordem.asc` +
        `&limit=${CHUNKS_POR_DOC_AUTOR}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );

    if (!respChunks.ok) continue;

    const chunks = (await respChunks.json()) as { conteudo: string; acervo_id: string }[];
    for (const c of chunks) {
      trechosExtras.push({
        acervo_id: doc.id,
        conteudo: c.conteudo,
        titulo: doc.titulo,
        similarity: 1, // marcador: veio de busca estrutural exata, não semântica
      });
    }
  }

  return trechosExtras;
}

function mesclarTrechos(
  semanticos: TrechoEncontrado[],
  porAutor: TrechoEncontrado[],
): TrechoEncontrado[] {
  const vistos = new Set(semanticos.map((t) => `${t.acervo_id}:${t.conteudo.slice(0, 50)}`));
  const extras = porAutor.filter(
    (t) => !vistos.has(`${t.acervo_id}:${t.conteudo.slice(0, 50)}`),
  );
  // Resultados de autor/título entram primeiro: são uma correspondência exata
  // de nome, então merecem prioridade sobre a similaridade semântica aproximada.
  return [...extras, ...semanticos];
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

  // Os rótulos [T1], [T2]... existem só para o modelo referenciar internamente
  // qual trecho fundamenta qual afirmação — eles NUNCA devem aparecer na resposta final.
  const contexto = trechos
    .map(
      (t, i) =>
        `[T${i + 1} - fonte: "${t.titulo}"]\n${t.conteudo.slice(0, 1000)}`,
    )
    .join("\n\n---\n\n");

  return (
    `Você é um assistente de biblioteca digital para estudo. Responda a pergunta do usuário ` +
    `usando APENAS as informações dos trechos abaixo, extraídos do acervo.\n\n` +
    `REGRAS DE ESTILO (siga rigorosamente):\n` +
    `- Elabore uma resposta completa e rica, explorando os diferentes ângulos, autores e ` +
    `perspectivas que os trechos trouxerem sobre o tema perguntado. Se dois documentos abordam ` +
    `o assunto de formas diferentes ou complementares, apresente ambos e relacione-os.\n` +
    `- Organize a resposta em seções ou parágrafos temáticos, com um pequeno título em negrito ` +
    `quando fizer sentido separar por sub-tema ou por fonte relevante.\n` +
    `- Ao usar uma informação de um documento específico, cite o TÍTULO REAL do documento por ` +
    `extenso (ex: "segundo 'O Livro do Aprendiz'..."), nunca um rótulo interno como "[T1]", ` +
    `"Fonte 1" ou similar — esses rótulos são só para você localizar o trecho, o usuário não deve vê-los.\n` +
    `- Se a pergunta menciona um nome de autor específico e algum trecho vier de um documento ` +
    `desse autor, deixe isso claro logo no início da resposta. Se NENHUM trecho for desse autor ` +
    `específico, diga isso claramente logo no início, e só então, se fizer sentido, complemente ` +
    `com o que os outros trechos disponíveis dizem sobre o tema em geral.\n` +
    `- Termine SEMPRE com um parágrafo final de síntese, iniciado por "**Em resumo:**", que amarre ` +
    `os pontos principais em poucas frases.\n` +
    `- Não invente conteúdo que não esteja nos trechos. Se a resposta não estiver neles, diga isso ` +
    `claramente em vez de complementar com conhecimento geral.\n\n` +
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
            "Você é um assistente de consulta bibliográfica, objetivo, direto e conciso, " +
            "que só responde com base nos trechos fornecidos. Evita repetição e não usa " +
            "marcadores de fonte internos (tipo [T1] ou 'Fonte 1') na resposta ao usuário.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
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

    // 1. Embedding da pergunta + busca semântica
    const embedding = await gerarEmbedding(body.pergunta);
    const trechosSemanticos = await buscarTrechosSemanticos(embedding, grauUsuario);

    // 2. Busca complementar: nomes próprios na pergunta podem ser autor/título
    const nomesProprios = extrairNomesProprios(body.pergunta);
    const trechosPorAutor = await buscarPorAutorOuTitulo(nomesProprios, grauUsuario);

    // 3. Mescla os dois conjuntos (autor/título tem prioridade)
    const trechos = mesclarTrechos(trechosSemanticos, trechosPorAutor);

    // 4. Monta prompt e chama o LLM
    const prompt = montarPrompt(body.pergunta, trechos);
    const resposta = await chamarLLM(prompt);

    // 5. Monta lista de fontes únicas citadas
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
