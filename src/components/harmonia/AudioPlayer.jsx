import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useSilenceTrim } from "@/lib/useSilenceTrim";

const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
};

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const endedGuardRef = useRef(false);

  const { start: trimStart, end: trimEnd } = useSilenceTrim(src);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    endedGuardRef.current = false;
  }, [src]);

  // Aplicar offset de silêncio quando os limites ficam prontos
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (trimStart > 0 && a.currentTime < trimStart) {
      try { a.currentTime = trimStart; } catch {}
    }
  }, [trimStart, trimEnd, src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play().catch(() => setPlaying(false)); }
  };

  const seek = ([v]) => {
    const a = audioRef.current;
    if (!a) return;
    const t = (trimStart || 0) + v;
    a.currentTime = t;
    setCurrent(t);
  };

  const changeVolume = ([v]) => {
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    const novo = !muted;
    setMuted(novo);
    if (audioRef.current) audioRef.current.volume = novo ? 0 : (volume || 1);
    if (!novo && volume === 0) setVolume(1);
  };

  const dispCurrent = Math.max(0, current - (trimStart || 0));
  const dispDuration = Math.max(0, (trimEnd > (trimStart || 0) ? trimEnd : duration) - (trimStart || 0)) || duration;

  return (
    <div className="flex items-center gap-2 w-full sm:w-[260px] bg-muted rounded-lg px-2 py-1.5 flex-shrink-0">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const t = e.target.currentTime;
          setCurrent(t);
          if (trimEnd > trimStart && t >= trimEnd && !endedGuardRef.current) {
            endedGuardRef.current = true;
            if (audioRef.current) audioRef.current.pause();
            setPlaying(false);
          }
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          if (trimStart > 0) { try { e.target.currentTime = trimStart; } catch {} }
        }}
      />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full border-2 border-lodge-gold text-warning hover:bg-lodge-gold hover:text-landing-deep flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>
      <span className="text-[11px] text-foreground tabular-nums flex-shrink-0 w-9 text-right">{fmt(dispCurrent)}</span>
      <Slider
        value={[dispCurrent]}
        max={dispDuration || 1}
        step={1}
        onValueChange={seek}
        className="flex-1 cursor-pointer [&>span:first-child]:bg-border [&>span:first-child>span]:bg-lodge-gold [&_[role=slider]]:border-lodge-gold [&_[role=slider]]:bg-lodge-gold"
      />
      <span className="text-[11px] text-foreground tabular-nums flex-shrink-0 w-9">{fmt(dispDuration)}</span>
      <button onClick={toggleMute} className="text-muted-foreground hover:text-warning flex-shrink-0 transition-colors">
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <Slider
        value={[muted ? 0 : volume]}
        max={1}
        step={0.05}
        onValueChange={changeVolume}
        className="w-14 cursor-pointer flex-shrink-0 hidden md:flex [&>span:first-child]:bg-border [&>span:first-child>span]:bg-lodge-gold [&_[role=slider]]:border-lodge-gold [&_[role=slider]]:bg-lodge-gold"
      />
    </div>
  );
}