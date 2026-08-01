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

    const data = await resp.json();
    return Response.json(data, { status: resp.status });
  } catch (err) {
    return Response.json({ erro: String(err) }, { status: 500 });
  }
});
