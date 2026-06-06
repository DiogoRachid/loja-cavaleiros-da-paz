import { base44 } from "@/api/base44Client";

export async function autoRealizarSessoes() {
  const sessoes = await base44.entities.Sessao.filter({ status: "Agendada" });
  const agora = new Date();

  for (const sessao of sessoes) {
    if (!sessao.data || !sessao.hora) continue;
    const [ano, mes, dia] = sessao.data.split("-").map(Number);
    const [hora, minuto] = sessao.hora.split(":").map(Number);
    const dataSessao = new Date(ano, mes - 1, dia, hora, minuto);

    if (agora > dataSessao) {
      await base44.entities.Sessao.update(sessao.id, { status: "Realizada" });
    }
  }
}