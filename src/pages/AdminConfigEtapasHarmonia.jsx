import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Settings, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import PlaylistSelector from "@/components/harmonia/PlaylistSelector";

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

export default function AdminConfigEtapasHarmonia() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const registros = await base44.entities.ConfigEtapaHarmonia.list();
    const map = {};
    registros.forEach((r) => {
      map[`${r.grau}::${r.etapa_nome}`] = r;
    });
    setConfigs(map);
    setLoading(false);
  };

  const handleChangePlaylist = (grau, etapaNome, playlist) => {
    const key = `${grau}::${etapaNome}`;
    setConfigs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        grau,
        etapa_nome: etapaNome,
        playlist_id: playlist?.id || "",
        playlist_name: playlist?.name || "",
      },
    }));
  };

  const salvar = async () => {
    setSaving(true);
    for (const grau of GRAUS) {
      for (const nome of ETAPAS_PADRAO) {
        const key = `${grau}::${nome}`;
        const config = configs[key];
        if (!config) continue;
        if (config.id) {
          await base44.entities.ConfigEtapaHarmonia.update(config.id, {
            playlist_id: config.playlist_id,
            playlist_name: config.playlist_name,
          });
        } else if (config.playlist_id) {
          await base44.entities.ConfigEtapaHarmonia.create({
            grau,
            etapa_nome: nome,
            playlist_id: config.playlist_id,
            playlist_name: config.playlist_name,
          });
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
          <p className="text-slate-500 text-sm">Vincule uma playlist padrão para cada etapa, por grau da sessão</p>
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
            <Card>
              <CardContent className="p-6 space-y-4">
                {ETAPAS_PADRAO.map((nome) => {
                  const key = `${grau}::${nome}`;
                  return (
                    <div key={nome} className="flex items-center flex-wrap gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <span className="text-[#1B3A5F] font-semibold text-sm w-32 flex-shrink-0">{nome}</span>
                      <PlaylistSelector
                        value={configs[key]?.playlist_id}
                        onChange={(playlist) => handleChangePlaylist(grau, nome, playlist)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}