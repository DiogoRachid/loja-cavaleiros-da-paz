import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tipo, nome, grau, autor } = await req.json();

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_WHATSAPP_FROM");
  const to = Deno.env.get("WHATSAPP_DESTINO");

  const grauEmoji = { "Aprendiz": "🔵", "Companheiro": "🟡", "Mestre": "🔴" }[grau] || "📚";

  const mensagem = `📚 *Nova obra adicionada ao acervo!*\n\n*Tipo:* ${tipo}\n*Título:* ${nome}${autor ? `\n*Autor:* ${autor}` : ""}\n*Grau mínimo:* ${grauEmoji} ${grau || "Aprendiz"}\n\n_Loja Cavaleiros da Paz nº25_`;

  const body = new URLSearchParams({
    From: from,
    To: to,
    Body: mensagem,
  });

  const response = await fetch(
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

  const data = await response.json();

  if (!response.ok) {
    return Response.json({ error: data.message }, { status: response.status });
  }

  return Response.json({ success: true, sid: data.sid });
});