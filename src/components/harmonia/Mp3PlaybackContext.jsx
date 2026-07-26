import { createContext, useContext, useRef, useState, useEffect } from "react";
import { getPlayerConfig, subscribePlayerConfig, fadeGains } from "@/lib/playerConfig";

const FADE_TICK_MS = 50;      // resolução do fade
const PRELOAD_LEAD_MS = 8000; // antecedência do pré-carregamento da próxima faixa

const Mp3PlaybackContext = createContext(null);
export const useMp3Playback = () => useContext(Mp3PlaybackContext);

export function Mp3PlaybackProvider({ children }) {
  const audioRef = useRef(null);        // player A: faixa atual
  const oldAudioRef = useRef(null);     // player que está saindo (fade-out)
  const preloadRef = useRef(null);      // { url, audio } player B pré-carregado
  const fadeTimerRef = useRef(null);
  const manualFadeRef = useRef(null);
  const queueRef = useRef([]);          // fila de tracks da ETAPA atual
  const queueIndexRef = useRef(0);
  const crossfadingRef = useRef(false);
  const fnsRef = useRef({});
  const volumeRef = useRef(1);
  const repeatTrackRef = useRef(false); // repetir apenas a música atual
  const ownerRef = useRef(null);        // etapa (pasta) da fila atual
  const cfgRef = useRef(getPlayerConfig());

  const [config, setConfig] = useState(cfgRef.current);
  const [activeQueueOwner, setActiveQueueOwner] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(cfgRef.current.defaultVolume);
  const [repeatTrack, setRepeatTrack] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);

  // Volume inicial vindo das configurações + reatividade imediata às mudanças
  useEffect(() => {
    volumeRef.current = cfgRef.current.defaultVolume;
    setVolumeState(cfgRef.current.defaultVolume);
    return subscribePlayerConfig((cfg) => {
      cfgRef.current = cfg;
      setConfig(cfg);
    });
  }, []);

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

  const clearManualFade = () => {
    if (manualFadeRef.current) {
      clearInterval(manualFadeRef.current);
      manualFadeRef.current = null;
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
    clearManualFade();
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
    setNearEnd(false);
  };

  // Próxima faixa SEMPRE dentro da mesma etapa: próxima da fila ou volta ao início (loop).
  // A passagem entre etapas é manual — nunca automática.
  const peekNext = () => {
    const q = queueRef.current;
    if (!q.length) return null;
    if (repeatTrackRef.current) {
      const i = queueIndexRef.current;
      return { track: q[i], isLoop: true, commit: () => { queueIndexRef.current = i; } };
    }
    const n = queueIndexRef.current + 1;
    if (n < q.length) return { track: q[n], isLoop: false, commit: () => { queueIndexRef.current = n; } };
    // Fim da etapa: repete a etapa em loop até o Mestre avançar manualmente
    return { track: q[0], isLoop: true, commit: () => { queueIndexRef.current = 0; } };
  };

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
      // Rede de segurança: com crossfade ativo a troca acontece antes do fim
      if (audioRef.current !== a || crossfadingRef.current) return;
      fnsRef.current.advance();
    };
  };

  const rampVolume = (a, from, to, ms, done) => {
    clearManualFade();
    const start = Date.now();
    a.volume = Math.max(0, Math.min(1, from));
    manualFadeRef.current = setInterval(() => {
      const r = Math.min(1, (Date.now() - start) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * r));
      if (r >= 1) {
        clearManualFade();
        done?.();
      }
    }, 30);
  };

  const playTrackAt = (index) => {
    const track = queueRef.current[index];
    if (!track) return;
    clearFade();
    clearManualFade();
    discard(audioRef.current);
    const a = takePreloaded(track.file_url);
    a.currentTime = 0;
    a.volume = volumeRef.current;
    audioRef.current = a;
    queueIndexRef.current = index;
    setCurrentTrackId(track.id);
    setPosition(0);
    setDuration(0);
    setNearEnd(false);
    setError(null);
    attachEnded(a);
    a.play()
      .then(() => {
        setIsPaused(false);
        const cfg = cfgRef.current;
        if (cfg.manualFadeEnabled) rampVolume(a, 0, volumeRef.current, cfg.manualFadeMs);
      })
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

  // Crossfade dentro da etapa: player B entra em volume 0 enquanto o A faz fade-out
  const startCrossfade = (fadeMs) => {
    const old = audioRef.current;
    const nx = peekNext();
    if (!old || !nx?.track?.file_url) return;

    const curve = cfgRef.current.crossfadeCurve;
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
    setNearEnd(false);
    attachEnded(next);
    next.play().catch(() => {});

    const start = Date.now();
    fadeTimerRef.current = setInterval(() => {
      const r = Math.min(1, (Date.now() - start) / fadeMs);
      const g = fadeGains(curve, r);
      const vol = volumeRef.current;
      old.volume = Math.max(0, Math.min(1, g.out)) * vol;
      next.volume = Math.max(0, Math.min(1, g.in)) * vol;
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

  // Ticker: posição/duração, pré-carregamento, aviso de fim e disparo do crossfade
  useEffect(() => {
    const id = setInterval(() => {
      const a = audioRef.current;
      if (!a || a.paused) return;
      const cfg = cfgRef.current;
      setPosition(a.currentTime * 1000);
      if (a.duration) setDuration(a.duration * 1000);
      if (crossfadingRef.current || !a.duration || !isFinite(a.duration)) return;

      const totalMs = a.duration * 1000;
      const remaining = totalMs - a.currentTime * 1000;

      setNearEnd(cfg.warnBeforeEnd && remaining <= cfg.warnLeadMs);

      const nx = peekNext();
      const podeCrossfade =
        cfg.crossfadeEnabled && nx && (!nx.isLoop || cfg.crossfadeOnLoop);
      if (!podeCrossfade) return;

      // Faixas curtas: fade proporcional (nunca mais da metade da faixa)
      const fadeMs = Math.max(400, Math.min(cfg.crossfadeMs, totalMs / 2));
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
    queueRef.current = fila;
    ownerRef.current = etapaId;
    setActiveQueueOwner(etapaId);
    playTrackAt(Math.min(Math.max(startIndex, 0), fila.length - 1));
  };

  const stopEtapa = () => stopAll();

  const togglePauseEtapa = () => {
    const a = audioRef.current;
    if (!a) return;
    const cfg = cfgRef.current;
    if (a.paused) {
      a.play().catch(() => {});
      setIsPaused(false);
      if (cfg.manualFadeEnabled) rampVolume(a, 0, volumeRef.current, cfg.manualFadeMs);
      else a.volume = volumeRef.current;
    } else {
      clearFade();
      if (cfg.manualFadeEnabled) {
        rampVolume(a, a.volume, 0, cfg.manualFadeMs, () => {
          a.pause();
          a.volume = volumeRef.current;
        });
      } else {
        a.pause();
      }
      setIsPaused(true);
    }
  };

  const toggle = (track) => {
    if (!track?.file_url) return;
    if (currentTrackId === track.id) {
      togglePauseEtapa();
      return;
    }
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

  // Mantido por compatibilidade: a passagem entre etapas é sempre manual
  const setNextEtapaResolver = () => {};

  const value = {
    config,
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
    nearEnd,
    error,
    playEtapa,
    stopEtapa,
    togglePauseEtapa,
    toggle,
    seek,
  };

  return <Mp3PlaybackContext.Provider value={value}>{children}</Mp3PlaybackContext.Provider>;
}