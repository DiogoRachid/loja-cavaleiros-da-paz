import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import AniversarianteRow from "@/components/familiares/AniversarianteRow";
import { filtroBusca } from "@/components/familiares/utils";

export default function AniversariosLista({ mes, tipo = "todos", busca = "", compacto = false }) {
  const tamanho = compacto ? 5 : 25;
  const filtro = { mes, ...filtroBusca(busca), ...(tipo === "irmaos" ? { tipo: "Irmão" } : tipo === "familiares" ? { tipo: { $ne: "Irmão" } } : {}) };
  const consulta = useInfiniteQuery({
    queryKey: ["aniversariantes", mes, tipo, busca, tamanho],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => db.Aniversariante.filter(filtro, "dia,nome_completo,id", tamanho + 1, pageParam),
    getNextPageParam: (ultima, paginas) => ultima.length > tamanho ? paginas.length * tamanho : undefined,
  });
  const pessoas = consulta.data?.pages.flatMap((pagina) => pagina.slice(0, tamanho)) || [];
  return <div className="space-y-3">
    {consulta.isPending && <p role="status" className="py-5 text-center text-muted-foreground">Carregando aniversariantes...</p>}
    {consulta.error && <div role="alert" className="space-y-2"><p className="text-sm text-destructive">Não foi possível consultar os aniversários: {consulta.error.message}</p><Button variant="outline" onClick={() => consulta.refetch()}>Tentar novamente</Button></div>}
    {!consulta.isPending && !consulta.error && !pessoas.length && <p className="py-5 text-center text-sm text-muted-foreground">Nenhum aniversariante encontrado para este mês e filtro.</p>}
    {pessoas.map((pessoa) => <AniversarianteRow key={`${pessoa.tipo}-${pessoa.id}`} pessoa={pessoa} />)}
    {!compacto && consulta.hasNextPage && <Button variant="outline" disabled={consulta.isFetchingNextPage} className="w-full" onClick={() => consulta.fetchNextPage()}>{consulta.isFetchingNextPage ? "Carregando..." : "Carregar mais aniversariantes"}</Button>}
  </div>;
}