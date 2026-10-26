import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";

export default function SugestoesIrmaos({ busca, alvoRef, onSelect, onClose }) {
  const [indice, setIndice] = useState(0);
  const { data = [], isPending, error } = useQuery({
    queryKey: ["irmaos-mencoes-balaustre", busca],
    queryFn: () => db.FamiliaIrmao.filter({ nome_completo: { $ilike: `%${busca.trim().replace(/[\\%_]/g, "\\$&")}%` } }, "nome_completo,id", 11),
  });
  const opcoes = data.slice(0, 10);
  const ativo = Math.min(indice, Math.max(opcoes.length - 1, 0));
  useEffect(() => { setIndice(0); }, [busca]);
  useEffect(() => {
    const elemento = alvoRef.current;
    const teclado = (event) => {
      if (event.isComposing) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (["ArrowDown", "ArrowUp"].includes(event.key) && opcoes.length) {
        event.preventDefault(); event.stopPropagation();
        setIndice((atual) => (atual + (event.key === "ArrowDown" ? 1 : -1) + opcoes.length) % opcoes.length);
      }
      if (["Enter", "Tab"].includes(event.key) && opcoes[ativo]) {
        event.preventDefault(); event.stopPropagation(); onSelect(opcoes[ativo]);
      }
    };
    elemento?.addEventListener("keydown", teclado, true);
    return () => elemento?.removeEventListener("keydown", teclado, true);
  }, [alvoRef, opcoes, ativo, onSelect, onClose]);
  return <div role="listbox" aria-label="Irmãos cadastrados" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg">
    {isPending && <p role="status" className="p-3 text-sm">Buscando irmãos...</p>}
    {error && <p role="alert" className="p-3 text-sm text-destructive">Não foi possível buscar: {error.message}</p>}
    {!isPending && !error && !opcoes.length && <p className="p-3 text-sm text-muted-foreground">Nenhum irmão encontrado. Visitantes e autoridades podem ser digitados manualmente.</p>}
    {opcoes.map((irmao, index) => <button type="button" role="option" aria-selected={index === ativo} key={irmao.id} onMouseDown={(e) => e.preventDefault()} onClick={() => onSelect(irmao)} className={`block w-full rounded-sm px-3 py-2 text-left text-sm ${index === ativo ? "bg-accent text-accent-foreground" : "hover:bg-accent"}`}>{irmao.nome_completo}<span className="ml-2 text-xs text-muted-foreground">GLP {irmao.numero_glp}</span></button>)}
    {data.length > 10 && <p className="p-2 text-xs text-muted-foreground">Digite mais letras para refinar a busca.</p>}
  </div>;
}