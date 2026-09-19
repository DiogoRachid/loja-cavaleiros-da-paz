import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, ListMusic } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
};

export default function PlayerListaFiltrada({ musicas }) {
  const audioRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (idx >= musicas.length) setIdx(0);
  }, [musicas.length, idx]);

  useEffect(() => {
    setCurrent(0);
    if (playing && audioRef.current) {
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [idx, musicas]);

  const atual = musicas[idx];

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !atual) return;
    if (playing) a.pause();
    else a.play().catch(() => setPlaying(false));
  };

  const proxima = () => setIdx((i) => (musicas.length ? (i + 1) % musicas.length : 0));
  const anterior = () => setIdx((i) => (musicas.length ? (i - 1 + musicas.length) % musicas.length : 0));

  const seek = ([v]) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = v;
    setCurrent(v);
  };

  if (musicas.length === 0) {
    return (
      <div className="flex items-center gap-2 w-full sm:w-[280px] bg-slate-100 rounded-lg px-3 py-2 flex-shrink-0 text-xs text-slate-400">
        <ListMusic className="w-4 h-4" />
        Selecione pastas para ouvir
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-[300px] bg-[#253251] rounded-lg px-2 py-1.5 flex-shrink-0">
      <audio
        ref={audioRef}
        src={atual?.file_url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={proxima}
        onTimeUpdate={(e) => setCurrent(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />
      <button onClick={anterior} className="text-[#D6B45E] hover:text-white flex-shrink-0" title="Anterior">
        <SkipBack className="w-4 h-4" />
      </button>
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full border-2 border-[#D6B45E] text-[#D6B45E] hover:bg-[#D6B45E] hover:text-[#253251] flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <button onClick={proxima} className="text-[#D6B45E] hover:text-white flex-shrink-0" title="Próxima">
        <SkipForward className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white truncate">{atual?.nome}</p>
        <Slider
          value={[current]}
          max={duration || 1}
          step={1}
          onValueChange={seek}
          className="cursor-pointer [&>span:first-child]:bg-white/25 [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
        />
      </div>
      <span className="text-[11px] text-white tabular-nums flex-shrink-0 w-9">{fmt(current)}</span>
    </div>
  );
}