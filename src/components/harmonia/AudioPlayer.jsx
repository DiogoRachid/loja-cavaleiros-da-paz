import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play().catch(() => setPlaying(false)); }
  };

  const seek = ([v]) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = v;
    setCurrent(v);
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

  return (
    <div className="flex items-center gap-2 w-full sm:w-[400px] bg-[#253251] rounded-xl px-3 py-2.5 shadow-md flex-shrink-0">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full border-2 border-[#D6B45E] text-[#D6B45E] hover:bg-[#D6B45E] hover:text-[#253251] flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span className="text-[11px] text-white tabular-nums flex-shrink-0 w-9 text-right">{fmt(current)}</span>
      <Slider
        value={[current]}
        max={duration || 1}
        step={1}
        onValueChange={seek}
        className="flex-1 cursor-pointer [&>span:first-child]:bg-white/25 [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
      />
      <span className="text-[11px] text-white tabular-nums flex-shrink-0 w-9">{fmt(duration)}</span>
      <button onClick={toggleMute} className="text-slate-300 hover:text-[#D6B45E] flex-shrink-0 transition-colors">
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
      <Slider
        value={[muted ? 0 : volume]}
        max={1}
        step={0.05}
        onValueChange={changeVolume}
        className="w-16 cursor-pointer flex-shrink-0 hidden sm:flex [&>span:first-child]:bg-white/25 [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
      />
    </div>
  );
}