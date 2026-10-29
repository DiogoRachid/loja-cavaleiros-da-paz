export default function createAudioPreloadEntry(url) {
  const controller = new AbortController();
  let objectUrl = null;
  let prepared = null;
  return {
    status: "queued",
    async load() {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Não foi possível preparar a música.");
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      if (!blob.size) throw new Error("O arquivo de áudio está vazio.");
      objectUrl = URL.createObjectURL(blob);
      prepared = new Audio();
      prepared.preload = "auto";
      prepared.src = objectUrl;
      prepared.load();
    },
    take() {
      if (!objectUrl) return null;
      const audio = prepared || new Audio(objectUrl);
      audio.preload = "auto";
      prepared = null;
      return audio;
    },
    dispose() {
      controller.abort();
      if (prepared) {
        prepared.pause();
        prepared.removeAttribute("src");
        prepared.load();
        prepared = null;
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    },
  };
}