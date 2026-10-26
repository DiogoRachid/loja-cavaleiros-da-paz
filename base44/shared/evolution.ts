// Configuração e controle de envios exclusivamente no Storage privado externo.
export function validarUrlEvolution(valor) {
  try {
    const url = new URL(valor);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
    if (url.hostname === 'localhost' || url.hostname.endsWith('.local') || url.hostname.endsWith('.internal') || /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':')) return null;
    return url.href.replace(/\/$/, '');
  } catch { return null; }
}

export function armazenamentoEvolution() {
  const url = Deno.env.get('SUPABASE2_URL');
  const key = Deno.env.get('SUPABASE2_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Armazenamento externo não configurado.');
  const raiz = url.replace(/\/$/, '') + '/storage/v1';
  const bucket = 'loja-system-config';
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const chamar = async (caminho, opcoes = {}) => {
    const res = await fetch(raiz + caminho, { ...opcoes, headers: { ...headers, ...opcoes.headers }, signal: AbortSignal.timeout(10000) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data, ausente: res.status === 404 || String(data.statusCode) === '404', conflito: res.status === 409 || ['409', 'Duplicate', 'ResourceAlreadyExists'].includes(String(data.statusCode || data.error)) };
  };
  const conferirBucket = async (criar = false) => {
    let res = await chamar(`/bucket/${bucket}`);
    if (res.ausente && criar) {
      const novo = await chamar('/bucket', { method: 'POST', body: JSON.stringify({ id: bucket, name: bucket, public: false }) });
      if (!novo.ok && !novo.conflito) throw new Error('Não foi possível preparar o armazenamento privado.');
      res = await chamar(`/bucket/${bucket}`);
    }
    if (res.ausente && !criar) return false;
    if (!res.ok || res.data.public !== false) throw new Error('Armazenamento privado das configurações indisponível.');
    return true;
  };
  const gravar = async (caminho, conteudo, substituir) => chamar(`/object/${bucket}/${caminho}`, { method: 'POST', headers: { 'x-upsert': substituir ? 'true' : 'false' }, body: JSON.stringify(conteudo) });
  return {
    async carregar() {
      if (!await conferirBucket()) return {};
      const res = await chamar(`/object/${bucket}/evolution.json`);
      if (res.ausente) return {};
      if (!res.ok) throw new Error('Não foi possível carregar a configuração.');
      return res.data;
    },
    async salvar(config) {
      await conferirBucket(true);
      if (!(await gravar('evolution.json', config, true)).ok) throw new Error('Não foi possível salvar a configuração.');
    },
    async reservar(dia, registro) {
      await conferirBucket();
      const res = await gravar(`aniversarios/${dia}.json`, registro, false);
      if (res.conflito) return false;
      if (!res.ok) throw new Error('Não foi possível reservar o envio diário.');
      return true;
    },
    async registrar(dia, registro) {
      if (!(await gravar(`aniversarios/${dia}.json`, registro, true)).ok) throw new Error('Não foi possível registrar o resultado do envio.');
    },
  };
}