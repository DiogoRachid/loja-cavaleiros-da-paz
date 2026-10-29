import { useEffect, useRef, useState } from "react";
import createSessionAudioCache from "@/lib/createSessionAudioCache";

export default function useSessionAudioPreload(etapas) {
  const cacheRef = useRef(null);
  const [progress, setProgress] = useState({ total: 0, ready: 0, failed: 0 });
  const urlsKey = JSON.stringify([...new Set(etapas.flatMap(etapa =>
    (etapa.tracks || []).map(track => track.file_url).filter(Boolean)
  ))]);

  useEffect(() => {
    const cache = createSessionAudioCache(setProgress);
    cacheRef.current = cache;
    return () => { cache.dispose(); cacheRef.current = null; };
  }, []);

  useEffect(() => {
    cacheRef.current.sync(JSON.parse(urlsKey));
  }, [urlsKey]);

  return { progress, take: url => cacheRef.current?.take(url) || null };
}