import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Save, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      const etapasIniciais = ETAPAS_PADRAO.map((nome, i) => ({
        id: genId(),
        numero: i + 1,
        nome,
        track: null,
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
    setEtapas(r.etapas ? JSON.parse(r.etapas) : []);
    setLoading(false);
  };

  const salvar = async () => {
    setSaving(true);
    await base44.entities.RoteiroHarmonia.update(roteiro.id, {
      etapas: JSON.stringify(etapas),
    });
    setSaving(false);
  };

  const handleRename = (id, novoNome) => {
    setEtapas(prev => prev.map(e => e.id === id ? { ...e, nome: novoNome } : e));
  };

  const handleSelectTrack = (etapaId, track) => {
    setEtapas(prev => prev.map(e => e.id === etapaId ? { ...e, track } : e));
  };

  const handleRemoveTrack = (etapaId) => {
    setEtapas(prev => prev.map(e => e.id === etapaId ? { ...e, track: null } : e));
  };

  const handleRemoveEtapa = (id) => {
    setEtapas(prev => prev.filter(e => e.id !== id));
  };

  const handleAddEtapa = () => {
    setEtapas(prev => [...prev, { id: genId(), numero: prev.length + 1, nome: "Nova Etapa", track: null }]);
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

  const grau = sessao.grau || "Aprendiz";

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
            {sessao.tipo} {sessao.numero && `Nº ${sessao.numero}`} • {sessao.data} às {sessao.hora}
          </p>
        </div>
        <Button onClick={salvar} disabled={saving} className="ml-auto bg-[#1DB954] hover:bg-[#1aa34a] text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Roteiro
        </Button>
      </div>

      {/* Roteiro - Dark theme */}
      <div className="rounded-2xl bg-[#1A1815] p-6 md:p-8">
        <h2 className="text-center text-[#C6A97A] font-serif text-lg md:text-xl tracking-[0.2em] uppercase mb-6">
          Etapas de {grau}
        </h2>

        <div className="space-y-2 max-w-3xl mx-auto">
          {etapas.map((etapa, i) => (
            <RoteiroEtapa
              key={etapa.id}
              etapa={etapa}
              index={i}
              onRename={handleRename}
              onSelectTrack={(etapaId) => setSearchModalEtapa(etapaId)}
              onRemoveTrack={handleRemoveTrack}
              onRemove={handleRemoveEtapa}
            />
          ))}

          {etapas.length === 0 && (
            <p className="text-center text-[#5A5249] py-8">Nenhuma etapa. Adicione abaixo.</p>
          )}

          <button
            onClick={handleAddEtapa}
            className="w-full py-3 rounded-xl border border-dashed border-[#3D3730] text-[#C6A97A] hover:bg-[#221F1B] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Adicionar Etapa
          </button>
        </div>
      </div>

      <TrackSearchModal
        open={searchModalEtapa !== null}
        onClose={() => setSearchModalEtapa(null)}
        onSelect={(track) => handleSelectTrack(searchModalEtapa, track)}
      />
    </div>
  );
}