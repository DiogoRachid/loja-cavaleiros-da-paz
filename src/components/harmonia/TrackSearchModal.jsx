import { useState, useEffect } from "react";
import { Search, Music, FolderOpen, Check, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const TODAS = "__todas__";

function mp3ToTrack(m) {
  return {
    id: `mp3_${m.id}`,
    name: m.nome,
    artists: m.artista || "",
    file_url: m.file_url,
    is_mp3: true,
  };
}

export default function TrackSearchModal({ open, onClose, selectedTracks = [], onConfirm, initialPastaId }) {
  const [pastas, setPastas] = useState([]);
  const [mp3s, setMp3s] = useState([]);
  const [pastaFiltro, setPastaFiltro] = useState(TODAS);
  const [busca, setBusca] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setSelected(selectedTracks);
      setBusca("");
      setPastaFiltro(initialPastaId || TODAS);
      Promise.all([
        base44.entities.PastaMp3.list("nome", 100),
        base44.entities.MinhaMp3.list("ordem", 500),
      ]).then(([p, m]) => {
        setPastas(p);
        setMp3s(m);
      });
    }
  }, [open, initialPastaId]);

  const toggleTrack = (track) => {
    setSelected((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) return prev.filter((t) => t.id !== track.id);
      return [...prev, track];
    });
  };

  const handleConfirm = () => {
    onConfirm(selected);
    handleClose();
  };

  const handleClose = () => {
    setBusca("");
    setSelected([]);
    onClose();
  };

  const isSelected = (trackId) => selected.some((t) => t.id === trackId);

  const listagem = mp3s.filter((m) => {
    if (pastaFiltro !== TODAS && m.pasta_id !== pastaFiltro) return false;
    if (busca.trim() && !`${m.nome} ${m.artista || ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B3A5F]">
            <Music className="w-5 h-5 text-[#C9A227]" />
            Selecionar Músicas
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={pastaFiltro} onValueChange={setPastaFiltro}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="Pasta" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas as pastas</SelectItem>
              {pastas.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar por nome..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {listagem.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              Nenhuma música encontrada. Envie MP3s em "Pastas de Músicas".
            </p>
          ) : (
            listagem.map((m) => {
              const track = mp3ToTrack(m);
              const sel = isSelected(track.id);
              return (
                <Card
                  key={track.id}
                  className={`cursor-pointer transition-colors ${sel ? "border-[#C9A227] bg-amber-50" : "hover:border-[#1B3A5F]"}`}
                  onClick={() => toggleTrack(track)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Music className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{m.nome}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {m.artista ? `${m.artista} • ` : ""}{m.pasta_nome || "Sem pasta"}
                      </p>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
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
              {selected.length} música{selected.length !== 1 ? "s" : ""} selecionada{selected.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleConfirm} className="bg-[#1B3A5F] text-white">Confirmar</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}