import { validarUrlEvolution } from './evolution.ts';

export default async function enviarMensagemEvolution(config, text) {
  const url = validarUrlEvolution(config.url_api);
  if (!url || !config.instancia || !config.chave_api || !config.destino) {
    throw new Error('Configuração da Evolution incompleta.');
  }
  const response = await fetch(`${url}/message/sendText/${encodeURIComponent(config.instancia)}`, {
    method: 'POST',
    redirect: 'error',
    headers: { 'Content-Type': 'application/json', apikey: config.chave_api },
    body: JSON.stringify({ number: config.destino, text }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json().catch(() => ({}));
  return {
    confirmado: response.ok && Boolean(data.key?.id),
    aceito: response.ok,
    http_status: response.status,
    mensagem_id: data.key?.id || null,
  };
}