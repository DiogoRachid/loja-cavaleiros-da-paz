import { Plus, ListMusic, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MinhasPlaylistsSidebar({
  playlists,
  loading,
  onAddPlaylist,
  onDeletePlaylist,
  activePlaylistId,
  onSelectPlaylist,
}) {
  return (
    <Card className="lg:sticky lg:top-20 self-start">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1B3A5F] flex items-center gap-2">
            <ListMusic className="w-4 h-4" /> Minhas Playlists
          </h3>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-[#1B3A5F] hover:bg-slate-100"
            onClick={onAddPlaylist}
            title="Adicionar playlist"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400">Playlists pré-cadastradas para todas as reuniões</p>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-6">
            <ListMusic className="w-8 h-8 mx-auto text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">Nenhuma playlist cadastrada.</p>
            <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={onAddPlaylist}>
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {playlists.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  activePlaylistId === p.spotify_playlist_id
                    ? "bg-[#1B3A5F]/10 ring-1 ring-[#1B3A5F]"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => onSelectPlaylist(p)}
              >
                {p.spotify_playlist_image ? (
                  <img src={p.spotify_playlist_image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{p.spotify_playlist_name}</p>
                  <p className="text-[10px] text-slate-400">{p.tracks_total || 0} músicas</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); onDeletePlaylist(p); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}