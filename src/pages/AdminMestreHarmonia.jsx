import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Music, Calendar, ListMusic, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminMestreHarmonia() {
  const [sessoes, setSessoes] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(sessionStorage.getItem("admin_data") || "{}");

  useEffect(() => { loadDados(); }, []);

  const loadDados = async () => {
    const [s, p] = await Promise.all([
      base44.entities.Sessao.filter({ status: "Agendada" }),
      base44.entities.PlaylistSessao.list("-created_date", 50),
    ]);
    setSessoes(s);
    setPlaylists(p);
    setLoading(false);
  };

  const proximasSessoes = sessoes.sort((a, b) => (a.data || "").localeCompare(b.data || "")).slice(0, 5);
  const sessoesMontadas = proximasSessoes.filter(s => playlists.some(p => p.sessao_id === s.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1B3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Music className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5F]">Painel do Mestre de Harmonia</h1>
          <p className="text-slate-500">Bem-vindo, Ir∴ {admin.nome_completo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{sessoes.length}</p>
            <p className="text-sm text-slate-500 mt-1">Sessões Agendadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center mb-3">
              <ListMusic className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{sessoesMontadas.length}</p>
            <p className="text-sm text-slate-500 mt-1">Sessões com Playlist</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{playlists.length}</p>
            <p className="text-sm text-slate-500 mt-1">Playlists Vinculadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold text-[#1B3A5F] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Próximas Sessões
          </h2>
          {proximasSessoes.length === 0 ? (
            <p className="text-slate-400 text-center py-6">Nenhuma sessão agendada.</p>
          ) : (
            <div className="space-y-3">
              {proximasSessoes.map(s => {
                const temPlaylist = playlists.some(p => p.sessao_id === s.id);
                const qtdPlaylists = playlists.filter(p => p.sessao_id === s.id).length;
                return (
                  <Link key={s.id} to={`/AdminPlaylistSessao?sessao=${s.id}`}>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-[#C9A227] text-[10px] font-medium">
                            {s.data?.split("-")[1] && ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(s.data.split("-")[1]) - 1]}
                          </span>
                          <span className="text-white text-lg font-bold">{s.data?.split("-")[2]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{s.tipo} {s.numero && `Nº ${s.numero}`}</p>
                          <p className="text-sm text-slate-500">{s.data} às {s.hora} • {s.grau}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {temPlaylist ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Music className="w-3 h-3 mr-1" />{qtdPlaylists} playlist{qtdPlaylists > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800">Sem playlist</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}