import { useId } from "react";
import { dataJudaica } from "@/components/secretario/calendarioJudaico";
import { Checkbox } from "@/components/ui/checkbox";

export default function DataVerdadeiraLuz({ data, aposPorDoSol, onChange }) {
  const id = useId();
  const judaica = dataJudaica(data, aposPorDoSol);
  return <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={aposPorDoSol} onCheckedChange={(value) => onChange(value === true)} />
      <label htmlFor={id} className="cursor-pointer">Data referente ao período após o pôr do sol</label>
    </div>
    {judaica ? <p className="font-medium text-foreground">{judaica.texto} · {judaica.ano} V∴L∴</p> : <p className="text-muted-foreground">Selecione uma data válida.</p>}
    <p className="text-xs text-muted-foreground">O dia judaico começa ao pôr do sol. Sem marcar, considera-se o período anterior. Conforme a Circular 011-2026/2029, o ano 5787 começa ao pôr do sol de 11/09/2026.</p>
  </div>;
}