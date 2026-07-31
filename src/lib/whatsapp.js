import { base44 } from "@/api/base44Client";

/**
 * Envia notificação de nova obra via WhatsApp (Twilio) através da função de backend.
 * Falhas são apenas registradas no console para não interromper o fluxo do usuário.
 */
export async function notificarWhatsApp({ tipo, nome, grau, autor }) {
  try {
    await base44.functions.notificarWhatsApp({ tipo, nome, grau, autor });
  } catch (e) {
    console.error("Falha ao notificar WhatsApp:", e);
  }
}

export default notificarWhatsApp;