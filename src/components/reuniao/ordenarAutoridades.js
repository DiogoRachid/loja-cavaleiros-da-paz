export default function ordenarAutoridades(lista, autoridades) {
  const ordensPorId = new Map(autoridades.map(a => [a.id, a.ordem_protocolar]));
  const ordem = a => {
    const valor = a.ordem_protocolar ?? ordensPorId.get(a.id);
    return valor !== undefined && valor !== null && valor !== "" && Number.isFinite(Number(valor))
      ? Number(valor)
      : Infinity;
  };
  return [...lista].sort((a, b) => {
    const ordemA = ordem(a);
    const ordemB = ordem(b);
    if (ordemA === Infinity) return ordemB === Infinity ? 0 : 1;
    if (ordemB === Infinity) return -1;
    return ordemB - ordemA;
  });
}