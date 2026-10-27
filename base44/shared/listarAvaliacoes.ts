import { listar } from "./supabase.ts";

const OBRAS_POR_LOTE = 40;
const PAGINA = 200;

function valoresDoFiltro(valor) {
  return Array.isArray(valor) ? valor : valor?.$in;
}

async function carregarLote(filtro, sort, quantidade) {
  const linhas = [];
  while (linhas.length < quantidade) {
    const limit = Math.min(PAGINA, quantidade - linhas.length);
    const pagina = await listar("avaliacao", { filtro, sort, limit, offset: linhas.length });
    linhas.push(...pagina);
    if (pagina.length < limit) break;
  }
  return linhas;
}

function comparar(a, b, sort) {
  for (const termo of sort.split(",")) {
    const desc = termo.startsWith("-");
    const campo = desc ? termo.slice(1) : termo;
    let x = a[campo], y = b[campo];
    if (x === y) continue;
    if (x == null) return desc ? -1 : 1;
    if (y == null) return desc ? 1 : -1;
    if (["data_avaliacao", "created_date", "updated_date"].includes(campo)) {
      x = new Date(x).getTime();
      y = new Date(y).getTime();
    }
    if (x === y) continue;
    return (x < y ? -1 : 1) * (desc ? -1 : 1);
  }
  return 0;
}

export default async function listarAvaliacoes(options) {
  const { filtro, sort, limit, offset } = options;
  const campo = ["documento_id", "item_id"].find(nome => {
    const valores = valoresDoFiltro(filtro?.[nome]);
    return Array.isArray(valores) && valores.length > OBRAS_POR_LOTE;
  });
  if (!campo) return listar("avaliacao", options);

  // A proteção fica no servidor para atender também versões já abertas do portal.
  // Cada lote mantém todos os demais filtros e apenas os IDs solicitados.
  const ids = [...new Set(valoresDoFiltro(filtro[campo]))];
  const inicio = Number.isInteger(offset) && offset > 0 ? offset : 0;
  const tamanho = Number.isInteger(limit) && limit > 0 ? limit : Infinity;
  const filtros = [];
  for (let i = 0; i < ids.length; i += OBRAS_POR_LOTE) {
    filtros.push({ ...filtro, [campo]: { $in: ids.slice(i, i + OBRAS_POR_LOTE) } });
  }
  const linhas = [];
  for (let i = 0; i < filtros.length; i += 4) {
    const lotes = await Promise.all(filtros.slice(i, i + 4).map(lote => carregarLote(lote, sort, inicio + tamanho)));
    linhas.push(...lotes.flat());
  }
  if (sort) linhas.sort((a, b) => comparar(a, b, sort));
  return linhas.slice(inicio, tamanho === Infinity ? undefined : inicio + tamanho);
}