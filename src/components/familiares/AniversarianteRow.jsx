import { Badge } from "@/components/ui/badge";
import { hoje } from "@/components/familiares/utils";

export default function AniversarianteRow({ pessoa }) {
  const atual = hoje();
  const aniversarioHoje = Number(atual.slice(5, 7)) === pessoa.mes && Number(atual.slice(8, 10)) === pessoa.dia;
  return <div className="flex items-start gap-3 rounded-lg border border-border p-3">
    <div className="shrink-0 rounded-md bg-muted px-3 py-2 text-center font-semibold text-foreground">{String(pessoa.dia).padStart(2, "0")}<span className="block text-xs font-normal text-muted-foreground">/{String(pessoa.mes).padStart(2, "0")}</span></div>
    <div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-center gap-2"><p className="break-words font-medium text-foreground">{pessoa.nome_completo}</p>{aniversarioHoje && <Badge>Hoje</Badge>}</div><p className="text-xs text-muted-foreground">{pessoa.tipo}{pessoa.tipo !== "Irmão" ? ` · Irmão: ${pessoa.irmao_nome}` : ""}</p></div>
  </div>;
}