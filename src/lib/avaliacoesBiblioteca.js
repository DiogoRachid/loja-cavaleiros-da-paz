import { db } from "@/api/db";

const OBRAS_POR_LOTE = 40;
const AVALIACOES_POR_PAGINA = 200;

async function carregarLote(campo, ids) {
  const avaliacoes = [];
  for (let offset = 0; ; offset += AVALIACOES_POR_PAGINA) {
    const pagina = await db.Avaliacao.filter(
      { [campo]: { $in: ids } },
      "-data_avaliacao,-id", AVALIACOES_POR_PAGINA, offset,
    );
    avaliacoes.push(...pagina);
    if (pagina.length < AVALIACOES_POR_PAGINA) return avaliacoes;
  }
}

export default async function carregarAvaliacoesBiblioteca(campo, obras) {
  if (!["item_id", "documento_id"].includes(campo)) throw new Error("Tipo de avaliação inválido.");
  // Somente IDs das obras já permitidas pelo grau. Lotes curtos evitam URLs grandes no Supabase.
  const ids = [...new Set(obras.map(obra => obra.id).filter(Boolean))];
  const lotes = [];
  for (let inicio = 0; inicio < ids.length; inicio += OBRAS_POR_LOTE) {
    lotes.push(ids.slice(inicio, inicio + OBRAS_POR_LOTE));
  }
  const avaliacoes = [];
  for (let inicio = 0; inicio < lotes.length; inicio += 4) {
    const paginas = await Promise.all(lotes.slice(inicio, inicio + 4).map(lote => carregarLote(campo, lote)));
    avaliacoes.push(...paginas.flat());
  }
  return avaliacoes.sort((a, b) => String(b.data_avaliacao).localeCompare(String(a.data_avaliacao)) || String(b.id).localeCompare(String(a.id)));
}