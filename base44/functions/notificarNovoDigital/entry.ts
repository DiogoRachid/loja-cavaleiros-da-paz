import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const payload = await req.json();

  const { data } = payload;
  if (!data) return Response.json({ ok: true });

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM");
  const to = Deno.env.get("WHATSAPP_DESTINO");

  const grauEmoji = { "Aprendiz": "🔵", "Companheiro": "🟡", "Mestre": "🔴" }[data.grau_minimo] || "📄";

  const mensagem = `📄 *Novo documento disponível no acervo digital!*\n\n*Tipo:* ${data.tipo || "Documento"}\n*Título:* ${data.titulo}${data.autor ? `\n*Autor:* ${data.autor}` : ""}\n*Grau mínimo:* ${grauEmoji} ${data.grau_minimo || "Aprendiz"}\n\n_Loja Cavaleiros da Paz nº25_`;

  const destinatarios = to.split(",").map(n => n.trim());

  for (const destinatario of destinatarios) {
    const body = new URLSearchParams({ From: from, To: destinatario, Body: mensagem });
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );
  }

  return Response.json({ ok: true });
});