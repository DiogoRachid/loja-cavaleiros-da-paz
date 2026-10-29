import createAudioPreloadEntry from "@/lib/createAudioPreloadEntry";

export default function createSessionAudioCache(onChange) {
  const entries = new Map();
  let active = 0;
  let closed = false;
  const notify = () => {
    const items = [...entries.values()];
    onChange({ total: items.length, ready: items.filter(e => e.status === "ready").length,
      failed: items.filter(e => e.status === "failed").length });
  };
  const pump = () => {
    while (!closed && active < 3) {
      const entry = [...entries.values()].find(e => e.status === "queued");
      if (!entry) break;
      entry.status = "loading";
      active += 1;
      entry.load().then(() => { entry.status = "ready"; })
        .catch(() => { entry.status = "failed"; })
        .finally(() => {
          active -= 1;
          if (!closed) { notify(); pump(); }
        });
    }
  };
  return {
    sync(urls) {
      const wanted = new Set(urls);
      for (const [url, entry] of entries) {
        if (!wanted.has(url)) { entry.dispose(); entries.delete(url); }
      }
      for (const url of wanted) {
        if (!entries.has(url)) entries.set(url, createAudioPreloadEntry(url));
      }
      notify();
      pump();
    },
    take(url) {
      const entry = entries.get(url);
      return entry?.status === "ready" ? entry.take() : null;
    },
    dispose() {
      closed = true;
      entries.forEach(entry => entry.dispose());
      entries.clear();
    },
  };
}