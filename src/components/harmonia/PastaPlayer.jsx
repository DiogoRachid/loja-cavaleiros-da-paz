import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useSilenceTrim } from "@/lib/useSilenceTrim";

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
        className="eq-bar w-[3px] bg-lodge-gold h-full rounded-sm"
        style={{ animationDelay: `${b * 0.15}s` }}
      />
    ))}
  </span>
);

export default function PastaPlayer({ musicas, expanded, renderRowActions }) {
  const audioRef = useRef(null);
  const listRef = useRef(null);
  const rowRefs = useRef([]);
  const [order, setOrder] = useState(() => musicas.map((_, i) => i));
  const [orderPos, setOrderPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const endedGuardRef = useRef(false);

  const atualIdx = order[orderPos];
  const atual = musicas[atualIdx];

  const { start: trimStart, end: trimEnd, analyzing } = useSilenceTrim(atual?.file_url, {
    savedStart: atual?.silence_start,
    savedEnd: atual?.silence_end,
    persistId: atual?.id,
  });

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
    endedGuardRef.current = false;
    setCurrent(0);
    if (playing) {
      a.play().catch(() => setPlaying(false));
    }
  }, [orderPos, order]);

  // Aplicar offset de silêncio quando os limites ficam prontos
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !atual) return;
    if (trimStart > 0 && a.currentTime < trimStart) {
      try { a.currentTime = trimStart; } catch {}
    }
  }, [trimStart, trimEnd]);

  // Rolar a lista para colocar a faixa ativa no topo
  useEffect(() => {
    const list = listRef.current;
    const el = rowRefs.current[atualIdx];
    if (!list || !el) return;
    list.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  }, [atualIdx]);

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
        a.currentTime = trimStart || 0;
        endedGuardRef.current = false;
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
        a.currentTime = trimStart || 0;
        endedGuardRef.current = false;
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
    if (!a) return;
    const t = (trimStart || 0) + v;
    a.currentTime = t;
    setCurrent(t);
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

  const dispCurrent = Math.max(0, current - (trimStart || 0));
  const dispDuration = Math.max(0, (trimEnd > (trimStart || 0) ? trimEnd : duration) - (trimStart || 0)) || duration;

  const btnGold = "text-warning hover:text-warning transition-colors";
  const ctrlBtn =
    "w-9 h-9 rounded-full border border-border text-warning hover:bg-lodge-gold hover:text-landing-deep flex items-center justify-center transition-colors";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <audio
        ref={audioRef}
        src={atual?.file_url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={(e) => {
          const t = e.target.currentTime;
          setCurrent(t);
          if (trimEnd > trimStart && t >= trimEnd && !endedGuardRef.current) {
            endedGuardRef.current = true;
            if (audioRef.current) audioRef.current.pause();
            handleEnded();
          }
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          if (trimStart > 0) { try { e.target.currentTime = trimStart; } catch {} }
        }}
      />

      {/* Banner do player */}
      <div className="bg-muted border-b border-border px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Arte / meta - esquerda */}
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
            <Music className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-none sm:w-44 lg:w-56">
            <p className="font-display text-[1.25rem] leading-tight text-foreground truncate">
              {atual?.nome || "—"}
            </p>
            <p className="text-[0.75rem] uppercase tracking-wider text-muted-foreground truncate">
              {atual?.artista || `Faixa ${(atualIdx ?? 0) + 1} de ${musicas.length}`}
            </p>
            {analyzing && (
              <span className="text-[0.7rem] text-warning animate-pulse">Analisando áudio…</span>
            )}
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
            <span className="text-[0.875rem] tabular-nums text-muted-foreground w-10 text-right">
              {fmt(dispCurrent)}
            </span>
            <Slider
              value={[dispCurrent]}
              max={dispDuration || 1}
              step={1}
              onValueChange={seek}
              className="flex-1 cursor-pointer [&>span:first-child]:bg-border [&>span:first-child>span]:bg-lodge-gold [&_[role=slider]]:border-lodge-gold [&_[role=slider]]:bg-lodge-gold"
            />
            <span className="text-[0.875rem] tabular-nums text-muted-foreground w-10">
              {fmt(dispDuration)}
            </span>
          </div>

          {/* Direita: shuffle, repetir, volume (desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleShuffle}
              title="Aleatório"
              className={`transition-colors ${shuffle ? "text-warning drop-shadow-[0_0_6px_hsl(var(--lodge-gold)/0.4)]" : "text-muted-foreground hover:text-warning"}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={toggleRepeat}
              title="Repetir"
              className={`transition-colors ${repeat ? "text-warning drop-shadow-[0_0_6px_hsl(var(--lodge-gold)/0.4)]" : "text-muted-foreground hover:text-warning"}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button onClick={toggleMute} className="text-muted-foreground hover:text-warning transition-colors" title="Silenciar">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.05}
              onValueChange={changeVolume}
              className="w-16 cursor-pointer [&>span:first-child]:bg-border [&>span:first-child>span]:bg-lodge-gold [&_[role=slider]]:border-lodge-gold [&_[role=slider]]:bg-lodge-gold"
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
              className={`transition-colors ${shuffle ? "text-warning" : "text-muted-foreground"}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={toggleRepeat}
              title="Repetir"
              className={`transition-colors ${repeat ? "text-warning" : "text-muted-foreground"}`}
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
          <span className="text-[0.875rem] tabular-nums text-muted-foreground w-10 text-right">
            {fmt(dispCurrent)}
          </span>
          <Slider
            value={[dispCurrent]}
            max={dispDuration || 1}
            step={1}
            onValueChange={seek}
            className="flex-1 cursor-pointer [&>span:first-child]:bg-border [&>span:first-child>span]:bg-lodge-gold [&_[role=slider]]:border-lodge-gold [&_[role=slider]]:bg-lodge-gold"
          />
          <span className="text-[0.875rem] tabular-nums text-muted-foreground w-10">
          {fmt(dispDuration)}
          </span>
          </div>
          </div>

      {/* Lista de faixas */}
      <div ref={listRef} className="relative divide-y divide-border max-h-72 overflow-y-auto">
        {musicas.map((m, i) => {
          const isActive = i === atualIdx;
          const progress = isActive && dispDuration ? (dispCurrent / dispDuration) * 100 : 0;
          return (
            <div
              key={m.id}
              ref={(el) => (rowRefs.current[i] = el)}
              className={`relative flex items-center gap-3 px-3 sm:px-4 py-2.5 cursor-pointer transition-colors ${
                isActive ? "bg-warning-soft" : "hover:bg-muted"
              }`}
              onClick={() => playTrack(i)}
            >
              <span className="w-6 shrink-0 text-right text-[0.875rem] tabular-nums text-muted-foreground">
                {isActive && playing ? <Equalizer /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[0.95rem] truncate ${isActive ? "text-warning" : "text-foreground"}`}>
                  {m.nome}
                </p>
                {m.artista && (
                  <p className="text-[0.75rem] text-muted-foreground truncate">{m.artista}</p>
                )}
              </div>
              {renderRowActions && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {renderRowActions(m, i)}
                </div>
              )}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-lodge-gold"
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