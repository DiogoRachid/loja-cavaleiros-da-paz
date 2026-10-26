import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { armazenamentoEvolution, validarUrlEvolution } from '../../shared/evolution.ts';
import { listar } from '../../shared/supabase.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Acesso administrativo necessário.' }, { status: 403 });
    const body = await req.json().catch(() => ({}));
    const partes = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map((parte) => [parte.type, parte.value]));
    const dia = `${partes.year}-${partes.month}-${partes.day}`;
    const storage = armazenamentoEvolution();
    const config = await storage.carregar();
    if (config.aniversarios_ativos === false) return Response.json({ status: 'desativado', data: dia });
    const url = validarUrlEvolution(config.url_api);
    if (!url || !config.instancia || !config.chave_api || !config.destino) return Response.json({ status: 'configuracao_pendente', data: dia, mensagem: 'Preencha URL, instância, chave e destinatário nas configurações do Venerável Mestre.' });
    const pessoas = [];
    for (let offset = 0; ; offset += 200) {
      const pagina = await listar('aniversariante', { filtro: { mes: Number(partes.month), dia: Number(partes.day), tipo: 'Irmão' }, sort: 'nome_completo,id', limit: 200, offset });
      pessoas.push(...pagina);
      if (pagina.length < 200) break;
    }
    if (!pessoas.length) return Response.json({ status: 'sem_aniversariantes', data: dia, quantidade: 0 });
    if (body.simular === true) return Response.json({ status: 'simulacao', data: dia, quantidade: pessoas.length, mensagem: 'Nenhuma mensagem foi enviada e nenhuma reserva foi criada.' });
    const registro = { data: dia, status: 'reservado', quantidade: pessoas.length, reservado_em: new Date().toISOString() };
    // Criação sem upsert: duas execuções concorrentes nunca enviam no mesmo dia.
    if (!await storage.reservar(dia, registro)) return Response.json({ status: 'envio_ja_registrado', data: dia });
    const nomes = pessoas.map((pessoa) => `• Ir∴ ${String(pessoa.nome_completo).replace(/[\r\n*_~`]/g, '').trim()}`).join('\n');
    const text = `*Feliz aniversário!*\n\nHoje a Loja Cavaleiros da Paz nº25 celebra o aniversário de:\n\n${nomes}\n\nDesejamos saúde, paz, felicidade e muitas realizações. Que o Grande Arquiteto do Universo ilumine seus caminhos.\n\nRecebam nosso fraternal abraço!\n*Loja Cavaleiros da Paz nº25*`;
    let response;
    try {
      response = await fetch(`${url}/message/sendText/${encodeURIComponent(config.instancia)}`, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', apikey: config.chave_api }, body: JSON.stringify({ number: config.destino, text }), signal: AbortSignal.timeout(20000) });
    } catch {
      await storage.registrar(dia, { ...registro, status: 'resultado_incerto', atualizado_em: new Date().toISOString() });
      return Response.json({ error: 'Não foi possível confirmar o envio. A reserva foi mantida para evitar duplicidade; confira a instância Evolution antes de reenviar.' }, { status: 502 });
    }
    const resposta = await response.json().catch(() => ({}));
    const confirmado = response.ok && Boolean(resposta.key?.id);
    await storage.registrar(dia, { ...registro, status: confirmado ? 'enviado' : response.ok ? 'resultado_incerto' : 'falhou', http_status: response.status, atualizado_em: new Date().toISOString(), ...(confirmado ? { mensagem_id: resposta.key.id } : {}) });
    if (!confirmado) return Response.json({ error: 'A Evolution não confirmou o envio. Verifique a conexão, a chave, a instância e o destinatário. A reserva impede repetição automática no mesmo dia.' }, { status: 502 });
    return Response.json({ status: 'enviado', data: dia, quantidade: pessoas.length });
  } catch {
    return Response.json({ error: 'Falha ao processar os aniversários. Consulte as configurações e o registro de execução.' }, { status: 500 });
  }
}