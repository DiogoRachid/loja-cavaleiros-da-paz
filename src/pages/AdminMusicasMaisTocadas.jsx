import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { ArrowLeft, BarChart, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const GRAUS = ["Todos", "Aprendiz", "Companheiro", "Mestre"];

export default function AdminMusicasMaisTocadas() {
  const [dados, setDados] = useState([]);
  const [grau, setGrau] = useState("Todos");
  const [totalSessoes, setTotalSessoes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, [grau]);

  const carregar = async () => {
    setLoading(true);
    const [sessoes, roteiros] = await Promise.all([
      db.Sessao.filter({ status: "Realizada" }),
      db.RoteiroHarmonia.list("-created_date", 500),
    ]);
    const realizadas = new Map(sessoes.map((s) => [s.id, s]));

    const porEtapa = new Map();
    let usados = 0;

    roteiros.forEach((r) => {
      const s = realizadas.get(r.sessao_id);
      if (!s) return;
      const grauSessao = s.grau || r.grau;
      if (grau !== "Todos" && grauSessao !== grau) return;
      let etapas = [];
      try { etapas = r.etapas ? JSON.parse(r.etapas) : []; } catch { etapas = []; }
      if (etapas.length === 0) return;
      usados++;
      etapas.forEach((e) => {
        const nomeEtapa = e.nome || "Etapa";
        if (!porEtapa.has(nomeEtapa)) porEtapa.set(nomeEtapa, new Map());
        const contagem = porEtapa.get(nomeEtapa);
        (e.tracks || []).forEach((t) => {
          const chave = t.name || t.nome || "Sem nome";
          const atual = contagem.get(chave) || { nome: chave, artista: t.artists || t.artista || "", total: 0 };
          atual.total += 1;
          contagem.set(chave, atual);
        });
      });
    });

    const lista = [...porEtapa.entries()]
      .map(([etapa, contagem]) => ({
        etapa,
        musicas: [...contagem.values()].sort((a, b) => b.total - a.total).slice(0, 10),
      }))
      .filter((e) => e.musicas.length > 0);

    setDados(lista);
    setTotalSessoes(usados);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/AdminMestreHarmonia">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <BarChart className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Músicas Mais Tocadas</h1>
          <p className="text-slate-500 text-sm">
            Baseado em {totalSessoes} sessão(ões) realizada(s), por etapa do roteiro
          </p>
        </div>
      </div>

      <Tabs value={grau} onValueChange={setGrau}>
        <TabsList>
          {GRAUS.map((g) => <TabsTrigger key={g} value={g}>{g}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : dados.length === 0 ? (
        <p className="text-center text-slate-400 py-12">
          Ainda não há dados de sessões realizadas com músicas no roteiro.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {dados.map((grupo) => (
            <Card key={grupo.etapa}>
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1B3A5F] text-base flex items-center gap-2">
                  <Music className="w-4 h-4" /> {grupo.etapa}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {grupo.musicas.map((m, i) => (
                  <div key={m.nome} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                    <span className="text-xs text-slate-400 w-4 tabular-nums">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{m.nome}</p>
                      {m.artista && <p className="text-xs text-slate-500 truncate">{m.artista}</p>}
                    </div>
                    <Badge className="bg-[#C9A227] text-[#1B3A5F]">{m.total}x</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}