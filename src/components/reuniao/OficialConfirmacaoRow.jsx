import { Check } from "lucide-react";
import CargoIcon from "@/components/CargoIcon";
import SubstitutoSelect from "@/components/reuniao/SubstitutoSelect";

export default function OficialConfirmacaoRow({ oficial, irmaos, substitutoId, onToggle, onSubstituto, onRemove }) {
  const o = oficial;
  return (
    <div className={`grid items-center gap-4 rounded-xl border p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_8rem] ${o.confirmado ? "border-lodge-success/20 bg-lodge-success-soft" : "border-border bg-card"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background"><CargoIcon cargo={o.cargo} className="h-9 w-9" /></div>
        <p className="text-sm font-semibold leading-snug text-lodge-navy">{o.cargo}</p>
      </div>
      <div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground xl:hidden">Titular</p><p className="break-words text-sm text-foreground">{o.titular_nome || <span className="italic text-muted-foreground">Não definido</span>}</p></div>
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground xl:hidden">Substituto</p>
        <SubstitutoSelect irmaos={irmaos} value={substitutoId} onChange={onSubstituto} />
        {o.substituto_nome && <div className="flex items-start justify-between gap-2 text-xs"><span className="break-words text-muted-foreground">Substituto: {o.substituto_nome}</span><button type="button" onClick={onRemove} className="shrink-0 text-destructive hover:underline">Remover</button></div>}
      </div>
      <button type="button" onClick={onToggle} aria-pressed={o.confirmado} aria-label={`${o.confirmado ? "Desmarcar" : "Confirmar"} presença: ${o.cargo}`}
        className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lodge-gold ${o.confirmado ? "border-lodge-success/20 bg-background text-lodge-success" : "border-border bg-background text-muted-foreground hover:border-lodge-navy hover:text-lodge-navy"}`}>
        <Check className="h-4 w-4 shrink-0" /><span>{o.confirmado ? (o.substituto_nome ? "Confirmado (subst.)" : "Confirmado") : "Confirmar"}</span>
      </button>
    </div>
  );
}