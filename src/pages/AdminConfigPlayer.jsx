import { useState } from "react";
import { Settings, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerConfig, savePlayerConfig, resetPlayerConfig } from "@/lib/playerConfig";
import CrossfadeSection from "@/components/player/CrossfadeSection";
import VolumeSection from "@/components/player/VolumeSection";
import EtapasSection from "@/components/player/EtapasSection";
import PreferenciasSection from "@/components/player/PreferenciasSection";

export default function AdminConfigPlayer() {
  const [config, setConfig] = useState(() => getPlayerConfig());
  const [salvo, setSalvo] = useState(false);

  const update = (patch) => {
    setConfig(savePlayerConfig({ ...config, ...patch }));
    setSalvo(false);
  };
  const reset = () => { setConfig(resetPlayerConfig()); setSalvo(false); };

  const salvar = () => {
    setConfig(savePlayerConfig(config));
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#1B3A5F] flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#C9A227]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A5F]">Configuração de Player</h1>
          <p className="text-sm text-slate-500">Transições, volume e comportamento das etapas</p>
        </div>
        <Button onClick={salvar} className="ml-auto bg-[#1B3A5F] text-white hover:bg-[#152d49]">
          {salvo ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {salvo ? "Salvo" : "Salvar"}
        </Button>
      </div>

      <CrossfadeSection config={config} onChange={update} />
      <VolumeSection config={config} onChange={update} />
      <EtapasSection config={config} onChange={update} />
      <PreferenciasSection onReset={reset} />
    </div>
  );
}