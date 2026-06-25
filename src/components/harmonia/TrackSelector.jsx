import { useState, useEffect } from "react";
import { Check, Loader2, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SpotifyPlayer from "./SpotifyPlayer";

function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function TrackSelector({ playlistId, selectedTracks, onSave, onCancel }) {
  const [tracks, setTracks] = useState([]);
  const [selected, setSelected] = useState(selectedTracks || []);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState(null);

  useEffect(() => { loadTracks(); }, [playlistId]);

  const loadTracks = async () => {
    const res = await base44.functions.invoke("spotifySearch", { action: "tracks", playlist_id: playlistId });
    setTracks(res.data?.tracks || []);
    setLoading(false);
  };

  const toggleTrack = (trackId) => {
    setSelected(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  };

  const selectAll = () => setSelected(tracks.map(t => t.id));
  const deselectAll = () => setSelected([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">
          {selected.length} de {tracks.length} músicas selecionadas
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={selectAll}>Selecionar todas</Button>
          <Button size="sm" variant="outline" onClick={deselectAll}>Limpar</Button>
        </div>
      </div>

      {playingTrack && (
        <SpotifyPlayer trackId={playingTrack} />
      )}

      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {tracks.map((t, i) => {
          const isSelected = selected.includes(t.id);
          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-green-50 border border-green-200" : "hover:bg-slate-50"
              }`}
              onClick={() => toggleTrack(t.id)}
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                isSelected ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                {isSelected ? <Check className="w-3 h-3" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              {t.image ? (
                <img src={t.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
                <p className="text-xs text-slate-500 truncate">{t.artists}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{formatDuration(t.duration_ms)}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayingTrack(playingTrack === t.id ? null : t.id);
                }}
              >
                {playingTrack === t.id ? "⏸" : "▶"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave(selected)} className="bg-[#1B3A5F] text-white">
          Salvar Seleção ({selected.length})
        </Button>
      </div>
    </div>
  );
}