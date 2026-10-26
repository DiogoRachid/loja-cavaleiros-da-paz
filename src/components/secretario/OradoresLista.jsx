import { useState } from "react";
import { ArrowUp, ArrowDown, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import OradorForm from "@/components/secretario/OradorForm";

export default function OradoresLista({ oradores, onChange }) {
  const [editando, setEditando] = useState(null);
  const mover = (indice, deslocamento) => {
    const copia = [...oradores];
    [copia[indice], copia[indice + deslocamento]] = [copia[indice + deslocamento], copia[indice]];
    if (onChange(copia) !== false) setEditando(null);
  };
  const salvar = (orador) => {
    if (onChange(oradores.map((item, indice) => indice === editando ? orador : item)) === false) return false;
    setEditando(null);
  };
  return <div className="space-y-2">{oradores.map((orador, indice) => <div key={indice} className="space-y-3 rounded-md border border-border p-3">
    <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{indice + 1}. {orador.nome} <span className="text-xs text-muted-foreground">({orador.tipo})</span></p>{orador.assunto && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{orador.assunto}</p>}</div>
      <div className="flex gap-1"><Button size="icon" variant="ghost" disabled={indice === 0} aria-label={`Antecipar fala de ${orador.nome}`} onClick={() => mover(indice, -1)}><ArrowUp className="h-4 w-4" /></Button><Button size="icon" variant="ghost" disabled={indice === oradores.length - 1} aria-label={`Mover fala de ${orador.nome} para baixo`} onClick={() => mover(indice, 1)}><ArrowDown className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Editar fala de ${orador.nome}`} onClick={() => setEditando(indice)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Remover fala de ${orador.nome}`} className="text-destructive" onClick={() => { if (onChange(oradores.filter((_, posicao) => posicao !== indice)) !== false) setEditando(null); }}><X className="h-4 w-4" /></Button></div>
    </div>
    {editando === indice && <OradorForm key={`editar-${indice}`} inicial={orador} onAdicionar={salvar} onCancelar={() => setEditando(null)} />}
  </div>)}</div>;
}