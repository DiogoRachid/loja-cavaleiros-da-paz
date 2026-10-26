import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatarData } from "@/components/familiares/utils";

export default function FamiliarRow({ familiar, onEditar, onExcluir, excluindo, mostrarIrmao }) {
  return <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-4">
    <div className="min-w-0 flex-1 space-y-1 break-words">
      <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{familiar.nome_completo}</h3><Badge variant="secondary">{familiar.tipo}</Badge>{!familiar.ativo && <Badge variant="outline">Inativo</Badge>}</div>
      {mostrarIrmao && <p className="text-sm text-muted-foreground">Irmão: {familiar.irmao_nome} · GLP {familiar.irmao_numero_glp}</p>}
      <p className="text-sm text-muted-foreground">Nascimento: {formatarData(familiar.data_nascimento)}{familiar.telefone ? ` · Telefone: ${familiar.telefone}` : ""}</p>
      {familiar.observacoes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{familiar.observacoes}</p>}
    </div>
    <div className="flex gap-1"><Button size="icon" variant="outline" disabled={excluindo} aria-label={`Editar ${familiar.nome_completo}`} onClick={() => onEditar(familiar)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="outline" disabled={excluindo} className="text-destructive" aria-label={`Excluir ${familiar.nome_completo}`} onClick={() => onExcluir(familiar)}><Trash2 className="h-4 w-4" /></Button></div>
  </div>;
}