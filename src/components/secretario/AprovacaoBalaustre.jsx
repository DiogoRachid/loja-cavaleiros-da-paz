import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AprovacaoBalaustre({ fluxo, salvando, onRevisao, onEtapa }) {
  const aprovado = fluxo.status === "Aprovado em Loja";
  const data = (valor) => new Date(valor).toLocaleString("pt-BR");
  return <Card><CardContent className="space-y-4 p-4">
    <div className="flex flex-wrap items-center gap-3"><h2 className="text-sm font-semibold">Leitura e aprovação em Loja</h2><Badge variant="outline">{fluxo.status}</Badge></div>
    <p className="text-sm text-muted-foreground">O secretário emite para leitura, ajusta o texto conforme a revisão em Loja e registra a aprovação deliberada em sessão.</p>
    <div className="space-y-2"><Label htmlFor="balaustre-revisao">Revisões após a leitura</Label><Textarea id="balaustre-revisao" value={fluxo.revisao || ""} onChange={(event) => onRevisao(event.target.value)} disabled={salvando || aprovado} placeholder="Registre as correções deliberadas em Loja e aplique-as no texto abaixo." /></div>
    {fluxo.emitido_em && <p className="text-xs text-muted-foreground">Emitido para leitura em {data(fluxo.emitido_em)}.</p>}
    {fluxo.aprovado_em && <p className="text-xs text-muted-foreground">Aprovação em Loja registrada em {data(fluxo.aprovado_em)}.</p>}
    <div className="flex flex-wrap gap-2">
      {fluxo.status === "Rascunho" && <Button type="button" disabled={salvando} onClick={() => onEtapa("Emitido para leitura")}>Emitir para leitura</Button>}
      {fluxo.status === "Emitido para leitura" && <Button type="button" disabled={salvando} onClick={() => onEtapa("Aprovado em Loja")}>Marcar como aprovado em Loja</Button>}
      {aprovado && <Button type="button" variant="outline" disabled={salvando} onClick={() => onEtapa("Rascunho")}>Reabrir para revisão</Button>}
    </div>
    <p className="text-xs text-muted-foreground">{aprovado ? "Texto aprovado protegido contra alterações. Reabrir para revisão retira a aprovação e exige nova emissão e aprovação." : "As ações de emissão e aprovação também salvam o texto e as revisões atuais. A emissão permite continuar editando após a leitura."}</p>
  </CardContent></Card>;
}