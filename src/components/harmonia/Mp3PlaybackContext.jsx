import { createContext, useContext, useRef, useState, useEffect } from "react";

const FADE_MS = 5000; // duração da transição (crossfade) entre músicas

const Mp3PlaybackContext = createContext(null);
export const useMp3Playback = () => useContext(Mp3PlaybackContext);

export function Mp3PlaybackProvider({ children }) {
  const audioRef = useRef(null);        // áudio atual
  const oldAudioRef = useRef(null);     // áudio em fade-out durante crossfade
  const fadeTimerRef = useRef(null);
  const queueRef = useRef([]);          // fila de tracks {id, name, file_url}
  const queueIndexRef = useRef(0);
  const loopRef = useRef(false);        // se a fila repete ao terminar
  const crossfadingRef = useRef(false);
  const fnsRef = useRef({});

  const [activeQueueOwner, setActiveQueueOwner] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  const clearFade = () => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (oldAudioRef.current) {
      oldAudioRef.current.pause();
      oldAudioRef.current.src = "";
      oldAudioRef.current = null;
    }
    crossfadingRef.current = false;
  };

  const stopAll = () => {
    clearFade();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    queueRef.current = [];
    setActiveQueueOwner(null);
    setCurrentTrackId(null);
    setIsPaused(true);
    setPosition(0);
    setDuration(0);
  };

  const nextIndex = () => {
    const n = queueIndexRef.current + 1;
    if (n < queueRef.current.length) return n;
    return loopRef.current ? 0 : -1;
  };

  const playTrackAt = (index, fadeIn = false) => {
    const track = queueRef.current[index];
    if (!track) return;
    clearFade();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const a = new Audio(track.file_url);
    a.preload = "auto";
    a.volume = fadeIn ? 0 : 1;
    audioRef.current = a;
    queueIndexRef.current = index;
    setCurrentTrackId(track.id);
    setPosition(0);
    setDuration(0);
    setError(null);
    a.onended = () => {
      if (audioRef.current !== a || crossfadingRef.current) return;
      const n = fnsRef.current.nextIndex();
      if (n === -1) fnsRef.current.stopAll();
      else fnsRef.current.playTrackAt(n);
    };
    a.play()
      .then(() => setIsPaused(false))
      .catch(() => setError("Não foi possível reproduzir o áudio."));
    if (fadeIn) {
      const start = Date.now();
      fadeTimerRef.current = setInterval(() => {
        const r = Math.min(1, (Date.now() - start) / FADE_MS);
        a.volume = r;
        if (r >= 1) {
          clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
      }, 100);
    }
  };

  // Nos últimos 5s da faixa atual, inicia a próxima em volume 0 e faz o cruzamento
  const startCrossfade = () => {
    const n = nextIndex();
    const old = audioRef.current;
    const track = queueRef.current[n];
    if (n === -1 || !old || !track) return;
    crossfadingRef.current = true;
    oldAudioRef.current = old;
    const next = new Audio(track.file_url);
    next.preload = "auto";
    next.volume = 0;
    audioRef.current = next;
    queueIndexRef.current = n;
    setCurrentTrackId(track.id);
    setPosition(0);
    setDuration(0);
    next.onended = () => {
      if (audioRef.current !== next || crossfadingRef.current) return;
      const nx = fnsRef.current.nextIndex();
      if (nx === -1) fnsRef.current.stopAll();
      else fnsRef.current.playTrackAt(nx);
    };
    next.play().catch(() => {});
    const start = Date.now();
    fadeTimerRef.current = setInterval(() => {
      const r = Math.min(1, (Date.now() - start) / FADE_MS);
      old.volume = Math.max(0, 1 - r);
      next.volume = r;
      if (r >= 1) {
        old.pause();
        old.src = "";
        oldAudioRef.current = null;
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
        crossfadingRef.current = false;
      }
    }, 100);
  };

  fnsRef.current = { nextIndex, playTrackAt, stopAll, startCrossfade };

  // Ticker: atualiza posição/duração e dispara o crossfade próximo ao fim da faixa
  useEffect(() => {
    const id = setInterval(() => {
      const a = audioRef.current;
      if (!a || a.paused) return;
      setPosition(a.currentTime * 1000);
      if (a.duration) setDuration(a.duration * 1000);
      if (!crossfadingRef.current && a.duration && a.duration * 1000 > FADE_MS * 2) {
        const remaining = (a.duration - a.currentTime) * 1000;
        if (remaining <= FADE_MS && remaining > 250) fnsRef.current.startCrossfade();
      }
    }, 250);
    return () => {
      clearInterval(id);
      fnsRef.current.stopAll();
    };
  }, []);

  const playEtapa = (etapaId, tracks) => {
    const fila = (tracks || []).filter((t) => t.file_url);
    if (fila.length === 0) return;
    loopRef.current = true;
    queueRef.current = fila;
    setActiveQueueOwner(etapaId);
    playTrackAt(0);
  };

  const stopEtapa = () => stopAll();

  const togglePauseEtapa = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setIsPaused(false);
    } else {
      if (crossfadingRef.current) {
        clearFade();
        a.volume = 1;
      }
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
    queueRef.current = [track];
    setActiveQueueOwner(null);
    playTrackAt(0);
  };

  const seek = (ms) => {
    const a = audioRef.current;
    if (!a) return;
    if (crossfadingRef.current) {
      clearFade();
      a.volume = 1;
    }
    a.currentTime = ms / 1000;
    setPosition(ms);
  };

  const value = {
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