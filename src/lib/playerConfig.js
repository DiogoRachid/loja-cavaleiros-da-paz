// Configurações globais do player de harmonia.
// Persistidas por usuário (mesmo isolamento por sessão usado no resto do app).

export const DEFAULT_PLAYER_CONFIG = {
  crossfadeEnabled: true,
  crossfadeMs: 3000,
  crossfadeCurve: "equal", // "linear" | "equal" | "exponential"
  crossfadeOnLoop: true,
  defaultVolume: 1,
  normalizeVolume: false,
  manualFadeEnabled: true,
  manualFadeMs: 400,
  warnBeforeEnd: true,
  warnLeadMs: 5000,
};

const EVENT = "player-config-change";

const userKey = () => {
  try {
    const admin = JSON.parse(sessionStorage.getItem("admin_data") || "null");
    const irmao = JSON.parse(sessionStorage.getItem("irmao_data") || "null");
    const id = admin?.id || admin?.numero_glp || irmao?.id || irmao?.numero_glp;
    return `player_config_${id || "global"}`;
  } catch {
    return "player_config_global";
  }
};

export function getPlayerConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(userKey()) || "{}");
    return { ...DEFAULT_PLAYER_CONFIG, ...saved };
  } catch {
    return { ...DEFAULT_PLAYER_CONFIG };
  }
}

export function savePlayerConfig(config) {
  const full = { ...DEFAULT_PLAYER_CONFIG, ...config };
  localStorage.setItem(userKey(), JSON.stringify(full));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: full }));
  return full;
}

export function resetPlayerConfig() {
  return savePlayerConfig(DEFAULT_PLAYER_CONFIG);
}

export function subscribePlayerConfig(cb) {
  const handler = (e) => cb(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

// Curvas de fade (0 -> 1 do progresso da transição)
export function fadeGains(curve, r) {
  if (curve === "linear") return { out: 1 - r, in: r };
  if (curve === "exponential") return { out: (1 - r) * (1 - r), in: r * r };
  return { out: Math.cos((r * Math.PI) / 2), in: Math.sin((r * Math.PI) / 2) };
}