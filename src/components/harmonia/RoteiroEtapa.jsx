import { useState, useEffect, useRef } from "react";
import { Music, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PastaSelector from "./PastaSelector";
import EtapaCronometro from "./EtapaCronometro";
import { useMp3Playback } from "./Mp3PlaybackContext";
import TrackRow from "./TrackRow";

export default function RoteiroEtapa({ etapa, index, onRename, onAddTrack, onRemoveTrack, onMoveTrack, onRemove, onChangePlaylist, onChangeObservacao, onStopTimer }) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(etapa.nome);
  const [startSignal, setStartSignal] = useState(0);
  const [stopSignal, setStopSignal] = useState(0);
  const playback = useMp3Playback();
  const wasPlayingRef = useRef(false);

  const num = String(index + 1).padStart(2, "0");
  const tracks = etapa.tracks || [];
  const playableTracks = tracks.filter((t) => t.file_url);
  const isEtapaPlaying = playback?.activeQueueOwner === etapa.id;

  useEffect(() => {
    if (wasPlayingRef.current && !isEtapaPlaying) setStopSignal((s) => s + 1);
    wasPlayingRef.current = isEtapaPlaying;
  }, [isEtapaPlaying]);

  // Abre automaticamente a etapa que está tocando
  useEffect(() => {
    if (isEtapaPlaying) setOpen(true);
  }, [isEtapaPlaying]);

  const handleRepeatFrom = (trackIndex) => {
    const playableIndex = playableTracks.findIndex((track) => track.id === tracks[trackIndex]?.id);
    if (playableIndex === -1) return;
    playback?.playEtapa(etapa.id, playableTracks, playableIndex);
    setStartSignal((s) => s + 1);
  };

  const handleSaveName = () => {
    onRename(etapa.id, name.trim() || `Etapa ${num}`);
    setEditing(false);
  };

  return (
    <div className={`rounded-xl border bg-card transition-colors ${isEtapaPlaying ? "border-lodge-gold" : "border-border"} ${isEtapaPlaying && playback?.nearEnd ? "ring-2 ring-lodge-gold animate-pulse" : ""}`}>
      {/* Cabeçalho compacto */}
      <div className="flex items-center gap-2 px-2 py-2 sm:px-3">
        <button
          onClick={() => setOpen(!open)}
          className="text-muted-foreground hover:text-lodge-navy flex-shrink-0"
          title={open ? "Recolher etapa" : "Expandir etapa"}
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <span className="text-lodge-navy text-sm font-semibold w-6 flex-shrink-0 tabular-nums">{num}</span>

        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="bg-transparent text-foreground font-semibold text-sm border-b border-lodge-gold outline-none flex-1 min-w-0"
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setName(etapa.nome); }}
            className="text-foreground font-semibold text-sm text-left flex-1 min-w-0 truncate hover:text-lodge-navy"
          >
            {etapa.nome}
          </button>
        )}

        <span className="text-xs text-muted-foreground flex-shrink-0">
          {tracks.length} <Music className="w-3 h-3 inline -mt-0.5" />
        </span>

        <Button
          size="icon"
          variant="outline"
          title="Adicionar Música"
          className="border-border text-lodge-navy hover:bg-primary hover:text-white h-7 w-7 flex-shrink-0"
          onClick={() => onAddTrack(etapa.id)}
        >
          <Music className="w-3 h-3" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50 flex-shrink-0"
          onClick={() => onRemove(etapa.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {open && (
        <div className="px-2 pb-2 sm:px-3 space-y-2">
          <PastaSelector
            value={etapa.playlist_id}
            valueName={etapa.playlist_name}
            onChange={(pasta) => onChangePlaylist(etapa.id, pasta)}
          />

          <Textarea
            placeholder="Observação desta etapa"
            value={etapa.observacao || ""}
            onChange={(e) => onChangeObservacao?.(etapa.id, e.target.value)}
            className="text-xs min-h-[56px]"
          />

          <EtapaCronometro
            etapaNome={etapa.nome}
            onStop={(registro) => onStopTimer(etapa.nome, registro)}
            startSignal={startSignal}
            stopSignal={stopSignal}
            isPaused={isEtapaPlaying && !!playback?.isPaused}
          />

          {tracks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Nenhuma música nesta etapa.</p>
          ) : (
            <div className="space-y-1.5">
              {tracks.map((track, ti) => {
                const isCurrent = playback?.currentTrackId === track.id;
                return (
                  <TrackRow
                    key={track.id || ti}
                    track={track}
                    index={ti}
                    total={tracks.length}
                    isCurrent={isCurrent}
                    isPlaying={isCurrent && !playback?.isPaused}
                    onToggle={(t) => playback?.toggle(t)}
                    onMove={(trackId, dir) => onMoveTrack(etapa.id, trackId, dir)}
                    onRemove={(trackId) => onRemoveTrack(etapa.id, trackId)}
                    onRepeat={handleRepeatFrom}
                    position={isCurrent ? playback.position : 0}
                    duration={isCurrent ? playback.duration : 0}
                    onSeek={(ms) => isCurrent && playback.seek(ms)}
                  />
                );
              })}
            </div>
          )}

          {playback?.error && <p className="text-xs text-red-500">{playback.error}</p>}
          {isEtapaPlaying && playback?.analyzing && (
            <p className="text-xs text-warning animate-pulse">Analisando áudio…</p>
          )}
        </div>
      )}
    </div>
  );
}