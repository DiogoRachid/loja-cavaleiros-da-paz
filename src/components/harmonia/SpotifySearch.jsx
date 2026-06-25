import { useState } from "react";
import { Search, Plus, Music, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

export default function SpotifySearch({ onAddPlaylist, addedIds }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await base44.functions.invoke("spotifySearch", { action: "search", query });
    setResults(res.data?.playlists || []);
    setSearching(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Buscar playlists no Spotify..."
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching} className="bg-[#1DB954] hover:bg-[#1aa34a] text-white">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid gap-3 max-h-[400px] overflow-y-auto">
          {results.map(p => {
            const isAdded = addedIds.includes(p.id);
            return (
              <Card key={p.id} className={isAdded ? "opacity-50" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.owner} • {p.tracks_total} músicas</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={isAdded}
                    onClick={() => onAddPlaylist(p)}
                    className={isAdded ? "bg-slate-300" : "bg-[#1B3A5F] text-white"}
                  >
                    <Plus className="w-3 h-3 mr-1" />{isAdded ? "Adicionada" : "Adicionar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}