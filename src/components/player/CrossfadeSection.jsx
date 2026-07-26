import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Shuffle, Play, Info } from "lucide-react";
import { fadeGains } from "@/lib/playerConfig";

// Toca dois tons sobrepostos aplicando a curva escolhida, para ouvir a transição
function testarCrossfade({ crossfadeMs, crossfadeCurve }) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const mk = (freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain).connect(ctx.destination);
    return { osc, gain };
  };
  const a = mk(330);
  const b = mk(440);
  const now = ctx.currentTime;
  const dur = crossfadeMs / 1000;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const r = i / steps;
    const g = fadeGains(crossfadeCurve, r);
    a.gain.gain.setValueAtTime(Math.max(0, g.out) * 0.25, now + r * dur);
    b.gain.gain.setValueAtTime(Math.max(0, g.in) * 0.25, now + r * dur);
  }
  a.osc.start(now);
  b.osc.start(now);
  a.osc.stop(now + dur);
  b.osc.stop(now + dur + 0.4);
  setTimeout(() => ctx.close(), (dur + 1) * 1000);
}

export default function CrossfadeSection({ config, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#1B3A5F]">
          <Shuffle className="w-4 h-4 text-[#C9A227]" />
          Transição entre músicas da mesma etapa
        </CardTitle>
        <p className="text-xs text-slate-500">
          Crossfade = a música atual baixa o volume enquanto a próxima já entra subindo, sem silêncio no meio.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm">Ativar crossfade dentro da etapa</Label>
          <Switch
            checked={config.crossfadeEnabled}
            onCheckedChange={(v) => onChange({ crossfadeEnabled: v })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Duração do crossfade</Label>
            <span className="text-sm font-medium text-[#1B3A5F] tabular-nums">
              {(config.crossfadeMs / 1000).toFixed(1)}s
            </span>
          </div>
          <Slider
            min={1000}
            max={12000}
            step={500}
            value={[config.crossfadeMs]}
            onValueChange={([v]) => onChange({ crossfadeMs: v })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Curva de fade</Label>
          <Select value={config.crossfadeCurve} onValueChange={(v) => onChange({ crossfadeCurve: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="equal">Equal Power (recomendado)</SelectItem>
              <SelectItem value="exponential">Exponencial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm flex items-center gap-1.5">
            Aplicar também no loop da etapa
            <Info
              className="w-3.5 h-3.5 text-slate-400"
              title="Quando a etapa repete (música mais curta que a duração da etapa), o retorno ao início também usa crossfade."
            />
          </Label>
          <Switch
            checked={config.crossfadeOnLoop}
            onCheckedChange={(v) => onChange({ crossfadeOnLoop: v })}
          />
        </div>

        <Button
          variant="outline"
          className="border-[#1B3A5F] text-[#1B3A5F] hover:bg-[#1B3A5F] hover:text-white"
          onClick={() => testarCrossfade(config)}
        >
          <Play className="w-4 h-4" /> Testar crossfade
        </Button>
      </CardContent>
    </Card>
  );
}