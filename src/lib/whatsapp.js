import { base44 } from "@/api/base44Client";

// Envio manual: destinatário, credenciais e dados da obra são resolvidos no servidor.
export async function notificarWhatsApp({ tipoAcervo, itemId }) {
  const { data } = await base44.functions.invoke("notificarWhatsApp", { tipoAcervo, itemId });
  if (!data?.success) throw new Error(data?.error || "O WhatsApp não confirmou o envio.");
  return data;
}

export default notificarWhatsApp;