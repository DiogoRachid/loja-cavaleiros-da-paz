import { useState, useEffect, useRef } from "react";
import { Music, X, Play, Pause, Trash2, GripVertical, Repeat, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import PastaSelector from "./PastaSelector";
import EtapaCronometro from "./EtapaCronometro";
import { useMp3Playback } from "./Mp3PlaybackContext";
import TrackProgressBar from "./TrackProgressBar";

export default function RoteiroEtapa({ etapa, index, onRename, onAddTrack, onRemoveTrack, onRemove, onChangePlaylist, onStopTimer }) {
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

  const handleTocarEtapa = async () => {
    let fila = playableTracks;
    // Sem músicas avulsas: toca todas as músicas vinculadas à pasta
    if (fila.length === 0 && etapa.playlist_id) {
      const [vinculos, mp3s] = await Promise.all([
        base44.entities.PastaMusica.filter({ pasta_id: etapa.playlist_id }, "ordem", 200),
        base44.entities.MinhaMp3.list("nome", 500),
      ]);
      fila = vinculos
        .map((v) => mp3s.find((m) => m.id === v.mp3_id))
        .filter(Boolean)
        .map((m) => ({
          id: `mp3_${m.id}`,
          name: m.nome,
          artists: m.artista || "",
          file_url: m.file_url,
          is_mp3: true,
        }));
    }
    if (fila.length === 0) return;
    playback?.playEtapa(etapa.id, fila);
    setStartSignal((s) => s + 1);
  };

  const handlePararEtapa = () => {
    playback?.stopEtapa();
    setStopSignal((s) => s + 1);
  };

  const handleSaveName = () => {
    onRename(etapa.id, name.trim() || `Etapa ${num}`);
    setEditing(false);
  };

  const podeTocar = playableTracks.length > 0 || !!etapa.playlist_id;

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

        {podeTocar && (
          isEtapaPlaying ? (
            <>
              <Button
                size="icon"
                variant="outline"
                title={playback?.isPaused ? "Continuar Etapa" : "Pausar Etapa"}
                className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white h-7 w-7 flex-shrink-0"
                onClick={() => playback?.togglePauseEtapa()}
              >
                {playback?.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </Button>
              <Button
                size="icon"
                variant="outline"
                title="Parar Etapa"
                className="border-red-400 text-red-500 hover:bg-red-50 h-7 w-7 flex-shrink-0"
                onClick={handlePararEtapa}
              >
                <Square className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              size="icon"
              variant="outline"
              title="Tocar Etapa"
              className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white h-7 w-7 flex-shrink-0"
              onClick={handleTocarEtapa}
            >
              <Repeat className="w-3 h-3" />
            </Button>
          )
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
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Music className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1B3A5F] text-xs font-medium truncate">{track.name}</p>
                    <p className="text-slate-400 text-[10px] truncate">{track.artists}</p>
                  </div>
                  {track.file_url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-[#1B3A5F] hover:bg-slate-200"
                      onClick={() => playback?.toggle(track)}
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => onRemoveTrack(etapa.id, track.id)}
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