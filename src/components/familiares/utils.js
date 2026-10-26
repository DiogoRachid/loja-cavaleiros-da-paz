export const TIPOS = ["Cunhada", "Sobrinho", "Sobrinha", "Outro"];
export const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const hoje = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
export const formatarData = (data) => data ? data.slice(0, 10).split("-").reverse().join("/") : "Não informada";
export const filtroBusca = (busca) => busca.trim() ? { busca: { $ilike: `%${busca.trim().replace(/[\\%_]/g, "\\$&")}%` } } : {};
export const novoFamiliar = (irmao) => ({ nome_completo: "", tipo: "Cunhada", data_nascimento: "", telefone: "", observacoes: "", ativo: true, irmao_id: irmao?.id || "", irmao_nome: irmao?.nome_completo || "", irmao_numero_glp: irmao?.numero_glp || "" });
export function dadosFamiliar(form) {
  return { nome_completo: form.nome_completo.trim(), irmao_id: form.irmao_id, tipo: form.tipo,
    data_nascimento: form.data_nascimento || null, telefone: form.telefone?.trim() || null,
    observacoes: form.observacoes?.trim() || null, ativo: form.ativo };
}
export async function atualizarFamiliares(client) {
  await Promise.all([client.invalidateQueries({ queryKey: ["familiares"] }), client.invalidateQueries({ queryKey: ["aniversariantes"] })]);
}