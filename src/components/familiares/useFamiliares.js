import { useInfiniteQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { filtroBusca } from "@/components/familiares/utils";

export default function useFamiliares(busca, irmao) {
  return useInfiniteQuery({
    queryKey: ["familiares", irmao?.id || "todos", busca],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => db.FamiliarCadastro.filter({
      ...filtroBusca(busca), ...(irmao ? { irmao_id: irmao.id } : {}),
    }, "nome_completo,id", 26, pageParam),
    getNextPageParam: (ultima, paginas) => ultima.length > 25 ? paginas.length * 25 : undefined,
  });
}