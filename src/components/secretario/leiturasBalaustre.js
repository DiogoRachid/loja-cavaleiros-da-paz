import RegistroBalaustre from "@/components/secretario/RegistroBalaustre";

export const resumirLeitura = (documento) => ({ id: documento.id, classe: documento.classe, numero: documento.numero || "", assunto: documento.assunto, tipo: documento.tipo, remetente: documento.remetente || "", destinatario: documento.destinatario || "" });
export const tituloLeitura = (item) => `${item.classe || "Expediente"}${item.numero ? ` nº ${item.numero}` : ""} — ${item.assunto}`;
export function textoLeituras(leituras) {
  return ["Foi procedida a leitura do balaústre da sessão anterior, que foi aprovado sem ressalvas.", leituras.length
    ? "Foram lidos nesta sessão os seguintes documentos:\n" + leituras.map((item) => `${tituloLeitura(item)}${item.remetente ? ` (de ${item.remetente})` : ""}.`).join("\n")
    : "Não houve expediente a ser lido nesta sessão."].join("\n\n");
}
export function aplicarLeituras(secoes, anteriores, novas) {
  return RegistroBalaustre(secoes, { id: "expediente", titulo: "Leitura do Expediente", anterior: textoLeituras(anteriores), novo: textoLeituras(novas) });
}
export const textoOradores = (lista) => lista.length ? "Fizeram uso da palavra:\n" + lista.map((item) => `${item.nome}${item.tipo !== "Irmão" ? ` (${item.tipo})` : ""}${item.assunto ? ` — ${item.assunto}` : ""}`).join("\n") : "";