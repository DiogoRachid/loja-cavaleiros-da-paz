import { useEffect } from "react";
import { useMp3Playback } from "./Mp3PlaybackContext";

// Informa ao player qual é a próxima etapa (pasta) com músicas,
// para que a reprodução emende de uma pasta para a outra com transição suave.
export default function EtapaChain({ etapas }) {
  const { setNextEtapaResolver } = useMp3Playback();

  useEffect(() => {
    setNextEtapaResolver((etapaAtualId) => {
      const idx = etapas.findIndex((e) => e.id === etapaAtualId);
      if (idx === -1) return null;
      const prox = etapas
        .slice(idx + 1)
        .find((e) => (e.tracks || []).some((t) => t.file_url));
      return prox ? { etapaId: prox.id, tracks: prox.tracks } : null;
    });
    return () => setNextEtapaResolver(null);
  }, [etapas, setNextEtapaResolver]);

  return null;
}