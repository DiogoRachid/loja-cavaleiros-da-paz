import { useEffect, useRef, useState } from "react";

export default function useProtecaoBalaustre() {
  const [alterado, setAlterado] = useState(false);
  const revisao = useRef(0);
  const marcar = () => { revisao.current += 1; setAlterado(true); };
  const limpar = () => { revisao.current += 1; setAlterado(false); };
  useEffect(() => {
    if (!alterado) return;
    const avisar = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);
  return { alterado, revisao, marcar, limpar };
}