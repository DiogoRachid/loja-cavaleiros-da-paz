import { useState, useEffect } from "react";
import { db } from "@/api/db";
import { ArrowLeft, Settings, Loader2, Save, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

let uidSeq = 0;
const uid = () => `etapa_${Date.now()}_${uidSeq++}`;

export default function AdminConfigEtapasHarmonia() {
  const [configs, setConfigs] = useState({}); // cid -> { id?, playlist_id, playlist_name }
  const [etapasPorGrupo, setEtapasPorGrupo] = useState({}); // `${grau}::${tipo}` -> [{cid, nome}]
  const [novaEtapa, setNovaEtapa] = useState({});
  const [removidos, setRemovidos] = useState([]); // ids de registros a excluir ao salvar
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const registros = await db.ConfigEtapaHarmonia.list();
    const map = {};
    const grupos = {};
    GRAUS.forEach((grau) => {
      TIPOS_SESSAO.forEach((tipo) => {
        const grupoKey = `${grau}::${tipo}`;
        const existentes = registros
          .filter((r) => r.grau === grau && r.tipo_sessao === tipo)
          .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        if (existentes.length > 0) {
          grupos[grupoKey] = existentes.map((r) => {
            const cid = uid();
            map[cid] = r;
            return { cid, nome: r.etapa_nome };
          });
        } else {
          grupos[grupoKey] = ETAPAS_PADRAO.map((nome) => ({ cid: uid(), nome }));
        }
      });
    });
    setConfigs(map);
    setEtapasPorGrupo(grupos);
    setRemovidos([]);
    setLoading(false);
  };

  const updateGrupo = (grupoKey, fn) => {
    setEtapasPorGrupo((prev) => ({ ...prev, [grupoKey]: fn(prev[grupoKey] || []) }));
  };

  const handleChangePlaylist = (cid, playlist) => {
    setConfigs((prev) => ({
      ...prev,
      [cid]: {
        ...prev[cid],
        playlist_id: playlist?.id || "",
        playlist_name: playlist?.name || "",
      },
    }));
  };

  const handleChangeObservacao = (cid, observacao) => {
    setConfigs((prev) => ({ ...prev, [cid]: { ...prev[cid], observacao } }));
  };

  const handleRenameEtapa = (grupoKey, cid, nome) => {
    updateGrupo(grupoKey, (lista) => lista.map((e) => (e.cid === cid ? { ...e, nome } : e)));
  };

  const handleMoveEtapa = (grupoKey, index, dir) => {
    const alvo = index + dir;
    updateGrupo(grupoKey, (lista) => {
      if (alvo < 0 || alvo >= lista.length) return lista;
      const nova = [...lista];
      [nova[index], nova[alvo]] = [nova[alvo], nova[index]];
      return nova;
    });
  };

  const handleAddEtapa = (grupoKey) => {
    const nome = (novaEtapa[grupoKey] || "").trim();
    if (!nome) return;
    updateGrupo(grupoKey, (lista) => [...lista, { cid: uid(), nome }]);
    setNovaEtapa((prev) => ({ ...prev, [grupoKey]: "" }));
  };

  const handleRemoveEtapa = (grupoKey, cid) => {
    const registroId = configs[cid]?.id;
    if (registroId) setRemovidos((prev) => [...prev, registroId]);
    updateGrupo(grupoKey, (lista) => lista.filter((e) => e.cid !== cid));
  };

  const salvar = async () => {
    setSaving(true);
    for (const id of removidos) {
      await db.ConfigEtapaHarmonia.delete(id);
    }
    for (const grau of GRAUS) {
      for (const tipo of TIPOS_SESSAO) {
        const lista = etapasPorGrupo[`${grau}::${tipo}`] || [];
        for (let i = 0; i < lista.length; i++) {
          const item = lista[i];
          const nome = (item.nome || "").trim() || `Etapa ${i + 1}`;
          const config = configs[item.cid];
          const dados = {
            ordem: i,
            etapa_nome: nome,
            playlist_id: config?.playlist_id || null,
            playlist_name: config?.playlist_name || null,
            observacao: config?.observacao || null,
          };
          if (config?.id) {
            await db.ConfigEtapaHarmonia.update(config.id, dados);
          } else {
            await db.ConfigEtapaHarmonia.create({ grau, tipo_sessao: tipo, ...dados });
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
          <p className="text-slate-500 text-sm">Renomeie, reordene e vincule uma pasta de músicas para cada etapa, por grau e tipo de sessão</p>
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
                const lista = etapasPorGrupo[grupoKey] || [];
                return (
                  <TabsContent key={tipo} value={tipo}>
                    <Card>
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        {lista.map((item, index) => (
                          <div key={item.cid} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-2">
                          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                            <div className="flex flex-col flex-shrink-0">
                              <button
                                type="button"
                                title="Subir etapa"
                                disabled={index === 0}
                                onClick={() => handleMoveEtapa(grupoKey, index, -1)}
                                className="text-slate-400 hover:text-[#1B3A5F] disabled:opacity-25"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Descer etapa"
                                disabled={index === lista.length - 1}
                                onClick={() => handleMoveEtapa(grupoKey, index, 1)}
                                className="text-slate-400 hover:text-[#1B3A5F] disabled:opacity-25"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-xs text-slate-400 w-5 tabular-nums flex-shrink-0">{index + 1}</span>
                            <Input
                              value={item.nome}
                              onChange={(e) => handleRenameEtapa(grupoKey, item.cid, e.target.value)}
                              className="h-9 text-sm font-semibold text-[#1B3A5F] w-40 flex-shrink-0"
                            />
                            <PastaSelector
                              value={configs[item.cid]?.playlist_id}
                              valueName={configs[item.cid]?.playlist_name}
                              onChange={(playlist) => handleChangePlaylist(item.cid, playlist)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 ml-auto"
                              onClick={() => handleRemoveEtapa(grupoKey, item.cid)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Observação desta etapa (aparece no roteiro da sessão)"
                            value={configs[item.cid]?.observacao || ""}
                            onChange={(e) => handleChangeObservacao(item.cid, e.target.value)}
                            className="text-sm min-h-[60px]"
                          />
                          </div>
                        ))}

                        {lista.length === 0 && (
                          <p className="text-center text-slate-400 py-4">Nenhuma etapa cadastrada.</p>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                          <Input
                            placeholder="Nome da nova etapa"
                            value={novaEtapa[grupoKey] || ""}
                            onChange={(e) => setNovaEtapa((prev) => ({ ...prev, [grupoKey]: e.target.value }))}
                            className="h-9 text-sm"
                          />
                          <Button variant="outline" onClick={() => handleAddEtapa(grupoKey)}>
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