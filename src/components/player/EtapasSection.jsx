import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ListMusic, Lock, Info } from "lucide-react";

export default function EtapasSection({ config, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1B3A5F]">
          <ListMusic className="w-4 h-4 text-[#C9A227]" />
          Comportamento das etapas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600">
            A passagem de uma etapa para a outra é <strong>sempre manual</strong> — não há autoplay nem
            crossfade entre etapas. Enquanto o Mestre não avançar, a etapa atual repete em loop.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm flex items-center gap-1.5">
            Avisar quando a música estiver prestes a terminar
            <Info
              className="w-3.5 h-3.5 text-slate-400"
              title="A etapa que está tocando pisca em dourado no fim da faixa, indicando o momento de avançar."
            />
          </Label>
          <Switch
            checked={config.warnBeforeEnd}
            onCheckedChange={(v) => onChange({ warnBeforeEnd: v })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Antecedência do aviso</Label>
            <span className="text-sm font-medium text-[#1B3A5F] tabular-nums">
              {(config.warnLeadMs / 1000).toFixed(0)}s
            </span>
          </div>
          <Slider
            min={2000}
            max={20000}
            step={1000}
            disabled={!config.warnBeforeEnd}
            value={[config.warnLeadMs]}
            onValueChange={([v]) => onChange({ warnLeadMs: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}