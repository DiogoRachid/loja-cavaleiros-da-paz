import { useState, useEffect } from "react";
import { Search, Music, Loader2, ListMusic, Check, Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

function formatDuration(ms) {
  if (!ms) return "";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function TrackSearchModal({ open, onClose, selectedTracks = [], onConfirm, initialPlaylistId }) {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [myMp3s, setMyMp3s] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [playlistError, setPlaylistError] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(selectedTracks);
      setTab(initialPlaylistId ? "playlist" : "search");
      if (initialPlaylistId) {
        loadPlaylistTracks(initialPlaylistId);
      }
    }
  }, [open, initialPlaylistId]);

  const loadMyPlaylists = async () => {
    const data = await base44.entities.MinhaPlaylist.list("-created_date", 50);
    setMyPlaylists(data);
  };

  useEffect(() => {
    if (open && tab === "playlist" && myPlaylists.length === 0) {
      loadMyPlaylists();
    }
  }, [open, tab]);

  const loadMyMp3s = async () => {
    const data = await base44.entities.MinhaMp3.list("-created_date", 100);
    setMyMp3s(data);
  };

  useEffect(() => {
    if (open && tab === "mp3" && myMp3s.length === 0) {
      loadMyMp3s();
    }
  }, [open, tab]);

  const searchTracks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke("spotifySearch", { action: "search_tracks", query });
    setTracks(res.data?.tracks || []);
    setLoading(false);
  };

  const loadPlaylistTracks = async (playlistId) => {
    setLoading(true);
    setSelectedPlaylist(playlistId);
    setPlaylistError("");
    const res = await base44.functions.invoke("spotifySearch", { action: "tracks", playlist_id: playlistId });
    setTracks(res.data?.tracks || []);
    setPlaylistError(res.data?.error || "");
    setLoading(false);
  };

  const toggleTrack = (track) => {
    setSelected((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) return prev.filter((t) => t.id !== track.id);
      return [...prev, track];
    });
  };

  const handleConfirm = () => {
    onConfirm(selected);
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setTracks([]);
    setSelectedPlaylist(null);
    setSelected([]);
    onClose();
  };

  const isSelected = (trackId) => selected.some((t) => t.id === trackId);

  const renderTrackRow = (track) => {
    const sel = isSelected(track.id);
    return (
      <Card
        key={track.id}
        className={`cursor-pointer transition-colors ${sel ? "border-[#C9A227] bg-amber-50" : "hover:border-[#1B3A5F]"}`}
        onClick={() => toggleTrack(track)}
      >
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
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              sel ? "bg-[#C9A227]" : "bg-slate-200"
            }`}
          >
            {sel ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-slate-500" />}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B3A5F]">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" className="w-5 h-5" alt="" />
            Selecionar Músicas
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search"><Search className="w-3 h-3 mr-1" />Buscar música</TabsTrigger>
            <TabsTrigger value="playlist"><ListMusic className="w-3 h-3 mr-1" />Minhas Playlists</TabsTrigger>
            <TabsTrigger value="mp3"><Upload className="w-3 h-3 mr-1" />Meus MP3s</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchTracks()}
                  placeholder="Nome da música ou artista..."
                  className="pl-10"
                />
              </div>
              <Button onClick={searchTracks} disabled={loading} className="bg-[#1B3A5F] text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {tracks.map(renderTrackRow)}
            </div>
          </TabsContent>

          <TabsContent value="playlist" className="flex-1 overflow-hidden flex flex-col gap-3">
            {!selectedPlaylist ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {myPlaylists.length === 0 && !loading ? (
                  <p className="text-center text-slate-400 text-sm py-8">
                    Nenhuma playlist cadastrada. Adicione pela barra lateral.
                  </p>
                ) : (
                  myPlaylists.map((p) => (
                    <Card
                      key={p.id}
                      className="cursor-pointer hover:border-[#1B3A5F]"
                      onClick={() => loadPlaylistTracks(p.spotify_playlist_id)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        {p.spotify_playlist_image ? (
                          <img src={p.spotify_playlist_image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <ListMusic className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{p.spotify_playlist_name}</p>
                          <p className="text-xs text-slate-500">{p.owner} • {p.tracks_total} músicas</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => { setSelectedPlaylist(null); setTracks([]); setPlaylistError(""); }} className="self-start">
                  ← Voltar para playlists
                </Button>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : playlistError ? (
                    <p className="text-center text-red-500 text-sm py-8 px-4">{playlistError}</p>
                  ) : (
                    tracks.map(renderTrackRow)
                  )}
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="mp3" className="flex-1 overflow-hidden flex flex-col gap-3">
            <div className="flex-1 overflow-y-auto space-y-2">
              {myMp3s.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">
                  Nenhum MP3 enviado. Adicione pela barra lateral em "Meus MP3s".
                </p>
              ) : (
                myMp3s.map((m) =>
                  renderTrackRow({
                    id: `mp3_${m.id}`,
                    name: m.nome,
                    artists: m.artista || "",
                    album: "",
                    duration_ms: 0,
                    uri: "",
                    image: "",
                    is_mp3: true,
                    file_url: m.file_url,
                  })
                )
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-slate-500">
              {selected.length} música{selected.length !== 1 ? "s" : ""} selecionada{selected.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleConfirm} className="bg-[#1B3A5F] text-white">
                Confirmar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}