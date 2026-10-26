import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CARGOS_ASSINATURA } from "@/components/secretario/assinaturasBalaustre";

export default function AssinaturasBalaustre({ assinaturas, onChange }) {
  const id = useId();
  return <Card><CardContent className="space-y-3 p-4">
    <h2 className="text-sm font-semibold text-foreground">Assinaturas do balaústre</h2>
    <p className="text-xs text-muted-foreground">Os nomes são preenchidos pelos ocupantes da sessão, quando informados na preparação, ou pelo quadro do exercício. Ajuste-os se necessário; eles serão salvos nesta ata.</p>
    <div className="grid gap-3 sm:grid-cols-3">{CARGOS_ASSINATURA.map(({ chave, cargo }) => <div key={chave} className="space-y-1.5"><Label htmlFor={`${id}-${chave}`}>{cargo}</Label><Input id={`${id}-${chave}`} value={assinaturas[chave] || ""} onChange={(event) => onChange({ ...assinaturas, [chave]: event.target.value })} placeholder="Nome para assinatura" /></div>)}</div>
    <p className="text-xs text-muted-foreground">A impressão reserva espaço para assinatura manual; não se trata de assinatura digital.</p>
  </CardContent></Card>;
}