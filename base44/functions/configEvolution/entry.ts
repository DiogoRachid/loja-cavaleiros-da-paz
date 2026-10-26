import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { armazenamentoEvolution, validarUrlEvolution } from '../../shared/evolution.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Entre na conta administrativa para configurar o WhatsApp.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Esta configuração exige uma conta administrativa.' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    if (!['carregar', 'salvar'].includes(body.operacao)) return Response.json({ error: 'Operação inválida.' }, { status: 400 });
    const storage = armazenamentoEvolution();
    let anterior = await storage.carregar();
    if (body.operacao === 'salvar') {
      const chave = typeof body.chave_api === 'string' ? body.chave_api.trim() : '';
      const destinoRecebido = typeof body.destino === 'string' ? body.destino.trim() : '';
      const destino = destinoRecebido.includes('@') ? destinoRecebido : destinoRecebido.replace(/[\s()+-]/g, '');
      const urlApi = validarUrlEvolution(body.url_api);
      const instancia = typeof body.instancia === 'string' ? body.instancia.trim() : '';
      if (!urlApi) return Response.json({ error: 'Informe a URL HTTPS pública da sua Evolution API, sem credenciais ou parâmetros.' }, { status: 400 });
      if (!instancia || instancia.length > 150 || /[\r\n/]/.test(instancia)) return Response.json({ error: 'Informe o nome da instância conectada ao WhatsApp.' }, { status: 400 });
      if (!/^(\d{8,15}|\d+(?:-\d+)?@g\.us)$/.test(destino)) return Response.json({ error: 'Informe um número com DDI e DDD ou o ID completo do grupo, terminado em @g.us.' }, { status: 400 });
      if ((!chave && !anterior.chave_api) || chave.length > 4096 || /[\r\n]/.test(chave)) return Response.json({ error: 'Informe uma chave de API válida.' }, { status: 400 });
      anterior = { chave_api: chave || anterior.chave_api, destino, url_api: urlApi, instancia, aniversarios_ativos: body.aniversarios_ativos === true };
      await storage.salvar(anterior);
    }
    return Response.json({ destino: anterior.destino || '', chave_configurada: Boolean(anterior.chave_api), url_api: anterior.url_api || '', instancia: anterior.instancia || '', aniversarios_ativos: anterior.aniversarios_ativos !== false });
  } catch {
    return Response.json({ error: 'Não foi possível processar a configuração do WhatsApp.' }, { status: 500 });
  }
}