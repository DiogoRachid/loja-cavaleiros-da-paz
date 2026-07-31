import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { tipo, dados } = await req.json();

    if (tipo === "acesso") {
      await base44.asServiceRole.entities.LogAcesso.create(dados);
    } else if (tipo === "download") {
      await base44.asServiceRole.entities.LogDownload.create(dados);
    } else {
      return Response.json({ error: "Tipo inválido" }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});