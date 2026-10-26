// Calendário hebraico nativo do navegador, sem chamadas a serviços externos.
// A circular 011-2026/2029 fixa 5787 a partir do pôr do sol de 11/09/2026.
// O período é informado pelo secretário: não presumimos o horário do pôr do sol.
export function hojeCivil() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function dataJudaica(data = hojeCivil(), aposPorDoSol = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || "")) return null;
  const referencia = new Date(`${data}T12:00:00Z`);
  if (Number.isNaN(referencia.getTime()) || referencia.toISOString().slice(0, 10) !== data) return null;
  if (aposPorDoSol) referencia.setUTCDate(referencia.getUTCDate() + 1);
  const formatador = new Intl.DateTimeFormat("pt-BR-u-ca-hebrew", {
    timeZone: "UTC", day: "numeric", month: "long", year: "numeric", numberingSystem: "latn",
  });
  const partes = formatador.formatToParts(referencia);
  return {
    ano: Number(partes.find((parte) => parte.type === "year")?.value),
    texto: formatador.format(referencia),
  };
}

export function anoVerdadeiraLuz(data, aposPorDoSol = false) {
  return dataJudaica(data || hojeCivil(), aposPorDoSol)?.ano ?? "";
}