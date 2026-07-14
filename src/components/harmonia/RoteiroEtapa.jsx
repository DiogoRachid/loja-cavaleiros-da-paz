import { useState, useEffect, useRef } from "react";
import { Music, X, Play, Pause, Trash2, GripVertical, Repeat, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PastaSelector from "./PastaSelector";
import EtapaCronometro from "./EtapaCronometro";
import { useMp3Playback } from "./Mp3PlaybackContext";
import TrackProgressBar from "./TrackProgressBar";

export default function RoteiroEtapa({ etapa, index, onRename, onAddTrack, onRemoveTrack, onMoveTrack, onRemove, onChangePlaylist, onStopTimer }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(etapa.nome);
  const [startSignal, setStartSignal] = useState(0);
  const [stopSignal, setStopSignal] = useState(0);
  const playback = useMp3Playback();
  const wasPlayingRef = useRef(false);

  const num = String(index + 1).padStart(2, "0");
  const tracks = etapa.tracks || [];
  const playableTracks = tracks.filter((t) => t.file_url);
  const isEtapaPlaying = playback?.activeQueueOwner === etapa.id;

  // Quando esta etapa deixa de ser a que está tocando, para o cronômetro automaticamente
  useEffect(() => {
    if (wasPlayingRef.current && !isEtapaPlaying) {
      setStopSignal((s) => s + 1);
    }
    wasPlayingRef.current = isEtapaPlaying;
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
    <div className="rounded-xl border border-slate-200 bg-white hover:border-[#C9A227] transition-colors group">
      <div className="flex items-center flex-wrap gap-3 px-4 py-3">
        <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />

        <span className="text-[#1B3A5F] text-sm font-semibold w-6 flex-shrink-0">{num}</span>

        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
            className="bg-transparent text-slate-800 font-semibold text-sm border-b border-[#C9A227] outline-none flex-1 min-w-[80px]"
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setName(etapa.nome); }}
            className="text-slate-800 font-semibold text-sm text-left flex-1 min-w-[80px] truncate hover:text-[#1B3A5F] transition-colors"
          >
            {etapa.nome}
          </button>
        )}

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

      <div className="px-4 pb-3 sm:ml-8">
        <PastaSelector
          value={etapa.playlist_id}
          onChange={(pasta) => onChangePlaylist(etapa.id, pasta)}
        />
      </div>

      <EtapaCronometro
        etapaNome={etapa.nome}
        onStop={(registro) => onStopTimer(etapa.nome, registro)}
        startSignal={startSignal}
        stopSignal={stopSignal}
        isPaused={isEtapaPlaying && !!playback?.isPaused}
      />

      {tracks.length > 0 && (
        <div className="px-4 pb-3 pt-1 space-y-2 ml-8">
          {tracks.map((track, ti) => {
            const isCurrentTrack = playback?.currentTrackId === track.id;
            const isPlaying = isCurrentTrack && !playback?.isPaused;
            return (
              <div key={track.id || ti} className="p-2 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-[#1B3A5F] text-[10px] font-bold w-5 text-right flex-shrink-0">
                    {String(ti + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col flex-shrink-0">
                    <button
                      title="Mover para cima"
                      disabled={ti === 0}
                      className="text-slate-400 hover:text-[#1B3A5F] disabled:opacity-20 disabled:cursor-default"
                      onClick={() => onMoveTrack(etapa.id, track.id, -1)}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      title="Mover para baixo"
                      disabled={ti === tracks.length - 1}
                      className="text-slate-400 hover:text-[#1B3A5F] disabled:opacity-20 disabled:cursor-default"
                      onClick={() => onMoveTrack(etapa.id, track.id, 1)}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Music className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1B3A5F] text-xs font-medium break-words">{track.name}</p>
                    {track.artists && <p className="text-slate-400 text-[10px] break-words">{track.artists}</p>}
                  </div>
                  {track.file_url && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Tocar ou pausar música"
                        className="h-6 w-6 text-[#1B3A5F] hover:bg-slate-200"
                        onClick={() => playback?.toggle(track)}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Repetir lista a partir desta música"
                        className="h-6 w-6 text-[#C9A227] hover:bg-amber-50"
                        onClick={() => handleRepeatFrom(ti)}
                      >
                        <Repeat className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Remover a música \"${track.name}\" desta etapa?`)) {
                        onRemoveTrack(etapa.id, track.id);
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                {isCurrentTrack && (
                  <div className="mt-1">
                    <TrackProgressBar
                      position={playback.position}
                      duration={playback.duration}
                      onSeek={(ms) => playback.seek(ms)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {playback?.error && (
        <p className="px-4 pb-2 ml-8 text-[10px] text-red-500">{playback.error}</p>
      )}
    </div>
  );
}