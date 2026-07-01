import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { ListMusic, Loader2, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminMinhasPlaylists() {
  const [connected, setConnected] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const initedRef = useRef(false);

  const redirectUri = `${window.location.origin}/AdminMinhasPlaylists`;

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    init();
  }, []);

  const init = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Remove o código da URL imediatamente para evitar reenvio (o código é de uso único)
      window.history.replaceState({}, "", window.location.pathname);
      await base44.functions.invoke("spotifyAuth", { action: "exchange_code", code, redirect_uri: redirectUri });
    }

    const statusRes = await base44.functions.invoke("spotifyAuth", { action: "status" });
    const isConnected = !!statusRes.data?.connected;
    setConnected(isConnected);

    if (isConnected) {
      await sincronizar();
    } else {
      const local = await base44.entities.MinhaPlaylist.list("-created_date", 50);
      setPlaylists(local);
    }
    setLoading(false);
  };

  const conectar = async () => {
    setConnecting(true);
    const res = await base44.functions.invoke("spotifyAuth", { action: "authorize_url", redirect_uri: redirectUri });
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
    setConnecting(false);
  };

  const desconectar = async () => {
    if (!confirm("Deseja desconectar sua conta do Spotify?")) return;
    await base44.functions.invoke("spotifyAuth", { action: "disconnect" });
    setConnected(false);
    setPlaylists([]);
  };

  const sincronizar = async () => {
    setSyncing(true);
    const res = await base44.functions.invoke("spotifyAuth", { action: "my_playlists" });
    const spotifyPlaylists = res.data?.playlists || [];

    const existentes = await base44.entities.MinhaPlaylist.list();
    for (const p of existentes) {
      await base44.entities.MinhaPlaylist.delete(p.id);
    }
    if (spotifyPlaylists.length > 0) {
      await base44.entities.MinhaPlaylist.bulkCreate(spotifyPlaylists);
    }
    setPlaylists(spotifyPlaylists);
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
            <ListMusic className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B3A5F]">Minhas Playlists</h1>
            <p className="text-slate-500 text-sm">Playlists da sua biblioteca Spotify, usadas em todas as reuniões</p>
          </div>
        </div>

        {connected && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={sincronizar} disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Atualizar
            </Button>
            <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={desconectar}>
              <LogOut className="w-4 h-4 mr-2" /> Desconectar
            </Button>
          </div>
        )}
      </div>

      {!connected ? (
        <Card>
          <CardContent className="p-10 text-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" className="w-14 h-14 mx-auto mb-4" alt="" />
            <p className="text-slate-600 mb-1 font-medium">Conecte sua conta do Spotify</p>
            <p className="text-slate-400 text-sm mb-5">Suas playlists serão importadas automaticamente da sua biblioteca.</p>
            <Button onClick={conectar} disabled={connecting} className="bg-[#1DB954] hover:bg-[#1aa34a] text-white">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Conectar com Spotify
            </Button>
          </CardContent>
        </Card>
      ) : playlists.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-slate-400">
            <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma playlist encontrada na sua biblioteca Spotify.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((p) => (
            <Card key={p.id || p.spotify_playlist_id}>
              <CardContent className="p-4 flex items-center gap-3">
                {p.spotify_playlist_image ? (
                  <img src={p.spotify_playlist_image} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{p.spotify_playlist_name}</p>
                  <p className="text-xs text-slate-500 truncate">{p.owner}</p>
                  <p className="text-xs text-slate-400">{p.tracks_total} músicas</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}