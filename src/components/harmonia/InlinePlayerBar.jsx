import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const fmt = (ms) => {
  const t = Math.max(0, Math.floor((ms || 0) / 1000));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// Barra de player compacta (visual igual ao da Biblioteca de Músicas),
// controlada pelo estado global de reprodução do roteiro.
export default function InlinePlayerBar({
  playing, position, duration, volume, onToggle, onSeek, onVolume, className = "",
}) {
  const muted = volume === 0;

  return (
    <div className={`flex items-center gap-2 bg-[#253251] rounded-lg px-2 py-1.5 ${className}`}>
      <button
        title="Tocar ou pausar"
        onClick={onToggle}
        className="w-8 h-8 rounded-full border-2 border-[#D6B45E] text-[#D6B45E] hover:bg-[#D6B45E] hover:text-[#253251] flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <span className="text-[11px] text-white tabular-nums flex-shrink-0 w-9 text-right">{fmt(position)}</span>
      <Slider
        value={[position || 0]}
        max={duration || 1}
        step={1000}
        onValueChange={([v]) => onSeek(v)}
        className="flex-1 cursor-pointer [&>span:first-child]:bg-white/25 [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
      />
      <span className="text-[11px] text-white tabular-nums flex-shrink-0 w-9">{fmt(duration)}</span>
      <button
        title="Silenciar"
        onClick={() => onVolume(muted ? 1 : 0)}
        className="text-slate-300 hover:text-[#D6B45E] flex-shrink-0 transition-colors"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <Slider
        value={[volume]}
        max={1}
        step={0.05}
        onValueChange={([v]) => onVolume(v)}
        className="w-14 cursor-pointer flex-shrink-0 hidden md:flex [&>span:first-child]:bg-white/25 [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
      />
    </div>
  );
}