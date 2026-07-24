import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/api/db";
import { ArrowLeft, Settings, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import PastaSelector from "@/components/harmonia/PastaSelector";

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

const GRAUS = ["Aprendiz", "Companheiro", "Mestre"];
const TIPOS_SESSAO = ["Ordinária", "Magna", "Pública", "Instrução", "Fúnebre"];

function key(grau, tipo, etapa) {
  return `${grau}::${tipo}::${etapa}`;
}

export default function AdminConfigEtapasHarmonia() {
  const [configs, setConfigs] = useState({});
  const [etapasPorGrupo, setEtapasPorGrupo] = useState({}); // `${grau}::${tipo}` -> [nomes]
  const [novaEtapa, setNovaEtapa] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const registros = await db.ConfigEtapaHarmonia.list();
    const map = {};
    const grupos = {};
    registros.forEach((r) => {
      map[key(r.grau, r.tipo_sessao, r.etapa_nome)] = r;
    });
    GRAUS.forEach((grau) => {
      TIPOS_SESSAO.forEach((tipo) => {
        const grupoKey = `${grau}::${tipo}`;
        const existentes = registros
          .filter((r) => r.grau === grau && r.tipo_sessao === tipo)
          .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
          .map((r) => r.etapa_nome);
        grupos[grupoKey] = existentes.length > 0 ? existentes : [...ETAPAS_PADRAO];
      });
    });
    setConfigs(map);
    setEtapasPorGrupo(grupos);
    setLoading(false);
  };

  const handleChangePlaylist = (grau, tipo, etapaNome, playlist) => {
    const k = key(grau, tipo, etapaNome);
    setConfigs((prev) => ({
      ...prev,
      [k]: {
        ...prev[k],
        grau,
        tipo_sessao: tipo,
        etapa_nome: etapaNome,
        playlist_id: playlist?.id || "",
        playlist_name: playlist?.name || "",
      },
    }));
  };

  const handleAddEtapa = (grau, tipo) => {
    const grupoKey = `${grau}::${tipo}`;
    const nome = (novaEtapa[grupoKey] || "").trim();
    if (!nome) return;
    setEtapasPorGrupo((prev) => ({
      ...prev,
      [grupoKey]: [...(prev[grupoKey] || []), nome],
    }));
    setNovaEtapa((prev) => ({ ...prev, [grupoKey]: "" }));
  };

  const handleRemoveEtapa = (grau, tipo, nome) => {
    const grupoKey = `${grau}::${tipo}`;
    setEtapasPorGrupo((prev) => ({
      ...prev,
      [grupoKey]: (prev[grupoKey] || []).filter((n) => n !== nome),
    }));
  };

  const salvar = async () => {
    setSaving(true);
    for (const grau of GRAUS) {
      for (const tipo of TIPOS_SESSAO) {
        const grupoKey = `${grau}::${tipo}`;
        const nomes = etapasPorGrupo[grupoKey] || [];
        for (let i = 0; i < nomes.length; i++) {
          const nome = nomes[i];
          const k = key(grau, tipo, nome);
          const config = configs[k];
          if (config?.id) {
            await db.ConfigEtapaHarmonia.update(config.id, {
              ordem: i,
              playlist_id: config.playlist_id || "",
              playlist_name: config.playlist_name || "",
            });
          } else {
            await db.ConfigEtapaHarmonia.create({
              grau,
              tipo_sessao: tipo,
              etapa_nome: nome,
              ordem: i,
              playlist_id: config?.playlist_id || "",
              playlist_name: config?.playlist_name || "",
            });
          }
        }
      }
    }
    await loadConfigs();
    setSaving(false);
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
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/AdminMestreHarmonia">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Settings className="w-6 h-6 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Configurações do Roteiro</h1>
          <p className="text-slate-500 text-sm">Vincule uma pasta de músicas padrão para cada etapa, por grau e tipo de sessão</p>
        </div>
        <Button onClick={salvar} disabled={saving} className="ml-auto bg-[#1B3A5F] text-white hover:bg-[#152d49]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar
        </Button>
      </div>

      <Tabs defaultValue="Aprendiz">
        <TabsList>
          {GRAUS.map((g) => (
            <TabsTrigger key={g} value={g}>{g}</TabsTrigger>
          ))}
        </TabsList>
        {GRAUS.map((grau) => (
          <TabsContent key={grau} value={grau}>
            <Tabs defaultValue={TIPOS_SESSAO[0]}>
              <TabsList>
                {TIPOS_SESSAO.map((tipo) => (
                  <TabsTrigger key={tipo} value={tipo}>{tipo}</TabsTrigger>
                ))}
              </TabsList>
              {TIPOS_SESSAO.map((tipo) => {
                const grupoKey = `${grau}::${tipo}`;
                const nomes = etapasPorGrupo[grupoKey] || [];
                return (
                  <TabsContent key={tipo} value={tipo}>
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        {nomes.map((nome) => {
                          const k = key(grau, tipo, nome);
                          return (
                            <div key={nome} className="flex items-center flex-wrap gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                              <span className="text-[#1B3A5F] font-semibold text-sm w-32 flex-shrink-0">{nome}</span>
                              <PastaSelector
                                value={configs[k]?.playlist_id}
                                valueName={configs[k]?.playlist_name}
                                onChange={(playlist) => handleChangePlaylist(grau, tipo, nome, playlist)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 ml-auto"
                                onClick={() => handleRemoveEtapa(grau, tipo, nome)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}

                        {nomes.length === 0 && (
                          <p className="text-center text-slate-400 py-4">Nenhuma etapa cadastrada.</p>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <Input
                            placeholder="Nome da nova etapa"
                            value={novaEtapa[grupoKey] || ""}
                            onChange={(e) => setNovaEtapa((prev) => ({ ...prev, [grupoKey]: e.target.value }))}
                            className="h-9 text-sm"
                          />
                          <Button variant="outline" onClick={() => handleAddEtapa(grau, tipo)}>
                            <Plus className="w-4 h-4 mr-1" /> Adicionar Etapa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}