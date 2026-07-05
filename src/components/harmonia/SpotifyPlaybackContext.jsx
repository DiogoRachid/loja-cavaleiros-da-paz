import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const SpotifyPlaybackContext = createContext(null);

export function useSpotifyPlayback() {
  return useContext(SpotifyPlaybackContext);
}

function loadSdkScript() {
  return new Promise((resolve) => {
    if (window.Spotify) {
      resolve();
      return;
    }
    const existing = document.getElementById("spotify-sdk");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "spotify-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }
    if (window.onSpotifyWebPlaybackSDKReady) {
      const prev = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => { prev(); resolve(); };
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => resolve();
    }
    if (window.Spotify) resolve();
  });
}

async function fetchToken() {
  const res = await base44.functions.invoke("spotifyAuth", { action: "get_token" });
  if (res.data?.error) throw new Error(res.data.error);
  return res.data.access_token;
}

export function SpotifyPlaybackProvider({ children }) {
  const playerRef = useRef(null);
  const deviceIdRef = useRef(null);
  const tokenRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [currentUri, setCurrentUri] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [position, setPosition] = useState(0);   // ms decorridos na faixa atual
  const [duration, setDuration] = useState(0);    // ms de duração da faixa atual

  // fila/sequência da etapa (repeat somente dentro da etapa)
  const queueRef = useRef([]);          // array de uris
  const queueIndexRef = useRef(0);
  const queueOwnerRef = useRef(null);   // id da etapa dona da fila
  const prevTrackEndedRef = useRef(false);
  const lastPositionRef = useRef(0);      // última posição conhecida (para detectar fim real da faixa)
  const [activeQueueOwner, setActiveQueueOwner] = useState(null);

  const init = useCallback(async () => {
    if (playerRef.current || initializing) return;
    setInitializing(true);
    setError(null);
    try {
      const token = await fetchToken();
      tokenRef.current = token;
      await loadSdkScript();

      const player = new window.Spotify.Player({
        name: "Harmonia — Cavaleiros da Paz",
        getOAuthToken: async (cb) => {
          try {
            const t = await fetchToken();
            tokenRef.current = t;
            cb(t);
          } catch {
            cb(tokenRef.current);
          }
        },
        volume: 0.8,
      });

      player.addListener("ready", ({ device_id }) => {
        deviceIdRef.current = device_id;
        setReady(true);
      });
      player.addListener("not_ready", () => {
        setReady(false);
      });
      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setIsPaused(state.paused);
        setCurrentUri(state.track_window?.current_track?.uri || null);
        setPosition(state.position || 0);
        setDuration(state.duration || 0);

        // Detecta o fim de uma faixa para avançar a fila da etapa (repeat interno).
        // Só considera "fim real" se a faixa voltou a 0 vindo de perto do fim (>90% da duração),
        // evitando falsos positivos no estado transitório do início da reprodução.
        if (queueRef.current.length > 0) {
          const dur = state.duration || 0;
          const wasNearEnd = dur > 0 && lastPositionRef.current >= dur * 0.9;
          const trackEnded = state.paused && state.position === 0 && wasNearEnd;
          if (trackEnded && !prevTrackEndedRef.current) {
            advanceQueueRef.current?.();
          }
          prevTrackEndedRef.current = trackEnded;
        }
        if (state.position > 0) lastPositionRef.current = state.position;
      });
      player.addListener("initialization_error", ({ message }) => setError(message));
      player.addListener("authentication_error", ({ message }) => setError(message));
      player.addListener("account_error", () =>
        setError("É necessária uma conta Spotify Premium para reproduzir pelo sistema.")
      );

      const connected = await player.connect();
      if (!connected) setError("Não foi possível conectar ao player do Spotify.");
      playerRef.current = player;
    } catch (e) {
      setError(e.message || "Erro ao iniciar o player do Spotify.");
    } finally {
      setInitializing(false);
    }
  }, [initializing]);

  useEffect(() => {
    return () => {
      if (playerRef.current) playerRef.current.disconnect();
    };
  }, []);

  // Atualiza a posição da faixa a cada segundo enquanto está tocando
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setPosition((p) => (duration ? Math.min(p + 1000, duration) : p + 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isPaused, duration]);

  const playUri = useCallback(async (uri) => {
    if (!playerRef.current) await init();
    // aguarda o device ficar pronto
    for (let i = 0; i < 30 && !deviceIdRef.current; i++) {
      await new Promise((r) => setTimeout(r, 200));
    }
    if (!deviceIdRef.current) {
      setError("Player ainda não está pronto. Tente novamente.");
      return;
    }
    const token = tokenRef.current || (await fetchToken());
    // Garante que a reprodução ocorra NESTE dispositivo (evita tocar em outro app/dispositivo, sem som aqui)
    await fetch(`https://api.spotify.com/v1/me/player`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceIdRef.current], play: false }),
    }).catch(() => {});
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [uri] }),
    });
    // Ativa o áudio no elemento do SDK (política de autoplay dos navegadores)
    try { await playerRef.current?.activateElement?.(); } catch { /* ignore */ }
    setCurrentUri(uri);
    setIsPaused(false);
  }, [init]);

  // Libera o áudio do SDK — DEVE ser chamado sincronamente dentro de um clique do usuário
  const activateElement = useCallback(() => {
    try { playerRef.current?.activateElement?.(); } catch { /* ignore */ }
  }, []);

  // Avança/retrocede manualmente dentro da faixa atual
  const seek = useCallback(async (ms) => {
    const target = Math.max(0, Math.floor(ms || 0));
    await playerRef.current?.seek(target);
    setPosition(target);
  }, []);

  const toggle = useCallback(async (uri) => {
    // reprodução individual sai da fila da etapa
    queueRef.current = [];
    queueOwnerRef.current = null;
    setActiveQueueOwner(null);
    if (currentUri === uri && !isPaused) {
      await playerRef.current?.pause();
    } else if (currentUri === uri && isPaused) {
      await playerRef.current?.resume();
    } else {
      await playUri(uri);
    }
  }, [currentUri, isPaused, playUri]);

  const advanceQueueRef = useRef(null);
  const advanceQueue = useCallback(async () => {
    if (queueRef.current.length === 0) return;
    // repeat somente dentro da etapa: ao terminar a última, volta para a primeira
    queueIndexRef.current = (queueIndexRef.current + 1) % queueRef.current.length;
    prevTrackEndedRef.current = false;
    lastPositionRef.current = 0;
    await playUri(queueRef.current[queueIndexRef.current]);
  }, [playUri]);
  advanceQueueRef.current = advanceQueue;

  // Toca todas as músicas de uma etapa em sequência, repetindo dentro da etapa
  const playEtapa = useCallback(async (ownerId, uris) => {
    const list = (uris || []).filter(Boolean);
    if (list.length === 0) return;
    queueRef.current = list;
    queueIndexRef.current = 0;
    queueOwnerRef.current = ownerId;
    prevTrackEndedRef.current = false;
    lastPositionRef.current = 0;
    setActiveQueueOwner(ownerId);
    await playUri(list[0]);
  }, [playUri]);

  const pause = useCallback(async () => {
    await playerRef.current?.pause();
  }, []);

  // Pausa/retoma a etapa em reprodução sem limpar a fila (mantém o repeat)
  const togglePauseEtapa = useCallback(async () => {
    if (isPaused) {
      await playerRef.current?.resume();
    } else {
      await playerRef.current?.pause();
    }
  }, [isPaused]);

  const stopEtapa = useCallback(async () => {
    queueRef.current = [];
    queueOwnerRef.current = null;
    setActiveQueueOwner(null);
    await playerRef.current?.pause();
  }, []);

  const value = {
    ready,
    error,
    initializing,
    currentUri,
    isPaused,
    position,
    duration,
    init,
    playUri,
    toggle,
    pause,
    playEtapa,
    stopEtapa,
    togglePauseEtapa,
    seek,
    activateElement,
    activeQueueOwner,
  };

  return (
    <SpotifyPlaybackContext.Provider value={value}>
      {children}
    </SpotifyPlaybackContext.Provider>
  );
}