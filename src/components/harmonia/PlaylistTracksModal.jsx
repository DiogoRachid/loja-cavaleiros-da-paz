import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Music, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SpotifyPlayer from "./SpotifyPlayer";

function formatDuration(ms) {
  if (!ms) return "";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function PlaylistTracksModal({ open, onClose, playlistId, playlistName }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    if (open && playlistId) {
      setPlayingId(null);
      setLoading(true);
      base44.functions.invoke("spotifySearch", { action: "tracks", playlist_id: playlistId }).then((res) => {
        setTracks(res.data?.tracks || []);
        setLoading(false);
      });
    }
  }, [open, playlistId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#1B3A5F]">{playlistName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : tracks.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">Nenhuma música encontrada.</p>
          ) : (
            tracks.map((track) => (
              <div key={track.id} className="rounded-lg border border-slate-200">
                <button
                  onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                >
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
                  <div className="w-8 h-8 rounded-full bg-[#1B3A5F] flex items-center justify-center flex-shrink-0">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </button>
                {playingId === track.id && (
                  <div className="px-3 pb-3">
                    <SpotifyPlayer trackId={track.id} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}