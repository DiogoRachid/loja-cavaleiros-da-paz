import { useState, useEffect } from "react";
import { ListMusic } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

export default function PlaylistSelector({ value, onChange }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    base44.entities.MinhaPlaylist.list("-created_date", 50).then(setPlaylists);
  }, []);

  const handleChange = (playlistId) => {
    const p = playlists.find((pl) => pl.spotify_playlist_id === playlistId);
    onChange(p ? { id: p.spotify_playlist_id, name: p.spotify_playlist_name } : null);
  };

  return (
    <div className="flex items-center gap-2">
      <ListMusic className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <span className="text-xs text-slate-500 flex-shrink-0">Playlist da etapa:</span>
      <Select value={value || ""} onValueChange={handleChange}>
        <SelectTrigger className="h-8 text-xs max-w-[220px]">
          <SelectValue placeholder="Selecionar playlist" />
        </SelectTrigger>
        <SelectContent>
          {playlists.map((p) => (
            <SelectItem key={p.id} value={p.spotify_playlist_id}>
              {p.spotify_playlist_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}