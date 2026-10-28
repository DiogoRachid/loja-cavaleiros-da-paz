import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { armazenamentoEvolution, validarUrlEvolution } from '../../shared/evolution.ts';
import enviarMensagemEvolution, { verificarConexaoEvolution } from '../../shared/enviarMensagemEvolution.ts';
import { podeDivulgarBiblioteca, mensagemDivulgacao } from '../../shared/divulgacaoBiblioteca.ts';
import { obter } from '../../shared/supabase.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(error => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Entre na sua conta para enviar a divulgação ao grupo.' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { tipoAcervo, itemId } = body;
    if (!['digital', 'fisico'].includes(tipoAcervo) || typeof itemId !== 'string' || !/^[a-z0-9_-]{1,128}$/i.test(itemId)) {
      return Response.json({ error: 'Selecione uma obra válida para compartilhar.' }, { status: 400 });
    }
    if (!await podeDivulgarBiblioteca(user)) {
      return Response.json({ error: 'Use uma conta administrativa ou a conta com o e-mail cadastrado do Bibliotecário.' }, { status: 403 });
    }
    const obra = await obter(tipoAcervo === 'digital' ? 'acervo_digital' : 'item', itemId);
    if (!obra) return Response.json({ error: 'Obra não encontrada.' }, { status: 404 });
    if (obra.ativo === false || (tipoAcervo === 'digital' && obra.disponivel === false)) {
      return Response.json({ error: 'Disponibilize a obra aos irmãos antes de compartilhá-la.' }, { status: 409 });
    }
    const config = await armazenamentoEvolution().carregar();
    if (!validarUrlEvolution(config.url_api) || !config.instancia || !config.chave_api || !config.destino) {
      return Response.json({ error: 'Configure URL, instância, chave e grupo em Dados da Loja > WhatsApp · Evolution API, no portal do Venerável Mestre.' }, { status: 503 });
    }
    if (!/^\d+(?:-\d+)?@g\.us$/.test(config.destino)) {
      return Response.json({ error: 'Informe o ID do grupo da Loja terminado em @g.us nas configurações do WhatsApp. A divulgação não é enviada a números individuais.' }, { status: 409 });
    }
    if (body.diagnosticar === true) return Response.json(await verificarConexaoEvolution(config));
    const text = mensagemDivulgacao(obra, tipoAcervo);
    if (body.simular === true) return Response.json({ simulacao: true, mensagem: text });
    let resultado;
    try {
      resultado = await enviarMensagemEvolution(config, text);
    } catch {
      return Response.json({ error: 'Não foi possível confirmar o envio. Confira o grupo e a conexão da Evolution antes de tentar novamente.' }, { status: 502 });
    }
    if (!resultado.confirmado) {
      const mensagem = [401, 403].includes(resultado.http_status)
        ? 'A Evolution recusou a autenticação. Confira a chave da API nas configurações.'
        : resultado.http_status === 404
          ? 'A Evolution não encontrou a instância. Confira a URL e o nome da instância.'
          : resultado.http_status >= 300 && resultado.http_status < 400
            ? 'A URL da Evolution redireciona para outro endereço. Configure a URL HTTPS final da API antes de enviar.'
            : 'A Evolution não confirmou o envio. Confira a conexão e o ID do grupo antes de tentar novamente.';
      return Response.json({ error: mensagem }, { status: 502 });
    }
    return Response.json({ success: true, mensagem_id: resultado.mensagem_id });
  } catch {
    return Response.json({ error: 'Não foi possível preparar a divulgação da obra. Tente novamente.' }, { status: 500 });
  }
}