import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
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
    const [s, r] = await Promise.all([
      db.Sessao.filter({ status: "Agendada" }),
      db.RoteiroHarmonia.list("-created_date", 50),
    ]);
    setSessoes(s);
    setPlaylists(r);
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
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
          <Music className="h-7 w-7 text-lodge-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-lodge-navy">Painel do Mestre de Harmonia</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo, Ir∴ {admin.nome_completo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-lodge-navy/10">
              <Calendar className="h-5 w-5 text-lodge-navy" />
            </div>
            <p className="text-2xl font-semibold text-lodge-navy">{sessoes.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sessões Agendadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-lodge-navy/10">
              <ListMusic className="h-5 w-5 text-lodge-navy" />
            </div>
            <p className="text-2xl font-semibold text-lodge-navy">{sessoesMontadas.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Sessões com Roteiro</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-lodge-navy/10">
              <Headphones className="h-5 w-5 text-lodge-navy" />
            </div>
            <p className="text-2xl font-semibold text-lodge-navy">{playlists.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Roteiros Criados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-lodge-navy">
            <Calendar className="w-5 h-5" /> Próximas Sessões
          </h2>
          {proximasSessoes.length === 0 ? (
            <p className="text-slate-400 text-center py-6">Nenhuma sessão agendada.</p>
          ) : (
            <div className="space-y-3">
              {proximasSessoes.map(s => {
                const temPlaylist = playlists.some(p => p.sessao_id === s.id);
                return (
                  <Link key={s.id} to={`/AdminRoteiroHarmonia?sessao=${s.id}`} className="block">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-lodge-gold">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-lodge-navy">
                          <span className="text-[10px] font-medium text-lodge-gold">
                            {s.data?.split("-")[1] && ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(s.data.split("-")[1]) - 1]}
                          </span>
                          <span className="text-lg font-bold text-primary-foreground">{s.data?.split("-")[2]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{s.tipo} {s.numero && `Nº ${s.numero}`}</p>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">{s.data} às {s.hora} • {s.grau}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {temPlaylist ? (
                          <Badge className="border-0 bg-lodge-success-soft text-lodge-success">
                            <Music className="w-3 h-3 mr-1" />Roteiro pronto
                          </Badge>
                        ) : (
                          <Badge className="border border-lodge-gold/30 bg-lodge-gold/10 text-lodge-navy">Sem roteiro</Badge>
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