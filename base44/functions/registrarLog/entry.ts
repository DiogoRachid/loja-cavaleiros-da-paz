import { criar } from "../../shared/supabase.ts";

Deno.serve(async (req) => {
  try {
    const { tipo, dados } = await req.json();

    if (tipo === "acesso") {
      await criar("log_acesso", dados);
    } else if (tipo === "download") {
      await criar("log_download", dados);
    } else {
      return Response.json({ error: "Tipo inválido" }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});