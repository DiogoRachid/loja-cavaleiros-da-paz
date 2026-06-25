import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Music, ArrowLeft, Trash2, ListMusic, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import SpotifySearch from "@/components/harmonia/SpotifySearch";
import SpotifyPlayer from "@/components/harmonia/SpotifyPlayer";
import TrackSelector from "@/components/harmonia/TrackSelector";

export default function AdminPlaylistSessao() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessaoId = urlParams.get("sessao");

  const [sessao, setSessao] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlayer, setActivePlayer] = useState(null);
  const [selectingTracks, setSelectingTracks] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");

  useEffect(() => { if (sessaoId) loadDados(); }, [sessaoId]);

  const loadDados = async () => {
    const [sessoes, pls] = await Promise.all([
      base44.entities.Sessao.filter({ id: sessaoId }),
      base44.entities.PlaylistSessao.filter({ sessao_id: sessaoId }),
    ]);
    setSessao(sessoes[0] || null);
    setPlaylists(pls.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
    setLoading(false);
  };

  const handleAddPlaylist = async (spotifyPlaylist) => {
    await base44.entities.PlaylistSessao.create({
      sessao_id: sessaoId,
      sessao_data: sessao?.data || "",
      sessao_tipo: sessao?.tipo || "",
      spotify_playlist_id: spotifyPlaylist.id,
      spotify_playlist_name: spotifyPlaylist.name,
      spotify_playlist_image: spotifyPlaylist.image,
      spotify_playlist_uri: spotifyPlaylist.uri,
      tracks_selecionadas: "",
      ordem: playlists.length,
    });
    await loadDados();
  };

  const handleRemovePlaylist = async (id) => {
    if (!confirm("Remover esta playlist da sessão?")) return;
    await base44.entities.PlaylistSessao.delete(id);
    await loadDados();
  };

  const handleSaveTracks = async (playlistDbId, selectedTrackIds) => {
    await base44.entities.PlaylistSessao.update(playlistDbId, {
      tracks_selecionadas: JSON.stringify(selectedTrackIds),
    });
    setSelectingTracks(null);
    await loadDados();
  };

  const handleSaveNotes = async (playlistDbId) => {
    await base44.entities.PlaylistSessao.update(playlistDbId, { notas: notesText });
    setEditingNotes(null);
    await loadDados();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!sessao) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Sessão não encontrada.</p>
        <Link to="/AdminMestreHarmonia">
          <Button className="mt-4" variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
        </Link>
      </div>
    );
  }

  const addedIds = playlists.map(p => p.spotify_playlist_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/AdminMestreHarmonia">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Music className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">
            {sessao.tipo} {sessao.numero && `Nº ${sessao.numero}`}
          </h1>
          <p className="text-slate-500 text-sm">{sessao.data} às {sessao.hora} • {sessao.grau}</p>
        </div>
      </div>

      {/* Playlists vinculadas */}
      <div>
        <h2 className="text-lg font-semibold text-[#1B3A5F] mb-3 flex items-center gap-2">
          <ListMusic className="w-5 h-5" /> Playlists desta Sessão ({playlists.length})
        </h2>

        {playlists.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-400">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma playlist adicionada ainda.</p>
              <p className="text-sm mt-1">Use a busca abaixo para encontrar playlists no Spotify.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {playlists.map(p => {
              const selectedTracks = p.tracks_selecionadas ? JSON.parse(p.tracks_selecionadas) : [];
              return (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {p.spotify_playlist_image ? (
                        <img src={p.spotify_playlist_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{p.spotify_playlist_name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {selectedTracks.length > 0 ? (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">{selectedTracks.length} músicas selecionadas</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-600 text-xs">Playlist completa</Badge>
                          )}
                          {p.notas && (
                            <Badge className="bg-amber-100 text-amber-800 text-xs">Com notas</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setActivePlayer(activePlayer === p.id ? null : p.id)}
                        >
                          {activePlayer === p.id ? "⏹ Fechar" : "▶ Tocar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            setSelectingTracks(selectingTracks === p.id ? null : p.id);
                            setActivePlayer(null);
                          }}
                        >
                          <ListMusic className="w-3 h-3 mr-1" />Músicas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            if (editingNotes === p.id) {
                              setEditingNotes(null);
                            } else {
                              setNotesText(p.notas || "");
                              setEditingNotes(p.id);
                            }
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />Notas
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemovePlaylist(p.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Player */}
                    {activePlayer === p.id && (
                      <SpotifyPlayer playlistId={p.spotify_playlist_id} />
                    )}

                    {/* Track Selector */}
                    {selectingTracks === p.id && (
                      <TrackSelector
                        playlistId={p.spotify_playlist_id}
                        selectedTracks={selectedTracks}
                        onSave={(tracks) => handleSaveTracks(p.id, tracks)}
                        onCancel={() => setSelectingTracks(null)}
                      />
                    )}

                    {/* Notes */}
                    {editingNotes === p.id && (
                      <div className="space-y-2 pt-2 border-t">
                        <Textarea
                          value={notesText}
                          onChange={e => setNotesText(e.target.value)}
                          placeholder="Notas sobre esta playlist (momento de uso, observações...)"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>Cancelar</Button>
                          <Button size="sm" className="bg-[#1B3A5F] text-white" onClick={() => handleSaveNotes(p.id)}>
                            Salvar Notas
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Busca Spotify */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1B3A5F] flex items-center gap-2 text-base">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" className="w-5 h-5" alt="" />
            Buscar Playlists no Spotify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SpotifySearch onAddPlaylist={handleAddPlaylist} addedIds={addedIds} />
        </CardContent>
      </Card>
    </div>
  );
}