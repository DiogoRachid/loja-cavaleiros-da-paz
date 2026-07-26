import { createContext, useContext, useRef, useState, useEffect } from "react";

const CROSSFADE_MS = 5000;   // duração do crossfade entre músicas (configurável)
const FADE_TICK_MS = 50;     // resolução do fade
const PRELOAD_LEAD_MS = 8000; // antecedência do pré-carregamento da próxima faixa

// Curva equal-power (cosseno): evita queda de volume percebida no meio da transição
const fadeOutGain = (r) => Math.cos((r * Math.PI) / 2);
const fadeInGain = (r) => Math.sin((r * Math.PI) / 2);

const Mp3PlaybackContext = createContext(null);
export const useMp3Playback = () => useContext(Mp3PlaybackContext);

export function Mp3PlaybackProvider({ children }) {
  const audioRef = useRef(null);        // player A: faixa atual
  const oldAudioRef = useRef(null);     // player que está saindo (fade-out)
  const preloadRef = useRef(null);      // { url, audio } player B pré-carregado
  const fadeTimerRef = useRef(null);
  const queueRef = useRef([]);          // fila de tracks {id, name, file_url}
  const queueIndexRef = useRef(0);
  const loopRef = useRef(false);        // se a fila repete ao terminar
  const crossfadingRef = useRef(false);
  const fnsRef = useRef({});
  const volumeRef = useRef(1);          // volume mestre (0 a 1)
  const repeatTrackRef = useRef(false); // repetir a música atual
  const ownerRef = useRef(null);        // etapa (pasta) da fila atual
  const nextEtapaResolverRef = useRef(null); // devolve a próxima etapa com músicas

  const [activeQueueOwner, setActiveQueueOwner] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(1);
  const [repeatTrack, setRepeatTrack] = useState(false);

  const discard = (a) => {
    if (!a) return;
    a.onended = null;
    a.pause();
    a.src = "";
  };

  const clearPreload = () => {
    if (preloadRef.current) {
      discard(preloadRef.current.audio);
      preloadRef.current = null;
    }
  };

  // Cancela qualquer crossfade em andamento, mantendo apenas a faixa atual
  const clearFade = () => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (oldAudioRef.current) {
      discard(oldAudioRef.current);
      oldAudioRef.current = null;
    }
    crossfadingRef.current = false;
    if (audioRef.current) audioRef.current.volume = volumeRef.current;
  };

  const stopAll = () => {
    clearFade();
    clearPreload();
    discard(audioRef.current);
    audioRef.current = null;
    queueRef.current = [];
    ownerRef.current = null;
    setActiveQueueOwner(null);
    setCurrentTrackId(null);
    setIsPaused(true);
    setPosition(0);
    setDuration(0);
  };

  // Descobre a PRÓXIMA faixa sem alterar o estado (repeat one / fila / próxima etapa / repeat all).
  // O commit() aplica a mudança de índice/etapa no momento em que o crossfade começa.
  const peekNext = () => {
    const q = queueRef.current;
    if (!q.length) return null;

    if (repeatTrackRef.current) {
      const i = queueIndexRef.current;
      return { track: q[i], commit: () => { queueIndexRef.current = i; } };
    }

    const n = queueIndexRef.current + 1;
    if (n < q.length) {
      return { track: q[n], commit: () => { queueIndexRef.current = n; } };
    }

    const prox = nextEtapaResolverRef.current?.(ownerRef.current);
    const fila = (prox?.tracks || []).filter((t) => t.file_url);
    if (fila.length > 0) {
      return {
        track: fila[0],
        commit: () => {
          queueRef.current = fila;
          ownerRef.current = prox.etapaId;
          setActiveQueueOwner(prox.etapaId);
          queueIndexRef.current = 0;
        },
      };
    }

    if (loopRef.current) return { track: q[0], commit: () => { queueIndexRef.current = 0; } };
    return null;
  };

  // Pré-carrega a próxima faixa com antecedência (evita buffering no meio da transição)
  const ensurePreload = () => {
    const nx = peekNext();
    if (!nx?.track?.file_url) return;
    if (preloadRef.current?.url === nx.track.file_url) return;
    clearPreload();
    const a = new Audio();
    a.preload = "auto";
    a.src = nx.track.file_url;
    a.volume = 0;
    a.load();
    preloadRef.current = { url: nx.track.file_url, audio: a };
  };

  const takePreloaded = (url) => {
    if (preloadRef.current?.url === url) {
      const a = preloadRef.current.audio;
      preloadRef.current = null;
      return a;
    }
    clearPreload();
    const a = new Audio(url);
    a.preload = "auto";
    return a;
  };

  const attachEnded = (a) => {
    a.onended = () => {
      // Rede de segurança: normalmente a troca acontece antes do fim, via crossfade
      if (audioRef.current !== a || crossfadingRef.current) return;
      fnsRef.current.advance();
    };
  };

  const playTrackAt = (index) => {
    const track = queueRef.current[index];
    if (!track) return;
    clearFade();
    discard(audioRef.current);
    const a = takePreloaded(track.file_url);
    a.currentTime = 0;
    a.volume = volumeRef.current;
    audioRef.current = a;
    queueIndexRef.current = index;
    setCurrentTrackId(track.id);
    setPosition(0);
    setDuration(0);
    setError(null);
    attachEnded(a);
    a.play()
      .then(() => setIsPaused(false))
      .catch(() => setError("Não foi possível reproduzir o áudio."));
  };

  const advance = () => {
    const nx = peekNext();
    if (!nx) {
      fnsRef.current.stopAll();
      return;
    }
    nx.commit();
    playTrackAt(queueIndexRef.current);
  };

  // Inicia o crossfade: player B entra em volume 0 enquanto o A faz fade-out
  const startCrossfade = (fadeMs) => {
    const old = audioRef.current;
    const nx = peekNext();
    if (!old || !nx?.track?.file_url) return;

    crossfadingRef.current = true;
    oldAudioRef.current = old;
    old.onended = null;

    const next = takePreloaded(nx.track.file_url);
    next.currentTime = 0;
    next.volume = 0;
    audioRef.current = next;
    nx.commit();
    setCurrentTrackId(nx.track.id);
    setPosition(0);
    setDuration(0);
    attachEnded(next);
    next.play().catch(() => {});

    const start = Date.now();
    fadeTimerRef.current = setInterval(() => {
      const r = Math.min(1, (Date.now() - start) / fadeMs);
      const vol = volumeRef.current;
      old.volume = Math.max(0, Math.min(1, fadeOutGain(r))) * vol;
      next.volume = Math.max(0, Math.min(1, fadeInGain(r))) * vol;
      if (r >= 1) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
        discard(old);
        oldAudioRef.current = null;
        crossfadingRef.current = false;
        next.volume = vol;
      }
    }, FADE_TICK_MS);
  };

  fnsRef.current = { advance, playTrackAt, stopAll, startCrossfade };

  // Ticker: posição/duração, pré-carregamento e disparo do crossfade
  useEffect(() => {
    const id = setInterval(() => {
      const a = audioRef.current;
      if (!a || a.paused) return;
      setPosition(a.currentTime * 1000);
      if (a.duration) setDuration(a.duration * 1000);
      if (crossfadingRef.current || !a.duration || !isFinite(a.duration)) return;

      const totalMs = a.duration * 1000;
      // Faixas curtas: fade proporcional (nunca mais da metade da faixa)
      const fadeMs = Math.max(400, Math.min(CROSSFADE_MS, totalMs / 2));
      const remaining = totalMs - a.currentTime * 1000;

      if (remaining <= fadeMs + PRELOAD_LEAD_MS) ensurePreload();
      if (remaining <= fadeMs && remaining > 120) fnsRef.current.startCrossfade(fadeMs);
    }, 100);
    return () => {
      clearInterval(id);
      fnsRef.current.stopAll();
    };
  }, []);

  const playEtapa = (etapaId, tracks, startIndex = 0) => {
    const fila = (tracks || []).filter((t) => t.file_url);
    if (fila.length === 0) return;
    loopRef.current = false;
    queueRef.current = fila;
    ownerRef.current = etapaId;
    setActiveQueueOwner(etapaId);
    playTrackAt(Math.min(Math.max(startIndex, 0), fila.length - 1));
  };

  const stopEtapa = () => stopAll();

  const togglePauseEtapa = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setIsPaused(false);
    } else {
      clearFade();
      a.pause();
      setIsPaused(true);
    }
  };

  const toggle = (track) => {
    if (!track?.file_url) return;
    if (currentTrackId === track.id) {
      togglePauseEtapa();
      return;
    }
    loopRef.current = false;
    clearPreload();
    queueRef.current = [track];
    ownerRef.current = null;
    setActiveQueueOwner(null);
    playTrackAt(0);
  };

  const seek = (ms) => {
    const a = audioRef.current;
    if (!a) return;
    clearFade();
    a.currentTime = ms / 1000;
    setPosition(ms);
  };

  const setVolume = (v) => {
    volumeRef.current = v;
    setVolumeState(v);
    if (audioRef.current && !crossfadingRef.current) audioRef.current.volume = v;
  };

  const toggleRepeatTrack = () => {
    repeatTrackRef.current = !repeatTrackRef.current;
    setRepeatTrack(repeatTrackRef.current);
    clearPreload();
  };

  const setNextEtapaResolver = (fn) => {
    nextEtapaResolverRef.current = fn;
  };

  const value = {
    volume,
    setVolume,
    repeatTrack,
    toggleRepeatTrack,
    setNextEtapaResolver,
    activeQueueOwner,
    currentTrackId,
    isPaused,
    position,
    duration,
    error,
    playEtapa,
    stopEtapa,
    togglePauseEtapa,
    toggle,
    seek,
  };

  return <Mp3PlaybackContext.Provider value={value}>{children}</Mp3PlaybackContext.Provider>;
}