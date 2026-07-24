import { useState, useEffect, useRef } from "react";
import { Music, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PastaSelector from "./PastaSelector";
import EtapaCronometro from "./EtapaCronometro";
import { useMp3Playback } from "./Mp3PlaybackContext";
import TrackRow from "./TrackRow";

export default function RoteiroEtapa({ etapa, index, onRename, onAddTrack, onRemoveTrack, onMoveTrack, onRemove, onChangePlaylist, onStopTimer }) {
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
    <div className={`rounded-xl border bg-white transition-colors ${isEtapaPlaying ? "border-[#C9A227]" : "border-slate-200"}`}>
      {/* Cabeçalho compacto */}
      <div className="flex items-center gap-2 px-2 py-2 sm:px-3">
        <button
          onClick={() => setOpen(!open)}
          className="text-slate-400 hover:text-[#1B3A5F] flex-shrink-0"
          title={open ? "Recolher etapa" : "Expandir etapa"}
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <span className="text-[#1B3A5F] text-sm font-semibold w-6 flex-shrink-0 tabular-nums">{num}</span>

        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="bg-transparent text-slate-800 font-semibold text-sm border-b border-[#C9A227] outline-none flex-1 min-w-0"
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setName(etapa.nome); }}
            className="text-slate-800 font-semibold text-sm text-left flex-1 min-w-0 truncate hover:text-[#1B3A5F]"
          >
            {etapa.nome}
          </button>
        )}

        <span className="text-xs text-slate-400 flex-shrink-0">
          {tracks.length} <Music className="w-3 h-3 inline -mt-0.5" />
        </span>

        <Button
          size="icon"
          variant="outline"
          title="Adicionar Música"
          className="border-[#1B3A5F] text-[#1B3A5F] hover:bg-[#1B3A5F] hover:text-white h-7 w-7 flex-shrink-0"
          onClick={() => onAddTrack(etapa.id)}
        >
          <Music className="w-3 h-3" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
          onClick={() => onRemove(etapa.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {open && (
        <div className="px-2 pb-2 sm:px-3 space-y-2">
          <PastaSelector
            value={etapa.playlist_id}
            onChange={(pasta) => onChangePlaylist(etapa.id, pasta)}
          />

          <EtapaCronometro
            etapaNome={etapa.nome}
            onStop={(registro) => onStopTimer(etapa.nome, registro)}
            startSignal={startSignal}
            stopSignal={stopSignal}
            isPaused={isEtapaPlaying && !!playback?.isPaused}
          />

          {tracks.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Nenhuma música nesta etapa.</p>
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
        </div>
      )}
    </div>
  );
}