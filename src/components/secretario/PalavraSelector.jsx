import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X } from "lucide-react";
import OradorForm from "@/components/secretario/OradorForm";

export default function PalavraSelector({ oradores, onChange }) {
  return <Card><CardContent className="space-y-3 p-4">
    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><MessageSquare className="h-4 w-4" />Usaram da Palavra</h2>
    <OradorForm onAdicionar={(orador) => onChange([...oradores, orador])} />
    {oradores.length > 0 && <div className="flex flex-wrap gap-2">{oradores.map((orador, index) => <Badge key={index} variant="outline" className="gap-1 py-1">
      {orador.tipo !== "Irmão" && <span className="text-muted-foreground">{orador.tipo}</span>}{orador.nome}{orador.assunto ? ` — ${orador.assunto}` : ""}
      <button type="button" aria-label={`Remover manifestação de ${orador.nome}`} onClick={() => onChange(oradores.filter((_, posicao) => posicao !== index))} className="ml-1 text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
    </Badge>)}</div>}
  </CardContent></Card>;
}