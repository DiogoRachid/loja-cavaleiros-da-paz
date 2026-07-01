import { useState } from "react";
import { Search, Music, Loader2, Check, ListMusic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function TrackRow({ track, onSelect }) {
  return (
    <Card className="cursor-pointer hover:border-[#1DB954] transition-colors" onClick={() => onSelect(track)}>
      <CardContent className="p-3 flex items-center gap-3">
        {track.image ? (
          <img src={track.image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm truncate">{track.name}</p>
          <p className="text-xs text-slate-500 truncate">{track.artists} {track.album ? `• ${track.album}` : ""}</p>
        </div>
        <span className="text-xs text-slate-400 flex-shrink-0">{formatDuration(track.duration_ms)}</span>
        <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrackSearchModal({ open, onClose, onSelect }) {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);

  const searchTracks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke("spotifySearch", { action: "search_tracks", query });
    setTracks(res.data?.tracks || []);
    setLoading(false);
  };

  const searchPlaylists = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke("spotifySearch", { action: "search", query });
    setPlaylists(res.data?.playlists || []);
    setLoading(false);
  };

  const loadPlaylistTracks = async (playlistId) => {
    setLoading(true);
    setSelectedPlaylist(playlistId);
    const res = await base44.functions.invoke("spotifySearch", { action: "tracks", playlist_id: playlistId });
    setTracks(res.data?.tracks || []);
    setLoading(false);
  };

  const handleSelect = (track) => {
    onSelect(track);
    onClose();
    setQuery("");
    setTracks([]);
    setPlaylists([]);
    setSelectedPlaylist(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B3A5F]">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" className="w-5 h-5" alt="" />
            Selecionar Música
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search"><Search className="w-3 h-3 mr-1" />Buscar música</TabsTrigger>
            <TabsTrigger value="playlist"><ListMusic className="w-3 h-3 mr-1" />Da playlist</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchTracks()}
                  placeholder="Nome da música ou artista..."
                  className="pl-10"
                />
              </div>
              <Button onClick={searchTracks} disabled={loading} className="bg-[#1DB954] hover:bg-[#1aa34a] text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {tracks.map(t => <TrackRow key={t.id} track={t} onSelect={handleSelect} />)}
            </div>
          </TabsContent>

          <TabsContent value="playlist" className="flex-1 overflow-hidden flex flex-col gap-3">
            {!selectedPlaylist ? (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && searchPlaylists()}
                      placeholder="Buscar playlist..."
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={searchPlaylists} disabled={loading} className="bg-[#1DB954] hover:bg-[#1aa34a] text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {playlists.map(p => (
                    <Card key={p.id} className="cursor-pointer hover:border-[#1DB954]" onClick={() => loadPlaylistTracks(p.id)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <ListMusic className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.owner} • {p.tracks_total} músicas</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => { setSelectedPlaylist(null); setTracks([]); }} className="self-start">
                  ← Voltar para playlists
                </Button>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {tracks.map(t => <TrackRow key={t.id} track={t} onSelect={handleSelect} />)}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}