// Detecção de silêncio nas pontas de um arquivo de áudio via Web Audio API.
// Retorna { start, end } em segundos (trecho útil), ou null em caso de falha.

const DEFAULT_THRESHOLD_DB = -40; // limiar de silêncio (amplitude linear 0.01)
const BLOCK_MS = 10; // resolução da análise (~10ms por bloco)

// Cache em memória compartilhado entre todos os players da sessão.
const cache = new Map(); // file_url -> { start, end }

export function getCachedSilence(fileUrl) {
  return cache.get(fileUrl);
}

export function setCachedSilence(fileUrl, value) {
  cache.set(fileUrl, value);
}

export function clearCachedSilence(fileUrl) {
  cache.delete(fileUrl);
}

export async function detectSilence(fileUrl, { thresholdDb = DEFAULT_THRESHOLD_DB } = {}) {
  const cached = cache.get(fileUrl);
  if (cached) return cached;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error("fetch failed");
    const arrBuf = await res.arrayBuffer();

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("AudioContext indisponível");
    const ctx = new AC();

    let audioBuf;
    try {
      audioBuf = await ctx.decodeAudioData(arrBuf);
    } finally {
      ctx.close();
    }

    const duration = audioBuf.duration;
    const sampleRate = audioBuf.sampleRate;
    const len = audioBuf.length;
    const ch0 = audioBuf.getChannelData(0);
    const threshold = Math.pow(10, thresholdDb / 20);
    const block = Math.max(1, Math.floor((sampleRate * BLOCK_MS) / 1000));

    // Início: primeiro bloco cujo pico ultrapassa o limiar
    let startSample = 0;
    let foundStart = false;
    for (let i = 0; i < len; i += block) {
      let peak = 0;
      const end = Math.min(i + block, len);
      for (let j = i; j < end; j++) {
        const v = ch0[j];
        const av = v < 0 ? -v : v;
        if (av > peak) peak = av;
      }
      if (peak > threshold) {
        startSample = i;
        foundStart = true;
        break;
      }
    }

    // Fim: último bloco cujo pico ultrapassa o limiar
    let endSample = len;
    for (let i = len - block; i >= 0; i -= block) {
      let peak = 0;
      const end = Math.min(i + block, len);
      for (let j = i; j < end; j++) {
        const v = ch0[j];
        const av = v < 0 ? -v : v;
        if (av > peak) peak = av;
      }
      if (peak > threshold) {
        endSample = end;
        break;
      }
    }

    let start = foundStart ? startSample / sampleRate : 0;
    let end = endSample / sampleRate;
    if (!isFinite(start) || start < 0) start = 0;
    if (!isFinite(end) || end <= start || end > duration) end = duration;

    const result = { start, end };
    cache.set(fileUrl, result);
    return result;
  } catch (e) {
    return null;
  }
}