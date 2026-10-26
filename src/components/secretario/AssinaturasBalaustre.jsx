import { Card, CardContent } from "@/components/ui/card";
import { CARGOS_ASSINATURA } from "@/components/secretario/assinaturasBalaustre";
import QuebraPaginaBalaustre from "@/components/secretario/QuebraPaginaBalaustre";

export default function AssinaturasBalaustre({ assinaturas, onChange }) {
  return <Card><CardContent className="space-y-3 p-4">
    <h2 className="text-sm font-semibold text-foreground">Assinaturas do balaústre</h2>
    <p className="text-xs text-muted-foreground">Espaços para assinatura de quem estiver exercendo cada cargo na sessão, sem nomes.</p>
    <div className="grid gap-6 sm:grid-cols-3">{CARGOS_ASSINATURA.map(({ chave, cargo }) => <div key={chave} className="pt-16 text-center"><div className="border-t border-foreground pt-2 text-sm font-medium text-foreground">{cargo}</div></div>)}</div>
    <QuebraPaginaBalaustre ativa={assinaturas.novaPagina} onChange={(novaPagina) => onChange({ ...assinaturas, novaPagina })} label="Reservar uma nova página para as assinaturas" />
    <p className="text-xs text-muted-foreground">A impressão reserva espaço para assinatura manual; não se trata de assinatura digital.</p>
  </CardContent></Card>;
}