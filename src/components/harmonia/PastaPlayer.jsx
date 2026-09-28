import { useState, useRef, useEffect, useMemo } from "react";
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

  // Assinatura estável dos ids da lista para detectar mudanças reais de conteúdo
  const idsKey = useMemo(() => musicas.map((m) => m.id).join("|"), [musicas]);
  const prevIdsKeyRef = useRef(idsKey);

  // order guarda IDs (sobrevive a mudanças de índice na lista)
  const [order, setOrder] = useState(() => musicas.map((m) => m.id));
  const [orderPos, setOrderPos] = useState(0);
  // Faixa realmente carregada no áudio — pode ter saído da lista filtrada (destacada)
  const [nowPlaying, setNowPlaying] = useState(() => musicas[0] || null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const endedGuardRef = useRef(false);

  const atualId = order[orderPos];
  const atualIdx = useMemo(() => musicas.findIndex((m) => m.id === atualId), [musicas, atualId]);
  const atual = musicas[atualIdx];
  const detached = nowPlaying ? !musicas.some((m) => m.id === nowPlaying.id) : false;
  const displayTrack = nowPlaying || atual;
  const activeId = nowPlaying?.id ?? atual?.id;

  const { start: trimStart, end: trimEnd, analyzing } = useSilenceTrim(displayTrack?.file_url, {
    savedStart: displayTrack?.silence_start,
    savedEnd: displayTrack?.silence_end,
    persistId: displayTrack?.id,
  });

  // Reconciliação inteligente: só age quando o conteúdo da lista muda de verdade
  useEffect(() => {
    if (prevIdsKeyRef.current === idsKey) return;
    prevIdsKeyRef.current = idsKey;

    const idSet = new Set(musicas.map((m) => m.id));
    const filtered = order.filter((id) => idSet.has(id));

    if (filtered.length === 0) {
      // Mudança drástica (ex: troca de filtro/pasta) ou lista vazia — zera o player
      setOrder(musicas.map((m) => m.id));
      setOrderPos(0);
      setNowPlaying(musicas[0] || null);
      setPlaying(false);
      return;
    }

    // Mudança parcial — preserva a sequência e a faixa em reprodução
    setOrder(filtered);
    setOrderPos((prev) => {
      if (nowPlaying && filtered.includes(nowPlaying.id)) return filtered.indexOf(nowPlaying.id);
      return Math.min(prev, filtered.length - 1);
    });
    // Se nowPlaying saiu da lista, mantém como destacada para continuar tocando
  }, [idsKey]);

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

  // (Re)carregar e reproduzir quando o src muda (troca de faixa)
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !displayTrack) return;
    endedGuardRef.current = false;
    setCurrent(0);
    if (playing) a.play().catch(() => setPlaying(false));
  }, [displayTrack?.file_url]);

  // Aplicar offset de silêncio quando os limites ficam prontos
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !displayTrack) return;
    if (trimStart > 0 && a.currentTime < trimStart) {
      try { a.currentTime = trimStart; } catch {}
    }
  }, [trimStart, trimEnd]);

  // Rolar a lista para colocar a faixa ativa no topo
  useEffect(() => {
    if (detached) return;
    const list = listRef.current;
    const el = rowRefs.current[atualIdx];
    if (!list || !el) return;
    list.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  }, [atualIdx, detached]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !displayTrack) return;
    if (playing) a.pause();
    else a.play().catch(() => setPlaying(false));
  };

  const buildShuffleFromScratch = (avoidId) => {
    let ids = shuffleArray(musicas.map((m) => m.id));
    if (avoidId && ids.length > 1 && ids[0] === avoidId) {
      [ids[0], ids[1]] = [ids[1], ids[0]];
    }
    return ids;
  };

  const proxima = () => {
    if (order.length === 0) return;
    let newPos = orderPos;
    let newOrder = order;
    if (orderPos < order.length - 1) {
      newPos = orderPos + 1;
    } else if (shuffle) {
      const lastId = order[order.length - 1];
      newOrder = buildShuffleFromScratch(lastId);
      newPos = 0;
    } else {
      newPos = 0;
    }
    const nextTrack = musicas.find((m) => m.id === newOrder[newPos]);
    if (nextTrack) setNowPlaying(nextTrack);
    setOrder(newOrder);
    setOrderPos(newPos);
  };

  const anterior = () => {
    if (order.length === 0) return;
    const newPos = orderPos > 0 ? orderPos - 1 : order.length - 1;
    const prevTrack = musicas.find((m) => m.id === order[newPos]);
    if (prevTrack) setNowPlaying(prevTrack);
    setOrderPos(newPos);
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
    if (detached) {
      // Faixa destacada acabou: continua com a próxima faixa restante da sequência
      if (order.length === 0) { setPlaying(false); return; }
      const nextId = order[orderPos] ?? order[0];
      const nextTrack = musicas.find((m) => m.id === nextId);
      if (nextTrack) { setNowPlaying(nextTrack); setPlaying(true); }
      else setPlaying(false);
      return;
    }
    proxima();
  };

  const toggleShuffle = () => {
    if (!shuffle) {
      const startId = nowPlaying?.id ?? atualId ?? musicas[0]?.id;
      const rest = musicas.map((m) => m.id).filter((id) => id !== startId);
      setOrder([startId, ...shuffleArray(rest)].filter(Boolean));
      setOrderPos(0);
      setShuffle(true);
    } else {
      const startId = nowPlaying?.id ?? atualId ?? musicas[0]?.id;
      const newOrder = musicas.map((m) => m.id);
      setOrder(newOrder);
      setOrderPos(Math.max(0, newOrder.indexOf(startId)));
      setShuffle(false);
    }
  };

  const toggleRepeat = () => setRepeat((r) => !r);

  const playTrack = (i) => {
    const track = musicas[i];
    if (!track) return;
    if (nowPlaying && track.id === nowPlaying.id) {
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
      const rest = musicas.map((m) => m.id).filter((id) => id !== track.id);
      setOrder([track.id, ...shuffleArray(rest)]);
      setOrderPos(0);
    } else {
      const idx = order.indexOf(track.id);
      if (idx >= 0) setOrderPos(idx);
      else { setOrder([...order, track.id]); setOrderPos(order.length); }
    }
    setNowPlaying(track);
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

  if (musicas.length === 0 && !nowPlaying) return null;

  const dispCurrent = Math.max(0, current - (trimStart || 0));
  const dispDuration = Math.max(0, (trimEnd > (trimStart || 0) ? trimEnd : duration) - (trimStart || 0)) || duration;

  const btnGold = "text-warning hover:text-warning transition-colors";
  const ctrlBtn =
    "w-9 h-9 rounded-full border border-border text-warning hover:bg-lodge-gold hover:text-landing-deep flex items-center justify-center transition-colors";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <audio
        ref={audioRef}
        src={displayTrack?.file_url}
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
              {displayTrack?.nome || "—"}
            </p>
            <p className="text-[0.75rem] uppercase tracking-wider text-muted-foreground truncate">
              {displayTrack?.artista || (detached ? "Tocando fora da lista" : `Faixa ${(atualIdx ?? 0) + 1} de ${musicas.length}`)}
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
          const isActive = m.id === activeId;
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