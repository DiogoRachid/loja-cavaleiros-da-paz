import { db } from "@/api/db";

export async function autoRealizarSessoes() {
  const sessoes = await db.Sessao.filter({ status: "Agendada" }, "-data", 200);
  const agora = new Date();

  for (const sessao of sessoes) {
    if (!sessao.data || !sessao.hora) continue;
    const [ano, mes, dia] = sessao.data.split("-").map(Number);
    const [hora, minuto] = sessao.hora.split(":").map(Number);
    const dataSessao = new Date(ano, mes - 1, dia, hora, minuto);

    if (agora > dataSessao) {
      await db.Sessao.update(sessao.id, { status: "Realizada" });
    }
  }
}