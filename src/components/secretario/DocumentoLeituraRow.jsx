import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { tituloLeitura } from "@/components/secretario/leiturasBalaustre";

export default function DocumentoLeituraRow({ documento, selecionado, onToggle, sessaoId }) {
  const id = useId();
  return <div className="flex items-start gap-3 rounded-md border border-border p-3">
    <Checkbox id={id} className="mt-0.5" checked={selecionado} onCheckedChange={onToggle} />
    <div className="min-w-0 space-y-1"><Label htmlFor={id} className="block break-words leading-relaxed">{tituloLeitura(documento)}</Label><p className="text-xs text-muted-foreground">{documento.remetente || documento.tipo}{documento.sessao_id === sessaoId ? " · Vinculado a esta sessão" : ""}{documento.status === "Lido" ? " · Lido na Secretaria" : ""}</p></div>
  </div>;
}