export default function ordenarAutoridades(lista, autoridades) {
  const ordensPorId = new Map(autoridades.map(a => [a.id, a.ordem_protocolar]));
  const ordem = a => {
    const valor = a.ordem_protocolar ?? ordensPorId.get(a.id);
    return valor !== undefined && valor !== null && valor !== "" && Number.isFinite(Number(valor))
      ? Number(valor)
      : Infinity;
  };
  return [...lista].sort((a, b) => ordem(a) - ordem(b));
}