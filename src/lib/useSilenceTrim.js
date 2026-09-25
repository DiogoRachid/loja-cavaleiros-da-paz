import { useState, useEffect } from "react";
import { detectSilence, getCachedSilence, setCachedSilence } from "./silenceDetect";
import { db } from "@/api/db";

// Hook que retorna os limites de silêncio (start/end) de uma faixa.
// Usa valores salvos na entidade, depois o cache em memória e, por fim,
// dispara a detecção (uma única vez) e persiste o resultado em MinhaMp3.
//
// useSilenceTrim(fileUrl, { savedStart, savedEnd, persistId })
export function useSilenceTrim(fileUrl, { savedStart, savedEnd, persistId } = {}) {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!fileUrl) {
      setStart(0);
      setEnd(0);
      setAnalyzing(false);
      return;
    }

    // 1. Valores já salvos na entidade
    if (savedStart != null && savedEnd != null && savedEnd > savedStart) {
      setStart(savedStart);
      setEnd(savedEnd);
      setCachedSilence(fileUrl, { start: savedStart, end: savedEnd });
      setAnalyzing(false);
      return;
    }

    // 2. Cache em memória (compartilhado entre players)
    const cached = getCachedSilence(fileUrl);
    if (cached) {
      setStart(cached.start);
      setEnd(cached.end);
      setAnalyzing(false);
      return;
    }

    // 3. Detectar
    let cancelled = false;
    setAnalyzing(true);
    detectSilence(fileUrl).then((res) => {
      if (cancelled) return;
      setAnalyzing(false);
      if (!res) {
        setStart(0);
        setEnd(0);
        return;
      }
      setStart(res.start);
      setEnd(res.end);
      if (persistId) {
        db.MinhaMp3.update(persistId, {
          silence_start: res.start,
          silence_end: res.end,
        }).catch(() => {});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [fileUrl, savedStart, savedEnd, persistId]);

  return { start, end, analyzing };
}