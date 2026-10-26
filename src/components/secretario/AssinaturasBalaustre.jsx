import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CARGOS_ASSINATURA } from "@/components/secretario/assinaturasBalaustre";
import { Button } from "@/components/ui/button";
import QuebraPaginaBalaustre from "@/components/secretario/QuebraPaginaBalaustre";

export default function AssinaturasBalaustre({ assinaturas, onChange, padrao = {}, participantes = [] }) {
  const id = useId();
  return <Card><CardContent className="space-y-3 p-4">
    <h2 className="text-sm font-semibold text-foreground">Assinaturas do balaústre</h2>
    <p className="text-xs text-muted-foreground">Os nomes são preenchidos pelos ocupantes da sessão, quando informados na preparação, ou pelo quadro do exercício. Ajuste-os se necessário; eles serão salvos nesta ata.</p>
    <datalist id={`${id}-participantes`}>{Array.from(new Set(participantes.map((item) => item.irmao_nome).filter(Boolean))).map((nome) => <option key={nome} value={nome} />)}</datalist>
    <div className="grid gap-3 sm:grid-cols-3">{CARGOS_ASSINATURA.map(({ chave, cargo }) => <div key={chave} className="space-y-1.5"><Label htmlFor={`${id}-${chave}`}>{cargo}</Label><Input id={`${id}-${chave}`} list={`${id}-participantes`} value={assinaturas[chave] || ""} onChange={(event) => onChange({ ...assinaturas, [chave]: event.target.value })} placeholder="Digite ou selecione um participante" /><Button type="button" size="sm" variant="ghost" disabled={!padrao[chave] || assinaturas[chave] === padrao[chave]} onClick={() => onChange({ ...assinaturas, [chave]: padrao[chave] })}>Usar ocupante da sessão</Button></div>)}</div>
    {CARGOS_ASSINATURA.some(({ chave }) => !assinaturas[chave]?.trim()) && <p className="text-xs text-muted-foreground">Há nomes em branco. Confira os oficiais antes de imprimir; o espaço para assinatura manual será mantido.</p>}
    <QuebraPaginaBalaustre ativa={assinaturas.novaPagina} onChange={(novaPagina) => onChange({ ...assinaturas, novaPagina })} label="Reservar uma nova página para as assinaturas" />
    <p className="text-xs text-muted-foreground">A impressão reserva espaço para assinatura manual; não se trata de assinatura digital.</p>
  </CardContent></Card>;
}