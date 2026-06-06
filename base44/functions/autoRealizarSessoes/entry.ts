import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sessoes = await base44.asServiceRole.entities.Sessao.filter({ status: "Agendada" });
    
    const agora = new Date();
    let atualizadas = 0;

    for (const sessao of sessoes) {
      if (!sessao.data || !sessao.hora) continue;
      
      // Montar data/hora da sessão (formato: YYYY-MM-DD e HH:MM)
      const [ano, mes, dia] = sessao.data.split("-").map(Number);
      const [hora, minuto] = sessao.hora.split(":").map(Number);
      const dataSessao = new Date(ano, mes - 1, dia, hora, minuto);
      
      if (agora > dataSessao) {
        await base44.asServiceRole.entities.Sessao.update(sessao.id, { status: "Realizada" });
        atualizadas++;
      }
    }

    return Response.json({ success: true, atualizadas });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});