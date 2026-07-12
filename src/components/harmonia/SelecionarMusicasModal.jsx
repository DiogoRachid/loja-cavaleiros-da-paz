import { useState, useEffect } from "react";
import { Search, Music, Check, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SelecionarMusicasModal({ open, onClose, mp3s = [], initialIds = [], onConfirm, titulo }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedIds(initialIds);
      setBusca("");
    }
  }, [open]);

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const listagem = mp3s.filter(
    (m) => !busca.trim() || `${m.nome} ${m.artista || ""}`.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B3A5F]">
            <Music className="w-5 h-5 text-[#C9A227]" />
            {titulo || "Adicionar Músicas"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar por nome..."
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {listagem.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              Nenhuma música na biblioteca. Envie MP3s primeiro.
            </p>
          ) : (
            listagem.map((m) => {
              const sel = selectedIds.includes(m.id);
              return (
                <Card
                  key={m.id}
                  className={`cursor-pointer transition-colors ${sel ? "border-[#C9A227] bg-amber-50" : "hover:border-[#1B3A5F]"}`}
                  onClick={() => toggle(m.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{m.nome}</p>
                      {m.artista && <p className="text-xs text-slate-500 truncate">{m.artista}</p>}
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        sel ? "bg-[#C9A227]" : "bg-slate-200"
                      }`}
                    >
                      {sel ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-slate-500" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-slate-500">
              {selectedIds.length} selecionada{selectedIds.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={() => onConfirm(selectedIds)} className="bg-[#1B3A5F] text-white">Confirmar</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}