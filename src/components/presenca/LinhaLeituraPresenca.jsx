import SinalLeituraPresenca from "@/components/presenca/SinalLeituraPresenca";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function LinhaLeituraPresenca({ linha, irmaos, onChange, bloqueada }) {
  return <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[auto_1fr_1fr] md:items-center">
    <Checkbox aria-label={`Confirmar presença de ${linha.nome_lido || "linha não identificada"}`} checked={linha.presente} disabled={bloqueada} onCheckedChange={(valor) => onChange({ ...linha, presente: valor === true })} />
    <div><p className="text-sm font-medium text-foreground">{linha.nome_lido || "Nome ilegível"}</p><div className="mt-1 flex flex-wrap gap-3"><SinalLeituraPresenca valor={linha.assinatura} texto="Assinatura" /><SinalLeituraPresenca valor={linha.x_marcado} texto="X marcado" /></div>{linha.observacao && <p className="mt-1 text-xs text-muted-foreground">{linha.observacao}</p>}</div>
    <Select disabled={bloqueada} value={linha.irmao_id || "nao-identificado"} onValueChange={(id) => onChange({ ...linha, irmao_id: id === "nao-identificado" ? "" : id, presente: id === "nao-identificado" ? false : linha.presente })}><SelectTrigger><SelectValue placeholder="Vincular ao cadastro" /></SelectTrigger><SelectContent><SelectItem value="nao-identificado">Não identificado</SelectItem>{irmaos.map((ir) => <SelectItem key={ir.id} value={ir.id}>{ir.nome_completo} · {ir.numero_glp}</SelectItem>)}</SelectContent></Select>
  </div>;
}