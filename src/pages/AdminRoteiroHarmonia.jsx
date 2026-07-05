import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Save, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import RoteiroEtapa from "@/components/harmonia/RoteiroEtapa";
import TrackSearchModal from "@/components/harmonia/TrackSearchModal";

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
    const [sessoes, roteiros] = await Promise.all([
      base44.entities.Sessao.filter({ id: sessaoId }),
      base44.entities.RoteiroHarmonia.filter({ sessao_id: sessaoId }),
    ]);
    const s = sessoes[0] || null;
    setSessao(s);

    let r = roteiros[0];
    if (!r) {
      const configs = await base44.entities.ConfigEtapaHarmonia.list();
      const configMap = {};
      configs.forEach((c) => { configMap[c.etapa_nome] = c; });
      const etapasIniciais = ETAPAS_PADRAO.map((nome, i) => ({
        id: genId(),
        numero: i + 1,
        nome,
        tracks: [],
        playlist_id: configMap[nome]?.playlist_id || "",
        playlist_name: configMap[nome]?.playlist_name || "",
      }));
      r = await base44.entities.RoteiroHarmonia.create({
        sessao_id: sessaoId,
        sessao_data: s?.data || "",
        sessao_tipo: s?.tipo || "",
        grau: s?.grau || "Aprendiz",
        etapas: JSON.stringify(etapasIniciais),
      });
    }
    setRoteiro(r);
    const parsed = r.etapas ? JSON.parse(r.etapas) : [];
    // Migrar tracks antigos (track -> tracks)
    setEtapas(parsed.map((e) => ({ ...e, tracks: e.tracks || (e.track ? [e.track] : []) })));
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
    await base44.entities.RoteiroHarmonia.update(roteiro.id, {
      etapas: JSON.stringify(etapas),
    });
    setSaving(false);
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
        <Button onClick={salvar} disabled={saving} className="ml-auto bg-[#1B3A5F] text-white hover:bg-[#152d49]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Roteiro
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {etapas.map((etapa, i) => (
              <RoteiroEtapa
                key={etapa.id}
                etapa={etapa}
                index={i}
                onRename={handleRename}
                onAddTrack={(etapaId) => setSearchModalEtapa(etapaId)}
                onRemoveTrack={handleRemoveTrack}
                onRemove={handleRemoveEtapa}
                onChangePlaylist={handleChangePlaylist}
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
        initialPlaylistId={etapaAtiva?.playlist_id || null}
      />
    </div>
  );
}