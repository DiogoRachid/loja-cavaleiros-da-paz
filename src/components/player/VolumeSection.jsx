import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Volume2, Info } from "lucide-react";

export default function VolumeSection({ config, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1B3A5F]">
          <Volume2 className="w-4 h-4 text-[#C9A227]" />
          Volume e áudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Volume padrão ao abrir o app</Label>
            <span className="text-sm font-medium text-[#1B3A5F] tabular-nums">
              {Math.round(config.defaultVolume * 100)}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={[Math.round(config.defaultVolume * 100)]}
            onValueChange={([v]) => onChange({ defaultVolume: v / 100 })}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm flex items-center gap-1.5">
            Fade in/out ao pausar ou dar play
            <Info
              className="w-3.5 h-3.5 text-slate-400"
              title="Suaviza o início e a parada manual do áudio, evitando estalos."
            />
          </Label>
          <Switch
            checked={config.manualFadeEnabled}
            onCheckedChange={(v) => onChange({ manualFadeEnabled: v })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Duração do fade manual</Label>
            <span className="text-sm font-medium text-[#1B3A5F] tabular-nums">{config.manualFadeMs}ms</span>
          </div>
          <Slider
            min={200}
            max={800}
            step={50}
            disabled={!config.manualFadeEnabled}
            value={[config.manualFadeMs]}
            onValueChange={([v]) => onChange({ manualFadeMs: v })}
          />
        </div>
      </CardContent>
    </Card>
  );
}