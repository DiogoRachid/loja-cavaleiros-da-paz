import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, "0")}`;
};

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Equalizer = ({ className = "" }) => (
  <span className={`inline-flex items-end gap-[2px] h-3.5 ${className}`}>
    {[0, 1, 2, 3].map((b) => (
      <span
        key={b}
        className="eq-bar w-[3px] bg-[#D6B45E] h-full rounded-sm"
        style={{ animationDelay: `${b * 0.15}s` }}
      />
    ))}
  </span>
);

export default function PastaPlayer({ musicas, expanded, renderRowActions }) {
  const audioRef = useRef(null);
  const [order, setOrder] = useState(() => musicas.map((_, i) => i));
  const [orderPos, setOrderPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const atualIdx = order[orderPos];
  const atual = musicas[atualIdx];

  // Reset quando a lista de músicas muda
  useEffect(() => {
    setOrder(musicas.map((_, i) => i));
    setOrderPos(0);
    setPlaying(false);
    setCurrent(0);
  }, [musicas]);

  // Pausar ao recolher a pasta
  useEffect(() => {
    if (!expanded && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [expanded]);

  // Aplicar volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // (Re)iniciar reprodução ao trocar de faixa
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    setCurrent(0);
    if (playing) {
      a.play().catch(() => setPlaying(false));
    }
  }, [orderPos, order]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !atual) return;
    if (playing) a.pause();
    else a.play().catch(() => setPlaying(false));
  };

  const buildShuffleFromScratch = (avoidIdx) => {
    let ord = shuffleArray(musicas.map((_, i) => i));
    if (avoidIdx != null && ord.length > 1 && ord[0] === avoidIdx) {
      [ord[0], ord[1]] = [ord[1], ord[0]];
    }
    return ord;
  };

  const proxima = () => {
    if (orderPos < order.length - 1) {
      setOrderPos((p) => p + 1);
    } else if (shuffle) {
      const lastIdx = order[order.length - 1];
      setOrder(buildShuffleFromScratch(lastIdx));
      setOrderPos(0);
    } else {
      setOrderPos(0);
    }
  };

  const anterior = () => {
    if (orderPos > 0) setOrderPos((p) => p - 1);
    else setOrderPos(order.length - 1);
  };

  const handleEnded = () => {
    if (repeat) {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => setPlaying(false));
      }
      return;
    }
    proxima();
  };

  const toggleShuffle = () => {
    if (!shuffle) {
      const startIdx = atualIdx ?? 0;
      const rest = musicas.map((_, i) => i).filter((i) => i !== startIdx);
      setOrder([startIdx, ...shuffleArray(rest)]);
      setOrderPos(0);
      setShuffle(true);
    } else {
      const startIdx = atualIdx ?? 0;
      setOrder(musicas.map((_, i) => i));
      setOrderPos(startIdx);
      setShuffle(false);
    }
  };

  const toggleRepeat = () => setRepeat((r) => !r);

  const playTrack = (i) => {
    if (i === atualIdx) {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => setPlaying(false));
        setPlaying(true);
      }
      return;
    }
    if (shuffle) {
      const rest = musicas.map((_, x) => x).filter((x) => x !== i);
      setOrder([i, ...shuffleArray(rest)]);
      setOrderPos(0);
    } else {
      setOrderPos(i);
    }
    setPlaying(true);
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
  };

  const toggleMute = () => {
    const novo = !muted;
    setMuted(novo);
    if (!novo && volume === 0) setVolume(1);
  };

  if (musicas.length === 0) return null;

  const btnGold = "text-[#D6B45E] hover:text-[#f0d88d] transition-colors";
  const ctrlBtn =
    "w-9 h-9 rounded-full border border-[#334366] text-[#D6B45E] hover:bg-[#D6B45E] hover:text-[#1a243b] flex items-center justify-center transition-colors";

  return (
    <div className="rounded-xl border border-[#334366] bg-[#1a243b] overflow-hidden">
      <audio
        ref={audioRef}
        src={atual?.file_url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={(e) => setCurrent(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      {/* Banner do player */}
      <div className="bg-[#253251] border-b border-[#334366] px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Arte / meta - esquerda */}
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#1a243b] border border-[#334366]">
            <Music className="h-5 w-5 text-[#D6B45E]" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-none sm:w-44 lg:w-56">
            <p className="font-display text-[1.25rem] leading-tight text-[#f1f5f9] truncate">
              {atual?.nome || "—"}
            </p>
            <p className="text-[0.75rem] uppercase tracking-wider text-[#94a3b8] truncate">
              {atual?.artista || `Faixa ${(atualIdx ?? 0) + 1} de ${musicas.length}`}
            </p>
          </div>

          {/* Controles + progresso - centro (desktop) */}
          <div className="hidden sm:flex flex-1 items-center gap-3">
            <button onClick={anterior} className={btnGold} title="Anterior">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={toggle} className={ctrlBtn} title="Tocar ou pausar">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={proxima} className={btnGold} title="Próxima">
              <SkipForward className="w-4 h-4" />
            </button>
            <span className="text-[0.875rem] tabular-nums text-[#94a3b8] w-10 text-right">
              {fmt(current)}
            </span>
            <Slider
              value={[current]}
              max={duration || 1}
              step={1}
              onValueChange={seek}
              className="flex-1 cursor-pointer [&>span:first-child]:bg-[#334366] [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
            />
            <span className="text-[0.875rem] tabular-nums text-[#94a3b8] w-10">
              {fmt(duration)}
            </span>
          </div>

          {/* Direita: shuffle, repetir, volume (desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleShuffle}
              title="Aleatório"
              className={`transition-colors ${shuffle ? "text-[#D6B45E] drop-shadow-[0_0_6px_#D6B45E]" : "text-[#94a3b8] hover:text-[#D6B45E]"}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={toggleRepeat}
              title="Repetir"
              className={`transition-colors ${repeat ? "text-[#D6B45E] drop-shadow-[0_0_6px_#D6B45E]" : "text-[#94a3b8] hover:text-[#D6B45E]"}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button onClick={toggleMute} className="text-[#94a3b8] hover:text-[#D6B45E] transition-colors" title="Silenciar">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.05}
              onValueChange={changeVolume}
              className="w-16 cursor-pointer [&>span:first-child]:bg-[#334366] [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
            />
          </div>

          {/* Mobile: play + toolbar compacto */}
          <div className="flex sm:hidden items-center gap-2">
            <button onClick={toggle} className={ctrlBtn} title="Tocar ou pausar">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={toggleShuffle}
              title="Aleatório"
              className={`transition-colors ${shuffle ? "text-[#D6B45E]" : "text-[#94a3b8]"}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={toggleRepeat}
              title="Repetir"
              className={`transition-colors ${repeat ? "text-[#D6B45E]" : "text-[#94a3b8]"}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile: scrubber */}
        <div className="flex sm:hidden items-center gap-2 mt-2">
          <button onClick={anterior} className={btnGold} title="Anterior">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={proxima} className={btnGold} title="Próxima">
            <SkipForward className="w-4 h-4" />
          </button>
          <span className="text-[0.875rem] tabular-nums text-[#94a3b8] w-10 text-right">
            {fmt(current)}
          </span>
          <Slider
            value={[current]}
            max={duration || 1}
            step={1}
            onValueChange={seek}
            className="flex-1 cursor-pointer [&>span:first-child]:bg-[#334366] [&>span:first-child>span]:bg-[#D6B45E] [&_[role=slider]]:border-[#D6B45E] [&_[role=slider]]:bg-[#D6B45E]"
          />
          <span className="text-[0.875rem] tabular-nums text-[#94a3b8] w-10">
            {fmt(duration)}
          </span>
        </div>
      </div>

      {/* Lista de faixas */}
      <div className="divide-y divide-[#334366]">
        {musicas.map((m, i) => {
          const isActive = i === atualIdx;
          const progress = isActive && duration ? (current / duration) * 100 : 0;
          return (
            <div
              key={m.id}
              className={`relative flex items-center gap-3 px-3 sm:px-4 py-2.5 cursor-pointer transition-colors ${
                isActive ? "bg-[#2d3e63]" : "hover:bg-[#1f2c4a]"
              }`}
              onClick={() => playTrack(i)}
            >
              <span className="w-6 shrink-0 text-right text-[0.875rem] tabular-nums text-[#94a3b8]">
                {isActive && playing ? <Equalizer /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[0.95rem] truncate ${isActive ? "text-[#f0d88d]" : "text-[#f1f5f9]"}`}>
                  {m.nome}
                </p>
                {m.artista && (
                  <p className="text-[0.75rem] text-[#94a3b8] truncate">{m.artista}</p>
                )}
              </div>
              {renderRowActions && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {renderRowActions(m, i)}
                </div>
              )}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-[#D6B45E]"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}