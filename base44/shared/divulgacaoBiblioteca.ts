import { listar } from './supabase.ts';

export async function podeDivulgarBiblioteca(user) {
  if (user.role === 'admin') return true;
  const email = String(user.email || '').trim().toLowerCase();
  if (!email) return false;
  const [irmaos, bibliotecarios] = await Promise.all([
    listar('irmao', { filtro: { ativo: true, email: { $ilike: email } }, limit: 10 }),
    listar('bibliotecario', { filtro: { ativo: true, login: { $ilike: email } }, limit: 10 }),
  ]);
  // Nunca confia no cargo, no ID ou no sinalizador de login enviados pelo navegador.
  const normalizar = valor => String(valor || '').trim().toLowerCase();
  return bibliotecarios.some(pessoa => normalizar(pessoa.login) === email) ||
    irmaos.some(pessoa => normalizar(pessoa.email) === email && pessoa.cargo === 'Bibliotecário');
}

export function mensagemDivulgacao(obra, tipoAcervo) {
  const digital = tipoAcervo === 'digital';
  const grau = obra.grau_minimo || 'Aprendiz';
  const emoji = { Aprendiz: '🔵', Companheiro: '🟡', Mestre: '🔴' }[grau] || '';
  const link = `https://loja-cavaleiros-da-paz.vercel.app/AcervoPublico?id=${encodeURIComponent(obra.id)}&tipo=${tipoAcervo}`;
  const titulo = digital ? obra.titulo : obra.nome;
  return `${digital ? '📄 Novo documento disponível no acervo digital!' : '📚 Novo item disponível no acervo físico!'}\n\n` +
    (obra.tipo ? `Tipo: ${obra.tipo}\n` : '') + `Título: ${titulo || '—'}\n` +
    (obra.autor ? `Autor: ${obra.autor}\n` : '') + `Grau mínimo: ${emoji} ${grau}\n` +
    `\nLoja Cavaleiros da Paz nº25\n${link}`;
}