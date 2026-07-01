import { useState } from "react";
import { Search, ListMusic, Loader2, Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

export default function AddPlaylistModal({ open, onClose, onAdd, existingIds = [] }) {
  const [query, setQuery] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await base44.functions.invoke("spotifySearch", { action: "search", query });
    setPlaylists(res.data?.playlists || []);
    setLoading(false);
  };

  const handleAdd = (p) => {
    onAdd({
      spotify_playlist_id: p.id,
      spotify_playlist_name: p.name,
      spotify_playlist_image: p.image || "",
      spotify_playlist_uri: p.uri || "",
      owner: p.owner || "",
      tracks_total: p.tracks_total || 0,
    });
  };

  const handleClose = () => {
    setQuery("");
    setPlaylists([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B3A5F]">
            <ListMusic className="w-5 h-5" /> Adicionar Playlist
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Buscar playlist no Spotify..."
              className="pl-10"
            />
          </div>
          <Button onClick={search} disabled={loading} className="bg-[#1B3A5F] text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {playlists.map((p) => {
            const alreadyAdded = existingIds.includes(p.id);
            return (
              <Card key={p.id} className={alreadyAdded ? "border-green-300" : ""}>
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
                    <p className="text-xs text-slate-500 truncate">{p.owner} • {p.tracks_total} músicas</p>
                  </div>
                  {alreadyAdded ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium flex-shrink-0">
                      <Check className="w-4 h-4" /> Adicionada
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-[#1B3A5F] text-white flex-shrink-0"
                      onClick={() => handleAdd(p)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Salvar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {playlists.length === 0 && !loading && (
            <p className="text-center text-slate-400 text-sm py-8">Busque por suas playlists no Spotify.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}