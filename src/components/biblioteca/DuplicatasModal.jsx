import { useState, useMemo } from "react";
import { Trash2, AlertTriangle, X, CopyCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

// modo: "fisico" usa Item.nome | "digital" usa AcervoDigital.titulo
export default function DuplicatasModal({ open, onClose, itens, modo, onConcluido }) {
  const [deletando, setDeletando] = useState(null); // id a deletar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState(null);

  const getNome = (item) => modo === "fisico" ? item.nome : item.titulo;

  // Agrupa por nome normalizado (lowercase, sem espaços extras)
  const grupos = useMemo(() => {
    const mapa = {};
    itens.forEach(item => {
      const chave = getNome(item)?.toLowerCase().trim().replace(/\s+/g, " ") || "__sem_nome__";
      if (!mapa[chave]) mapa[chave] = [];
      mapa[chave].push(item);
    });
    return Object.values(mapa).filter(g => g.length > 1);
  }, [itens]);

  const handleDeleteClick = (item) => {
    setItemParaDeletar(item);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemParaDeletar) return;
    setDeletando(itemParaDeletar.id);
    try {
      if (modo === "fisico") {
        await base44.entities.Item.update(itemParaDeletar.id, { ativo: false });
      } else {
        await base44.entities.AcervoDigital.delete(itemParaDeletar.id);
      }
      toast.success("Item removido com sucesso.");
      onConcluido();
    } catch (e) {
      toast.error("Erro ao remover: " + e.message);
    }
    setDeletando(null);
    setItemParaDeletar(null);
    setConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CopyCheck className="w-5 h-5 text-amber-500" />
              Duplicatas Encontradas
            </DialogTitle>
          </DialogHeader>

          {grupos.length === 0 ? (
            <div className="py-12 text-center">
              <CopyCheck className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
              <p className="text-slate-600 font-medium">Nenhuma duplicata encontrada!</p>
              <p className="text-slate-400 text-sm mt-1">Todos os itens têm títulos únicos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {grupos.length} grupo(s) com títulos duplicados. Mantenha um e exclua os demais.
              </p>
              {grupos.map((grupo, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b">
                    <p className="font-medium text-slate-700 text-sm truncate">
                      "{getNome(grupo[0])}"
                      <Badge className="ml-2 bg-amber-100 text-amber-700 text-xs">{grupo.length} cópias</Badge>
                    </p>
                  </div>
                  <div className="divide-y">
                    {grupo.map((item, i) => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        {(modo === "digital" ? item.capa_url : item.imagem_capa) ? (
                          <img
                            src={modo === "digital" ? item.capa_url : item.imagem_capa}
                            alt=""
                            className="w-8 h-10 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-10 bg-slate-200 rounded flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{getNome(item)}</p>
                          <p className="text-xs text-slate-400">
                            {item.autor || "Sem autor"} · {item.tipo} · cadastrado {new Date(item.created_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {i === 0 && (
                          <Badge className="text-xs bg-emerald-100 text-emerald-700 flex-shrink-0">Manter</Badge>
                        )}
                        {i > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                            onClick={() => handleDeleteClick(item)}
                            disabled={deletando === item.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Remover "{itemParaDeletar ? getNome(itemParaDeletar) : ""}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemParaDeletar(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}