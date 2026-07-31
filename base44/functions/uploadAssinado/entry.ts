import { BUCKET } from "../../shared/storage.ts";

// Gera uma URL assinada para o navegador enviar o arquivo direto ao Storage do Supabase 2.
Deno.serve(async (req) => {
  try {
    const { nome } = await req.json();
    if (!nome) return Response.json({ error: "nome do arquivo é obrigatório" }, { status: 400 });

    const base = (Deno.env.get("SUPABASE2_URL") || "").replace(/\/$/, "");
    const key = Deno.env.get("SUPABASE2_SERVICE_ROLE_KEY");
    if (!base || !key) return Response.json({ error: "Supabase 2 não configurado" }, { status: 500 });

    const limpo = String(nome).split("/").pop()!.replace(/[^a-zA-Z0-9._-]/g, "_");
    const caminho = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${limpo}`;

    const res = await fetch(`${base}/storage/v1/object/upload/sign/${BUCKET}/${caminho}`, {
      method: "POST",
      headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) return Response.json({ error: await res.text() }, { status: 500 });
    const { url } = await res.json();

    return Response.json({
      upload_url: base + "/storage/v1" + url.replace(/^\/storage\/v1/, ""),
      file_url: `${base}/storage/v1/object/public/${BUCKET}/${caminho}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});