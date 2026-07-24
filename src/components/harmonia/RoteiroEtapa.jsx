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
        <div className="px-2 sm:px-4 pb-3 pt-1 space-y-2 sm:ml-8">
          {tracks.map((track, ti) => {
            const isCurrentTrack = playback?.currentTrackId === track.id;
            const isPlaying = isCurrentTrack && !playback?.isPaused;
            return (
              <div key={track.id || ti} className={`mx-auto flex min-h-[300px] w-full max-w-[360px] flex-col justify-center rounded-xl bg-[#253251] px-5 py-5 text-white shadow-lg transition-shadow ${isCurrentTrack ? "ring-2 ring-[#D6B45E] shadow-xl" : ""}`}>
                <div className="text-center">
                  <span className="block text-5xl font-bold tracking-tight text-white">
                    {String(ti + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-base font-semibold break-words leading-6 text-white">{track.name}</p>
                  {track.artists && <p className="mt-1 text-sm break-words text-slate-300">{track.artists}</p>}
                  <div className="mt-3 space-y-0.5 text-xs text-slate-400">
                    <p>Tocar ou pausar música</p>
                    <p>Repetir lista a partir desta música</p>
                    <p>Remover música</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Mover para cima"
                    disabled={ti === 0}
                    className="h-10 w-10 text-white hover:text-[#D6B45E] hover:bg-white/10 disabled:opacity-20"
                    onClick={() => onMoveTrack(etapa.id, track.id, -1)}
                  >
                    <ChevronUp className="w-5 h-5 -rotate-90" />
                  </Button>
                  {track.file_url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Tocar ou pausar música"
                      className="h-12 w-12 rounded-full border-[3px] border-[#D6B45E] text-[#D6B45E] hover:bg-[#D6B45E] hover:text-[#253251]"
                      onClick={() => playback?.toggle(track)}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Mover para baixo"
                    disabled={ti === tracks.length - 1}
                    className="h-10 w-10 text-white hover:text-[#D6B45E] hover:bg-white/10 disabled:opacity-20"
                    onClick={() => onMoveTrack(etapa.id, track.id, 1)}
                  >
                    <ChevronDown className="w-5 h-5 -rotate-90" />
                  </Button>
                  {track.file_url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Repetir lista a partir desta música"
                      className="h-10 w-10 text-white hover:text-[#D6B45E] hover:bg-white/10"
                      onClick={() => handleRepeatFrom(ti)}
                    >
                      <Repeat className="w-5 h-5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Remover música"
                    className="h-10 w-10 text-slate-400 hover:text-red-300 hover:bg-white/10"
                    onClick={() => {
                      if (window.confirm(`Remover a música \"${track.name}\" desta etapa?`)) {
                        onRemoveTrack(etapa.id, track.id);
                      }
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mt-4">
                  <TrackProgressBar
                    position={isCurrentTrack ? playback.position : 0}
                    duration={isCurrentTrack ? playback.duration : 0}
                    onSeek={(ms) => isCurrentTrack && playback.seek(ms)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {playback?.error && (
        <p className="px-3 sm:px-4 pb-2 sm:ml-8 text-xs text-red-500">{playback.error}</p>
      )}
    </div>
  );
}