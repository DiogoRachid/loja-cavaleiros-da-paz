import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Entre na conta administrativa para configurar o WhatsApp.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Esta configuração exige uma conta administrativa.' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    if (!['carregar', 'salvar'].includes(body.operacao)) return Response.json({ error: 'Operação inválida.' }, { status: 400 });
    const url = Deno.env.get('SUPABASE2_URL');
    const key = Deno.env.get('SUPABASE2_SERVICE_ROLE_KEY');
    if (!url || !key) return Response.json({ error: 'Armazenamento externo não configurado.' }, { status: 503 });
    const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
    const raiz = url.replace(/\/$/, '') + '/storage/v1';
    const bucket = 'loja-system-config';
    const arquivo = `${raiz}/object/${bucket}/evolution.json`;
    const bucketRes = await fetch(`${raiz}/bucket/${bucket}`, { headers, signal: AbortSignal.timeout(10000) });
    const bucketInfo = await bucketRes.json();
    if (!bucketRes.ok && bucketRes.status !== 404 && String(bucketInfo.statusCode) !== '404') return Response.json({ error: 'Não foi possível acessar as configurações externas.' }, { status: 502 });
    const bucketExiste = bucketRes.ok;
    if (bucketExiste && bucketInfo.public !== false) return Response.json({ error: 'O armazenamento de configurações precisa ser privado.' }, { status: 503 });
    let anterior = {};
    if (bucketExiste) {
      const res = await fetch(arquivo, { headers, signal: AbortSignal.timeout(10000) });
      if (res.ok) anterior = await res.json();
      else if (res.status !== 404 && res.status !== 400) return Response.json({ error: 'Não foi possível carregar a configuração.' }, { status: 502 });
    }
    if (body.operacao === 'salvar') {
      const chave = typeof body.chave_api === 'string' ? body.chave_api.trim() : '';
      const destinoRecebido = typeof body.destino === 'string' ? body.destino.trim() : '';
      const destino = destinoRecebido.includes('@') ? destinoRecebido : destinoRecebido.replace(/[\s()+-]/g, '');
      if (!/^(\d{8,15}|\d+(?:-\d+)?@g\.us)$/.test(destino)) return Response.json({ error: 'Informe um número com DDI e DDD ou o ID completo do grupo, terminado em @g.us.' }, { status: 400 });
      if ((!chave && !anterior.chave_api) || chave.length > 4096) return Response.json({ error: 'Informe uma chave de API válida.' }, { status: 400 });
      if (!bucketExiste) {
        const criar = await fetch(`${raiz}/bucket`, { method: 'POST', headers, body: JSON.stringify({ id: bucket, name: bucket, public: false }), signal: AbortSignal.timeout(10000) });
        if (!criar.ok) return Response.json({ error: 'Não foi possível preparar o armazenamento privado.' }, { status: 502 });
      }
      const config = { chave_api: chave || anterior.chave_api, destino };
      const salvar = await fetch(arquivo, { method: 'POST', headers: { ...headers, 'x-upsert': 'true' }, body: JSON.stringify(config), signal: AbortSignal.timeout(10000) });
      if (!salvar.ok) return Response.json({ error: 'Não foi possível salvar a configuração.' }, { status: 502 });
      anterior = config;
    }
    return Response.json({ destino: anterior.destino || '', chave_configurada: Boolean(anterior.chave_api) });
  } catch {
    return Response.json({ error: 'Não foi possível processar a configuração do WhatsApp.' }, { status: 500 });
  }
}