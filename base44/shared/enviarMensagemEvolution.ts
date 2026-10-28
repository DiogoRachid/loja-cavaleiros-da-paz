import { validarUrlEvolution } from './evolution.ts';

export async function verificarConexaoEvolution(config) {
  const inicio = Date.now();
  try {
    const response = await fetch(`${validarUrlEvolution(config.url_api)}/instance/connectionState/${encodeURIComponent(config.instancia)}`, {
      headers: { apikey: config.chave_api }, redirect: 'manual', signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({}));
    return { diagnostico: true, http_status: response.status, estado: data.instance?.state || data.state || null, duracao_ms: Date.now() - inicio };
  } catch (error) {
    const detalhe = String(error.message || '');
    const causa = /certificate|certificado|issuer|tls|ssl/i.test(detalhe) ? 'certificado_https' : /dns|resolve|lookup/i.test(detalhe) ? 'dns' : /redirect/i.test(detalhe) ? 'redirecionamento' : ['TimeoutError', 'AbortError'].includes(error.name) ? 'tempo_esgotado' : 'conexao';
    return { diagnostico: true, falha: causa, tipo: error.name, duracao_ms: Date.now() - inicio };
  }
}

export default async function enviarMensagemEvolution(config, text) {
  const url = validarUrlEvolution(config.url_api);
  if (!url || !config.instancia || !config.chave_api || !config.destino) {
    throw new Error('Configuração da Evolution incompleta.');
  }
  const response = await fetch(`${url}/message/sendText/${encodeURIComponent(config.instancia)}`, {
    method: 'POST',
    redirect: 'manual',
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