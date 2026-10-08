import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ erro: "Acesso não autorizado" }, { status: 401 });
    const body = await req.json();
    const result = await base44.functions.invoke("chatAcervo", {
      pergunta: body.pergunta,
      grau_usuario: body.grau_usuario,
    });
    return Response.json(result.data);
  } catch (err) {
    return Response.json({ erro: "Não foi possível consultar o acervo." }, { status: 500 });
  }
}