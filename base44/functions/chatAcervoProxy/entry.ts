Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();

    const resp = await fetch("https://supabase.rachid.dpdns.org/functions/v1/chatAcervo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-chat-secret": Deno.env.get("VITE_CHAT_ACERVO_SECRET") ?? "",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok || !resp.body) {
      const erro = await resp.text();
      return Response.json({ erro: `Falha na Edge Function (${resp.status}): ${erro}` }, { status: 500 });
    }

    // A Edge Function agora retorna um stream de texto: primeira linha
    // "__FONTES__[...]", seguida do texto da resposta em markdown puro.
    // Como o base44 não repassa streaming de verdade pro cliente, lemos
    // tudo aqui e devolvemos como JSON estruturado, igual antes.
    const textoCompleto = await resp.text();
    const quebraLinha = textoCompleto.indexOf("\n");

    let fontes = [];
    let resposta = textoCompleto;

    if (quebraLinha !== -1) {
      const primeiraLinha = textoCompleto.slice(0, quebraLinha);
      if (primeiraLinha.startsWith("__FONTES__")) {
        try {
          fontes = JSON.parse(primeiraLinha.slice("__FONTES__".length));
        } catch {
          fontes = [];
        }
        resposta = textoCompleto.slice(quebraLinha + 1);
      }
    }

    return Response.json({ resposta, fontes }, { status: 200 });
  } catch (err) {
    return Response.json({ erro: String(err) }, { status: 500 });
  }
});
