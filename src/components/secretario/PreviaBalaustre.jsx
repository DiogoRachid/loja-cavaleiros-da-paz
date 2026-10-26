import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { gerarHtmlBalaustre } from "@/components/secretario/imprimirBalaustre";

export default function PreviaBalaustre({ documento, onClose, onImprimir }) {
  const html = useMemo(() => gerarHtmlBalaustre(documento), [documento]);
  return <Dialog open onOpenChange={(aberto) => { if (!aberto) onClose(); }}><DialogContent className="flex h-[90vh] max-w-5xl flex-col">
    <DialogHeader><DialogTitle>Prévia do balaústre</DialogTitle><DialogDescription>Texto atual, na ordem das seções, com os nomes das assinaturas. Para gerar um PDF, escolha Salvar como PDF no diálogo de impressão.</DialogDescription></DialogHeader>
    <iframe title="Prévia de impressão do balaústre" sandbox="" srcDoc={html} className="min-h-0 flex-1 rounded-md border border-border" />
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Voltar à edição</Button><Button onClick={onImprimir}>Imprimir / PDF</Button></div>
  </DialogContent></Dialog>;
}