import { useState } from "react";
import { Music, Plus, X, Play, Pause, Trash2, GripVertical, Loader2, Repeat, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaylistSelector from "./PlaylistSelector";
import EtapaCronometro from "./EtapaCronometro";
import { useSpotifyPlayback } from "./SpotifyPlaybackContext";

export default function RoteiroEtapa({ etapa, index, onRename, onAddTrack, onRemoveTrack, onRemove, onChangePlaylist, onStopTimer }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(etapa.nome);
  const [mp3Player, setMp3Player] = useState(null);
  const playback = useSpotifyPlayback();

  const num = String(index + 1).padStart(2, "0");
  const tracks = etapa.tracks || [];
  const spotifyUris = tracks.filter((t) => !t.is_mp3 && t.uri).map((t) => t.uri);
  const isEtapaPlaying = playback?.activeQueueOwner === etapa.id;

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

        {spotifyUris.length > 0 && (
          isEtapaPlaying ? (
            <Button
              size="sm"
              variant="outline"
              className="border-red-400 text-red-500 hover:bg-red-50 text-xs h-7 flex-shrink-0"
              onClick={() => playback?.stopEtapa()}
            >
              <Square className="w-3 h-3 mr-1" /> Parar Etapa
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white text-xs h-7 flex-shrink-0"
              onClick={() => playback?.playEtapa(etapa.id, spotifyUris)}
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
                  <p className="text-slate-400 text-[10px] truncate">{track.artists}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-[#1B3A5F] hover:bg-slate-200"
                  onClick={() => {
                    if (track.is_mp3) {
                      setMp3Player(mp3Player === track.id ? null : track.id);
                    } else if (track.uri && playback) {
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