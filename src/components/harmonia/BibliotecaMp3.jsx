import { useState, useRef } from "react";
import { Music, Upload, Trash2, Loader2, ChevronDown, ChevronUp, Library, Search, FolderPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AudioPlayer from "@/components/harmonia/AudioPlayer";
import FiltroPastasDropdown, { SEM_PASTA_ID } from "@/components/harmonia/FiltroPastasDropdown";
import PlayerListaFiltrada from "@/components/harmonia/PlayerListaFiltrada";

export default function BibliotecaMp3({ mp3s, pastas = [], vinculos = [], onUpload, onDelete, onTogglePasta }) {
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busca, setBusca] = useState("");
  const [pastasFiltro, setPastasFiltro] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    await onUpload(files);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const termo = busca.trim().toLowerCase();

  const pastasDaMusica = (mp3Id) =>
    new Set(vinculos.filter((v) => v.mp3_id === mp3Id).map((v) => v.pasta_id));

  const dasPastasSelecionadas = pastasFiltro.length > 0
    ? mp3s.filter((m) => {
        const nas = pastasDaMusica(m.id);
        if (pastasFiltro.includes(SEM_PASTA_ID) && nas.size === 0) return true;
        return pastasFiltro.some((pid) => pid !== SEM_PASTA_ID && nas.has(pid));
      })
    : mp3s;

  const filtradas = termo
    ? dasPastasSelecionadas.filter((m) =>
        m.nome.toLowerCase().includes(termo) || (m.artista || "").toLowerCase().includes(termo)
      )
    : dasPastasSelecionadas;

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lodge-navy/10">
            <Library className="h-5 w-5 text-lodge-navy" />
          </div>
          <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(!expanded)}>
            <p className="font-semibold text-slate-800 text-sm">Biblioteca de Músicas</p>
            <p className="text-xs text-slate-500">{mp3s.length} música{mp3s.length !== 1 ? "s" : ""} enviada{mp3s.length !== 1 ? "s" : ""}</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4"
            className="hidden"
            onChange={handleFiles}
          />
          <FiltroPastasDropdown pastas={pastas} selectedIds={pastasFiltro} onChange={setPastasFiltro} />
          <PlayerListaFiltrada musicas={dasPastasSelecionadas} />
          <Button
            size="sm"
            disabled={uploading}
            className="bg-lodge-navy text-primary-foreground hover:bg-lodge-navy/90"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
            Enviar MP3s
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setExpanded(!expanded)} aria-label={expanded ? "Recolher biblioteca" : "Expandir biblioteca"} aria-expanded={expanded}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar música por nome ou artista..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            {filtradas.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">
                {termo ? "Nenhuma música encontrada." : "Nenhuma música enviada ainda."}
              </p>
            ) : (
              filtradas.map((m) => {
                const nasPastas = pastasDaMusica(m.id);
                return (
                  <div key={m.id} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Music className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-800 truncate">{m.nome}</p>
                        {m.artista && <p className="text-xs text-slate-400 truncate">{m.artista}</p>}
                      </div>
                    </div>
                    <AudioPlayer src={m.file_url} />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-[#1B3A5F] hover:bg-blue-50"
                            title="Adicionar a uma pasta"
                          >
                            <FolderPlus className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel className="text-xs">Adicionar / remover de pasta</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {pastas.length === 0 ? (
                            <DropdownMenuItem disabled className="text-xs">Nenhuma pasta criada</DropdownMenuItem>
                          ) : (
                            <div className="max-h-56 overflow-y-auto">
                              {pastas.map((p) => (
                                <DropdownMenuItem
                                  key={p.id}
                                  onClick={() => onTogglePasta(m, p)}
                                  className="text-sm cursor-pointer"
                                >
                                  <span className="flex-1 truncate">{p.nome}</span>
                                  {nasPastas.has(p.id) && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
                                </DropdownMenuItem>
                              ))}
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => onDelete(m)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}