import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SecaoBalaustreControles({ secao, indice, total, onTitulo, onMover, onRemover }) {
  return <div className="flex flex-wrap items-center gap-2">
    <span className="text-sm font-semibold text-muted-foreground">{indice + 1}.</span>
    <Input aria-label={`Título da seção ${indice + 1}`} value={secao.titulo} onChange={(e) => onTitulo(e.target.value)} className="min-w-32 flex-1 font-semibold" />
    <div className="flex gap-1"><Button type="button" size="icon" variant="outline" disabled={indice === 0} aria-label={`Mover ${secao.titulo} para cima`} onClick={() => onMover(-1)}><ArrowUp className="h-4 w-4" /></Button><Button type="button" size="icon" variant="outline" disabled={indice === total - 1} aria-label={`Mover ${secao.titulo} para baixo`} onClick={() => onMover(1)}><ArrowDown className="h-4 w-4" /></Button><Button type="button" size="icon" variant="outline" aria-label={`Excluir seção ${secao.titulo}`} onClick={onRemover} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
  </div>;
}