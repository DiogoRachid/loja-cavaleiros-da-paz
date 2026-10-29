import { Loader2 } from "lucide-react";
import { useMp3Playback } from "@/components/harmonia/Mp3PlaybackContext";

export default function SessionAudioPreloadStatus() {
  const { preloadProgress } = useMp3Playback();
  const { total, ready, failed } = preloadProgress;
  if (!total) return null;
  const loading = ready + failed < total;
  return (
    <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{loading ? "Pré-carregando músicas" : "Músicas pré-carregadas"}: {ready} de {total}</span>
      {failed > 0 && <span className="text-destructive">{failed} não preparada(s); o Play tentará carregar normalmente.</span>}
    </div>
  );
}