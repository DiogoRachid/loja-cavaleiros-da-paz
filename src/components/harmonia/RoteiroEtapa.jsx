import { useState, useEffect, useRef } from "react";
import { Music, Plus, X, Play, Pause, Trash2, GripVertical, Loader2, Repeat, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaylistSelector from "./PlaylistSelector";
import EtapaCronometro from "./EtapaCronometro";
import { useSpotifyPlayback } from "./SpotifyPlaybackContext";

function formatMs(ms) {
  const totalSec = Math.max(0, Math.floor((ms || 0) / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RoteiroEtapa({ etapa, index, onRename, onAddTrack, onRemoveTrack, onRemove, onChangePlaylist, onStopTimer }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(etapa.nome);
  const [mp3Player, setMp3Player] = useState(null);
  const [startSignal, setStartSignal] = useState(0);
  const [stopSignal, setStopSignal] = useState(0);
  const playback = useSpotifyPlayback();
  const wasPlayingRef = useRef(false);

  const [mp3EtapaPlaying, setMp3EtapaPlaying] = useState(false);

  const num = String(index + 1).padStart(2, "0");
  const tracks = etapa.tracks || [];
  const spotifyUris = tracks.filter((t) => !t.is_mp3 && t.uri).map((t) => t.uri);
  const isEtapaPlaying = playback?.activeQueueOwner === etapa.id || mp3EtapaPlaying;

  // Quando esta etapa deixa de ser a que está tocando (outra iniciou ou parou),
  // para o cronômetro desta etapa automaticamente.
  useEffect(() => {
    if (wasPlayingRef.current && !isEtapaPlaying) {
      setStopSignal((s) => s + 1);
    }
    wasPlayingRef.current = isEtapaPlaying;
  }, [isEtapaPlaying]);

  const handleTocarEtapa = () => {
    if (spotifyUris.length > 0) {
      playback?.activateElement(); // libera o áudio dentro do gesto de clique (autoplay do navegador)
      playback?.playEtapa(etapa.id, spotifyUris);
    } else {
      // Etapa só com MP3: toca o primeiro MP3 da etapa
      const primeiroMp3 = tracks.find((t) => t.is_mp3);
      if (primeiroMp3) setMp3Player(primeiroMp3.id);
      setMp3EtapaPlaying(true);
    }
    setStartSignal((s) => s + 1);
  };

  const handlePararEtapa = () => {
    if (spotifyUris.length > 0) {
      playback?.stopEtapa();
    } else {
      setMp3Player(null);
      setMp3EtapaPlaying(false);
    }
    setStopSignal((s) => s + 1);
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

        {tracks.length > 0 && (
          isEtapaPlaying ? (
            <>
              {spotifyUris.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white text-xs h-7 flex-shrink-0"
                  onClick={() => playback?.togglePauseEtapa()}
                >
                  {playback?.isPaused ? (
                    <><Play className="w-3 h-3 mr-1" /> Continuar Etapa</>
                  ) : (
                    <><Pause className="w-3 h-3 mr-1" /> Pausar Etapa</>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-red-400 text-red-500 hover:bg-red-50 text-xs h-7 flex-shrink-0"
                onClick={handlePararEtapa}
              >
                <Square className="w-3 h-3 mr-1" /> Parar Etapa
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white text-xs h-7 flex-shrink-0"
              onClick={handleTocarEtapa}
            >
              <Repeat className="w-3 h-3 mr-1" /> Tocar Etapa
            </Button>
          )
        )}

        <Button
          size="sm"
          variant="outline"
          className="border-[#1B3A5F] text-[#1B3A5F] hover:bg-[#1B3A5F] hover:text-white text-xs h-7 flex-shrink-0"
          onClick={() => onAddTrack(etapa.id)}
        >
          <Music className="w-3 h-3 mr-1" /> Adicionar Música
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
        <PlaylistSelector
          value={etapa.playlist_id}
          onChange={(playlist) => onChangePlaylist(etapa.id, playlist)}
        />
      </div>

      <EtapaCronometro
        etapaNome={etapa.nome}
        onStop={(registro) => onStopTimer(etapa.nome, registro)}
        startSignal={startSignal}
        stopSignal={stopSignal}
        isPaused={spotifyUris.length > 0 && playback?.activeQueueOwner === etapa.id && !!playback?.isPaused}
      />

      {tracks.length > 0 && (
        <div className="px-4 pb-3 pt-1 space-y-2 ml-8">
          {tracks.map((track, ti) => {
            const isSpotifyPlaying =
              !track.is_mp3 && playback?.currentUri === track.uri && !playback?.isPaused;
            const isLoading =
              !track.is_mp3 && playback?.initializing && playback?.currentUri !== track.uri;
            return (
              <div key={track.id || ti} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                {track.image ? (
                  <img src={track.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <Music className="w-3 h-3 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[#1B3A5F] text-xs font-medium truncate">{track.name}</p>
                  {!track.is_mp3 && playback?.currentUri === track.uri ? (
                    <>
                      <p className="text-[#C9A227] text-[10px] font-mono tabular-nums">
                        {formatMs(playback.position)} - {formatMs(playback.duration || track.duration_ms)}
                      </p>
                      <div
                        className="mt-1 h-2 w-full rounded-full bg-slate-200 cursor-pointer relative"
                        onClick={(e) => {
                          const total = playback.duration || track.duration_ms || 0;
                          if (!total) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                          playback.seek(ratio * total);
                        }}
                      >
                        <div
                          className="h-2 rounded-full bg-[#C9A227] transition-all"
                          style={{
                            width: `${Math.min(100, ((playback.position || 0) / (playback.duration || track.duration_ms || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-slate-400 text-[10px] truncate">{track.artists}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-[#1B3A5F] hover:bg-slate-200"
                  onClick={() => {
                    if (track.is_mp3) {
                      setMp3Player(mp3Player === track.id ? null : track.id);
                    } else if (track.uri && playback) {
                      playback.activateElement();
                      playback.toggle(track.uri);
                    }
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (track.is_mp3 ? mp3Player === track.id : isSpotifyPlaying) ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => onRemoveTrack(etapa.id, track.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {playback?.error && (
        <p className="px-4 pb-2 ml-8 text-[10px] text-red-500">{playback.error}</p>
      )}

      {mp3Player && tracks.find((t) => t.id === mp3Player)?.is_mp3 && (
        <div className="px-4 pb-3 ml-8">
          <audio
            controls
            autoPlay
            src={tracks.find((t) => t.id === mp3Player).file_url}
            className="w-full h-10"
          />
        </div>
      )}
    </div>
  );
}