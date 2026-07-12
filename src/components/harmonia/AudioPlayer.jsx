import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
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

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play(); }
  };

  const seek = ([v]) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    a.currentTime = v;
    setCurrent(v);
  };

  return (
    <div className="flex items-center gap-3 w-full sm:w-[340px] bg-white border border-slate-200 rounded-full px-3 py-2 flex-shrink-0">
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
        className="w-9 h-9 rounded-full bg-[#1B3A5F] hover:bg-[#152d49] flex items-center justify-center flex-shrink-0 text-white"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <span className="text-[11px] text-slate-500 tabular-nums flex-shrink-0 w-9 text-right">{fmt(current)}</span>
      <Slider
        value={[current]}
        max={duration || 1}
        step={1}
        onValueChange={seek}
        className="flex-1 cursor-pointer"
      />
      <span className="text-[11px] text-slate-500 tabular-nums flex-shrink-0 w-9">{fmt(duration)}</span>
    </div>
  );
}