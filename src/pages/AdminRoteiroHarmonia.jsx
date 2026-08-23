import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { ArrowLeft, Plus, Save, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import RoteiroEtapa from "@/components/harmonia/RoteiroEtapa";
import TrackSearchModal from "@/components/harmonia/TrackSearchModal";
import { Mp3PlaybackProvider } from "@/components/harmonia/Mp3PlaybackContext";
import EtapaChain from "@/components/harmonia/EtapaChain";

const ETAPAS_PADRAO = [
  "Entrada",
  "Verificação",
  "Abertura",
  "Balaustre",
  "Proposta",
  "Tronco",
  "Fechamento",
  "Saída",
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default function AdminRoteiroHarmonia() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessaoId = urlParams.get("sessao");

  const [sessao, setSessao] = useState(null);
  const [roteiro, setRoteiro] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Track search modal
  const [searchModalEtapa, setSearchModalEtapa] = useState(null);

  useEffect(() => {
    if (sessaoId) loadDados();
  }, [sessaoId]);

  const loadDados = async () => {
    const [sessoes, roteiros, pastas] = await Promise.all([
      db.Sessao.filter({ id: sessaoId }),
      db.RoteiroHarmonia.filter({ sessao_id: sessaoId }),
      db.PastaMp3.list("nome", 200),
    ]);

    // Após a troca de banco os IDs das pastas mudaram: revincula pelo nome
    const norm = (s) => (s || "").trim().toLowerCase();
    const pastaPorId = new Map(pastas.map((p) => [p.id, p]));
    const pastaPorNome = new Map(pastas.map((p) => [norm(p.nome), p]));
    const revincular = (id, nome) => {
      if (id && pastaPorId.has(id)) return { id, nome: pastaPorId.get(id).nome };
      const p = pastaPorNome.get(norm(nome));
      return p ? { id: p.id, nome: p.nome } : { id: "", nome: "" };
    };
    const s = sessoes[0] || null;
    setSessao(s);

    // Sempre puxa a configuração de etapas/playlists do grau + tipo da sessão
    const configs = await db.ConfigEtapaHarmonia.filter({
      grau: s?.grau || "Aprendiz",
      tipo_sessao: s?.tipo || "Ordinária",
    });
    const configsOrdenadas = configs.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const nomesEtapas = configsOrdenadas.length > 0
      ? configsOrdenadas.map((c) => c.etapa_nome)
      : ETAPAS_PADRAO;
    const configMap = {};
    configsOrdenadas.forEach((c) => { configMap[c.etapa_nome] = c; });

    let r = roteiros[0];
    if (!r) {
      const etapasIniciais = nomesEtapas.map((nome, i) => {
        const p = revincular(configMap[nome]?.playlist_id, configMap[nome]?.playlist_name);
        return {
          id: genId(),
          numero: i + 1,
          nome,
          tracks: [],
          playlist_id: p.id,
          playlist_name: p.nome,
          observacao: configMap[nome]?.observacao || "",
        };
      });
      r = await db.RoteiroHarmonia.create({
        sessao_id: sessaoId,
        sessao_data: s?.data || "",
        sessao_tipo: s?.tipo || "",
        grau: s?.grau || "Aprendiz",
        etapas: JSON.stringify(etapasIniciais),
      });
    }
    setRoteiro(r);
    const parsed = r.etapas ? JSON.parse(r.etapas) : [];

    // Migrar tracks antigos e completar playlist a partir da config quando estiver vazia
    const migradas = parsed.map((e) => {
      const cfg = configMap[e.nome];
      const p = revincular(
        e.playlist_id || cfg?.playlist_id,
        e.playlist_name || cfg?.playlist_name
      );
      return {
        ...e,
        tracks: e.tracks || (e.track ? [e.track] : []),
        playlist_id: p.id,
        playlist_name: p.nome,
        observacao: e.observacao ?? cfg?.observacao ?? "",
      };
    });

    // Sincroniza etapas novas adicionadas na configuração que ainda não estão no roteiro
    const nomesExistentes = new Set(migradas.map((e) => e.nome));
    const novas = nomesEtapas
      .filter((nome) => !nomesExistentes.has(nome))
      .map((nome) => {
        const p = revincular(configMap[nome]?.playlist_id, configMap[nome]?.playlist_name);
        return { id: genId(), nome, tracks: [], playlist_id: p.id, playlist_name: p.nome, observacao: configMap[nome]?.observacao || "" };
      });

    const combinadas = [...migradas, ...novas].map((e, i) => ({ ...e, numero: i + 1 }));
    setEtapas(combinadas);
    setLoading(false);
  };

  const handleChangePlaylist = (etapaId, playlist) => {
    setEtapas((prev) =>
      prev.map((e) =>
        e.id === etapaId
          ? { ...e, playlist_id: playlist?.id || "", playlist_name: playlist?.name || "" }
          : e
      )
    );
  };

  const salvar = async () => {
    setSaving(true);
    await db.RoteiroHarmonia.update(roteiro.id, {
      etapas: JSON.stringify(etapas),
    });
    setSaving(false);
  };

  const handleStopTimer = async (etapaNome, registro) => {
    await db.TempoEtapa.create({
      sessao_id: sessaoId,
      sessao_data: sessao?.data || "",
      sessao_tipo: sessao?.tipo || "",
      grau: sessao?.grau || roteiro?.grau || "",
      etapa_nome: etapaNome,
      ...registro,
    });
  };

  const handleChangeObservacao = (id, observacao) => {
    setEtapas((prev) => prev.map((e) => (e.id === id ? { ...e, observacao } : e)));
  };

  const handleRename = (id, novoNome) => {
    setEtapas((prev) => prev.map((e) => (e.id === id ? { ...e, nome: novoNome } : e)));
  };

  const handleConfirmTracks = (tracks) => {
    setEtapas((prev) =>
      prev.map((e) => (e.id === searchModalEtapa ? { ...e, tracks } : e))
    );
    setSearchModalEtapa(null);
  };

  const handleMoveTrack = (etapaId, trackId, dir) => {
    setEtapas((prev) =>
      prev.map((e) => {
        if (e.id !== etapaId) return e;
        const tracks = [...(e.tracks || [])];
        const idx = tracks.findIndex((t) => t.id === trackId);
        const alvo = idx + dir;
        if (idx === -1 || alvo < 0 || alvo >= tracks.length) return e;
        [tracks[idx], tracks[alvo]] = [tracks[alvo], tracks[idx]];
        return { ...e, tracks };
      })
    );
  };

  const handleRemoveTrack = (etapaId, trackId) => {
    setEtapas((prev) =>
      prev.map((e) =>
        e.id === etapaId ? { ...e, tracks: (e.tracks || []).filter((t) => t.id !== trackId) } : e
      )
    );
  };

  const handleRemoveEtapa = (id) => {
    setEtapas((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddEtapa = () => {
    setEtapas((prev) => [...prev, { id: genId(), numero: prev.length + 1, nome: "Nova Etapa", tracks: [] }]);
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

  const etapaAtiva = searchModalEtapa ? etapas.find((e) => e.id === searchModalEtapa) : null;

  return (
    <Mp3PlaybackProvider>
    <EtapaChain etapas={etapas} />
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/AdminAgendaRitual">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Music className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Roteiro de Harmonia</h1>
          <p className="text-slate-500 text-sm">
            {sessao.tipo} {sessao.numero && `Nº ${sessao.numero}`}{roteiro?.grau && ` • ${roteiro.grau}`} • {sessao.data} às {sessao.hora}
          </p>
        </div>
        <Button onClick={salvar} disabled={saving} size="sm" className="ml-auto bg-[#1B3A5F] text-white hover:bg-[#152d49]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Roteiro
        </Button>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="space-y-2">
            {etapas.map((etapa, i) => (
              <RoteiroEtapa
                key={etapa.id}
                etapa={etapa}
                index={i}
                onRename={handleRename}
                onAddTrack={(etapaId) => setSearchModalEtapa(etapaId)}
                onRemoveTrack={handleRemoveTrack}
                onMoveTrack={handleMoveTrack}
                onRemove={handleRemoveEtapa}
                onChangePlaylist={handleChangePlaylist}
                onChangeObservacao={handleChangeObservacao}
                onStopTimer={handleStopTimer}
              />
            ))}

            {etapas.length === 0 && (
              <p className="text-center text-slate-400 py-8">Nenhuma etapa. Adicione abaixo.</p>
            )}

            <button
              onClick={handleAddEtapa}
              className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-[#1B3A5F] hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Adicionar Etapa
            </button>
          </div>
        </CardContent>
      </Card>

      <TrackSearchModal
        open={searchModalEtapa !== null}
        onClose={() => setSearchModalEtapa(null)}
        selectedTracks={etapaAtiva?.tracks || []}
        onConfirm={handleConfirmTracks}
        initialPastaId={etapaAtiva?.playlist_id || null}
      />
    </div>
    </Mp3PlaybackProvider>
  );
}